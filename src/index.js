// Polyfill for isJSONEncodable missing in @discordjs/builders - MUST be first!
const path = require('path');

// Polyfill function
const isJSONEncodablePolyfill = (obj) => obj !== null && typeof obj === 'object' && typeof obj.toJSON === 'function';

// Patch top-level @discordjs/builders
const discordjsBuilders = require('@discordjs/builders');
if (!discordjsBuilders.isJSONEncodable) {
    try {
        const discordjsUtil = require('@discordjs/util');
        discordjsBuilders.isJSONEncodable = discordjsUtil.isJSONEncodable || isJSONEncodablePolyfill;
    } catch (e) {
        discordjsBuilders.isJSONEncodable = isJSONEncodablePolyfill;
    }
}

// Patch nested discord.js @discordjs/builders
try {
    const nestedBuildersPath = path.resolve(__dirname, '../node_modules/discord.js/node_modules/@discordjs/builders');
    const nestedBuilders = require(nestedBuildersPath);
    if (!nestedBuilders.isJSONEncodable) {
        nestedBuilders.isJSONEncodable = isJSONEncodablePolyfill;
    }
} catch (e) {}

const express = require('express')
const session = require('express-session')
const app = express()

global.messageLogs = [];
global.commandLogs = [];
global.customLogs = [];
global.botServers = [];
global.botReady = false;
global.botStats = { commands: 0, events: 0 };
global.staffApplications = [];

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = `https://${process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_SLUG + '.' + process.env.REPLIT_OWNER + '.repl.co'}/callback`;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'discord-bot-dashboard-secret-' + Date.now(),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', ready: global.botReady });
});

const PORT = process.env.PORT || 5000;
const server = require('http').createServer(app);
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} in use, bot will continue without web server`);
    }
});
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Web dashboard running on port ${PORT}`);
});

app.get('/login', (req, res) => {
    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
        return res.send('Discord OAuth not configured.');
    }
    const scope = 'identify guilds';
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.redirect('/');

    try {
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            })
        });

        const tokens = await tokenResponse.json();
        if (!tokens.access_token) return res.redirect('/?error=auth_failed');

        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        const user = await userResponse.json();

        const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        const guilds = await guildsResponse.json();

        req.session.user = {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            guilds: guilds
        };

        res.redirect('/');
    } catch (error) {
        res.redirect('/?error=callback_failed');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/api/server/:id', async (req, res) => {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    
    const serverId = req.params.id;
    const userGuild = user.guilds?.find(g => g.id === serverId);
    
    if (!userGuild || !(userGuild.owner || (parseInt(userGuild.permissions) & 0x8))) {
        return res.status(403).json({ error: 'No permission' });
    }
    
    const botServer = global.botServers.find(s => s.id === serverId);
    if (!botServer) return res.status(404).json({ error: 'Bot not in server' });
    
    try {
        const Functions = require('./database/models/functions');
        const settings = await Functions.findOne({ Guild: serverId }) || {};
        
        res.json({
            server: botServer,
            roles: botServer.roles || [],
            settings: {
                prefix: settings.Prefix || '!',
                color: settings.Color || '#00d4ff',
                levels: settings.Levels || false,
                messageLogs: settings.MessageLogs !== false,
                antiSpam: settings.AntiSpam || false,
                antiLinks: settings.AntiLinks || false,
                antiInvite: settings.AntiInvite || false,
                staffAppEnabled: settings.StaffAppEnabled || false,
                staffAppQuestions: settings.StaffAppQuestions || [],
                commandPermissions: settings.CommandPermissions || {}
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to load settings' });
    }
});

app.post('/api/server/:id/settings', async (req, res) => {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    
    const serverId = req.params.id;
    const userGuild = user.guilds?.find(g => g.id === serverId);
    
    if (!userGuild || !(userGuild.owner || (parseInt(userGuild.permissions) & 0x8))) {
        return res.status(403).json({ error: 'No permission' });
    }
    
    try {
        const Functions = require('./database/models/functions');
        const body = req.body;
        
        const updateData = { Guild: serverId };
        
        if (body.prefix !== undefined) updateData.Prefix = body.prefix;
        if (body.color !== undefined) updateData.Color = body.color;
        if (body.levels !== undefined) updateData.Levels = body.levels;
        if (body.messageLogs !== undefined) updateData.MessageLogs = body.messageLogs;
        if (body.modLogs !== undefined) updateData.ModLogs = body.modLogs;
        if (body.welcomeEnabled !== undefined) updateData.WelcomeEnabled = body.welcomeEnabled;
        if (body.leaveEnabled !== undefined) updateData.LeaveEnabled = body.leaveEnabled;
        if (body.logChannel !== undefined) updateData.LogChannel = body.logChannel;
        if (body.antiSpam !== undefined) updateData.AntiSpam = body.antiSpam;
        if (body.antiLinks !== undefined) updateData.AntiLinks = body.antiLinks;
        if (body.antiInvite !== undefined) updateData.AntiInvite = body.antiInvite;
        if (body.antiCaps !== undefined) updateData.AntiCaps = body.antiCaps;
        if (body.antiMassMention !== undefined) updateData.AntiMassMention = body.antiMassMention;
        if (body.staffAppEnabled !== undefined) updateData.StaffAppEnabled = body.staffAppEnabled;
        if (body.staffAppQuestions !== undefined) updateData.StaffAppQuestions = body.staffAppQuestions;
        if (body.commandPermissions !== undefined) updateData.CommandPermissions = body.commandPermissions;
        if (body.djRole !== undefined) updateData.DJRole = body.djRole;
        
        await Functions.findOneAndUpdate(
            { Guild: serverId },
            { $set: updateData },
            { upsert: true, new: true }
        );
        
        console.log('Settings saved for guild:', serverId);
        res.json({ success: true });
    } catch (err) {
        console.error('Failed to save settings:', err);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

app.get('/api/servers/all', (req, res) => {
    res.json(global.botServers.map(s => ({
        id: s.id,
        name: s.name,
        memberCount: s.memberCount,
        icon: s.icon
    })));
});

app.get('/api/server/:id/members', async (req, res) => {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    
    const serverId = req.params.id;
    const userGuild = user.guilds?.find(g => g.id === serverId);
    
    if (!userGuild || !(userGuild.owner || (parseInt(userGuild.permissions) & 0x8))) {
        return res.status(403).json({ error: 'No permission' });
    }
    
    const client = global.discordClient;
    if (!client) return res.status(500).json({ error: 'Bot not ready' });
    
    const guild = client.guilds.cache.get(serverId);
    if (!guild) return res.status(404).json({ error: 'Server not found' });
    
    try {
        await guild.members.fetch();
        const members = guild.members.cache
            .filter(m => !m.user.bot)
            .map(m => ({
                id: m.id,
                username: m.user.username,
                tag: m.user.tag,
                avatar: m.user.avatar,
                nickname: m.nickname,
                roles: m.roles.cache.filter(r => r.id !== guild.id).map(r => r.name).slice(0, 5),
                joinedAt: m.joinedAt,
                isMuted: m.isCommunicationDisabled()
            }))
            .slice(0, 100);
        
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

app.post('/api/server/:id/moderate', async (req, res) => {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    
    const serverId = req.params.id;
    const userGuild = user.guilds?.find(g => g.id === serverId);
    
    if (!userGuild || !(userGuild.owner || (parseInt(userGuild.permissions) & 0x8))) {
        return res.status(403).json({ error: 'No permission' });
    }
    
    const client = global.discordClient;
    if (!client) return res.status(500).json({ error: 'Bot not ready' });
    
    const guild = client.guilds.cache.get(serverId);
    if (!guild) return res.status(404).json({ error: 'Server not found' });
    
    const { action, userId, reason, duration } = req.body;
    
    try {
        const member = await guild.members.fetch(userId).catch(() => null);
        
        const botMember = guild.members.me;
        
        switch (action) {
            case 'kick':
                if (!member) return res.status(404).json({ error: 'Member not found' });
                if (!botMember.permissions.has('KickMembers')) {
                    return res.status(400).json({ error: 'Bot does not have Kick Members permission. Please give the bot this permission in Discord server settings.' });
                }
                if (member.roles.highest.position >= botMember.roles.highest.position) {
                    return res.status(400).json({ error: 'Cannot kick this member - their role is equal or higher than the bot role. Move the bot role higher in Discord server settings.' });
                }
                if (member.id === guild.ownerId) {
                    return res.status(400).json({ error: 'Cannot kick the server owner.' });
                }
                await member.kick(reason || 'Kicked via dashboard');
                return res.json({ success: true, message: 'Member kicked successfully!' });
                
            case 'ban':
                if (!botMember.permissions.has('BanMembers')) {
                    return res.status(400).json({ error: 'Bot does not have Ban Members permission. Please give the bot this permission in Discord server settings.' });
                }
                if (member && member.roles.highest.position >= botMember.roles.highest.position) {
                    return res.status(400).json({ error: 'Cannot ban this member - their role is equal or higher than the bot role.' });
                }
                await guild.members.ban(userId, { reason: reason || 'Banned via dashboard' });
                return res.json({ success: true, message: 'Member banned successfully!' });
                
            case 'unban':
                if (!botMember.permissions.has('BanMembers')) {
                    return res.status(400).json({ error: 'Bot does not have Ban Members permission.' });
                }
                await guild.members.unban(userId);
                return res.json({ success: true, message: 'Member unbanned successfully!' });
                
            case 'mute':
                if (!member) return res.status(404).json({ error: 'Member not found' });
                if (!botMember.permissions.has('ModerateMembers')) {
                    return res.status(400).json({ error: 'Bot does not have Timeout Members permission. Please give the bot this permission in Discord server settings.' });
                }
                if (member.roles.highest.position >= botMember.roles.highest.position) {
                    return res.status(400).json({ error: 'Cannot mute this member - their role is equal or higher than the bot role.' });
                }
                const ms = (duration || 60) * 60 * 1000;
                await member.timeout(ms, reason || 'Muted via dashboard');
                return res.json({ success: true, message: 'Member muted successfully!' });
                
            case 'unmute':
                if (!member) return res.status(404).json({ error: 'Member not found' });
                await member.timeout(null);
                return res.json({ success: true, message: 'Member unmuted' });
                
            case 'warn':
                const Warnings = require('./database/models/warnings');
                await new Warnings({
                    Guild: serverId,
                    User: userId,
                    Reason: reason || 'Warned via dashboard',
                    Moderator: user.id,
                    Date: new Date()
                }).save();
                return res.json({ success: true, message: 'Warning added' });
                
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (err) {
        console.error('Moderation error:', err);
        res.status(500).json({ error: 'Failed to perform action: ' + err.message });
    }
});

app.get('/panel/:serverId', async (req, res) => {
    const user = req.session.user;
    const serverId = req.params.serverId;
    
    if (!user) return res.redirect('/');
    
    const userGuild = user.guilds?.find(g => g.id === serverId);
    const hasPermission = userGuild && (userGuild.owner || (parseInt(userGuild.permissions) & 0x8));
    
    if (!hasPermission) return res.redirect('/');
    
    const botServer = global.botServers.find(s => s.id === serverId);
    if (!botServer) return res.redirect('/');
    
    const Functions = require('./database/models/functions');
    const settings = await Functions.findOne({ Guild: serverId }) || {};
    const StaffApplications = require('./database/models/staffApplications');
    const applications = await StaffApplications.find({ guildId: serverId }).sort({ createdAt: -1 }).limit(50);
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${botServer.name} - Panel</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #eee; min-height: 100vh; }
                .header { background: #0f3460; padding: 15px 30px; display: flex; align-items: center; gap: 15px; border-bottom: 2px solid #00d4ff; }
                .header img { width: 48px; height: 48px; border-radius: 50%; }
                .header h1 { color: #00d4ff; font-size: 20px; }
                .header .back-btn { margin-left: auto; padding: 8px 20px; background: #16213e; color: #00d4ff; text-decoration: none; border-radius: 5px; }
                .container { display: flex; min-height: calc(100vh - 80px); }
                .sidebar { width: 220px; background: #0f3460; padding: 20px; }
                .sidebar a { display: block; padding: 12px 15px; color: #aaa; text-decoration: none; border-radius: 5px; margin-bottom: 5px; transition: all 0.2s; }
                .sidebar a:hover, .sidebar a.active { background: #16213e; color: #00d4ff; }
                .main { flex: 1; padding: 30px; overflow-y: auto; }
                .section { display: none; }
                .section.active { display: block; }
                .card { background: #16213e; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
                .card h2 { color: #00d4ff; margin-bottom: 15px; font-size: 18px; }
                .toggle-group { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #0f3460; }
                .toggle { width: 50px; height: 26px; background: #7f8c8d; border-radius: 13px; cursor: pointer; position: relative; transition: 0.3s; }
                .toggle.active { background: #00d4ff; }
                .toggle::after { content: ''; position: absolute; width: 22px; height: 22px; background: white; border-radius: 50%; top: 2px; left: 2px; transition: 0.3s; }
                .toggle.active::after { left: 26px; }
                input, select, textarea { width: 100%; padding: 12px; background: #0f3460; border: none; border-radius: 5px; color: #eee; margin-top: 8px; }
                select[multiple] { height: 120px; }
                .btn { padding: 12px 25px; background: #00d4ff; color: #1a1a2e; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; }
                .btn:hover { background: #00b8d4; }
                .btn-danger { background: #e74c3c; color: white; }
                .btn-success { background: #2ecc71; color: white; }
                .member-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: #0f3460; border-radius: 5px; margin-bottom: 8px; cursor: pointer; }
                .member-item:hover { background: #1a1a3e; }
                .member-item img { width: 36px; height: 36px; border-radius: 50%; }
                .app-item { background: #0f3460; border-radius: 8px; padding: 15px; margin-bottom: 10px; }
                .app-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                .status-badge { padding: 4px 10px; border-radius: 10px; font-size: 12px; }
                .status-pending { background: #f39c12; }
                .status-approved { background: #2ecc71; }
                .status-rejected { background: #e74c3c; }
                .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                @media (max-width: 768px) { .container { flex-direction: column; } .sidebar { width: 100%; } .grid-3 { grid-template-columns: 1fr; } }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="${botServer.icon ? 'https://cdn.discordapp.com/icons/' + botServer.id + '/' + botServer.icon + '.png' : 'https://cdn.discordapp.com/embed/avatars/0.png'}">
                <h1>${botServer.name}</h1>
                <a href="/" class="back-btn">Back to Dashboard</a>
            </div>
            
            <div class="container">
                <div class="sidebar" id="sidebar">
                    <a href="#" data-section="general" class="active" id="nav-general">General</a>
                    <a href="#" data-section="automod" id="nav-automod">Auto-Mod</a>
                    <a href="#" data-section="moderation" id="nav-moderation">Moderation</a>
                    <a href="#" data-section="permissions" id="nav-permissions">Permissions</a>
                    <a href="#" data-section="staffapp" id="nav-staffapp">Staff Apps</a>
                    <a href="#" data-section="appanswers" id="nav-appanswers">App Answers</a>
                </div>
                
                <div class="main">
                    <div id="general" class="section active">
                        <div class="card">
                            <h2>General Settings</h2>
                            <div class="toggle-group">
                                <span>Welcome Messages</span>
                                <div class="toggle ${settings.WelcomeEnabled ? 'active' : ''}" id="welcomeEnabled"></div>
                            </div>
                            <div class="toggle-group">
                                <span>Leave Messages</span>
                                <div class="toggle ${settings.LeaveEnabled ? 'active' : ''}" id="leaveEnabled"></div>
                            </div>
                            <div class="toggle-group">
                                <span>Moderation Logs</span>
                                <div class="toggle ${settings.ModLogsEnabled !== false ? 'active' : ''}" id="modLogsEnabled"></div>
                            </div>
                            <div class="toggle-group">
                                <span>Message Logs</span>
                                <div class="toggle ${settings.MessageLogsEnabled !== false ? 'active' : ''}" id="messageLogsEnabled"></div>
                            </div>
                            <div style="margin-top: 20px">
                                <label style="color:#00d4ff">Log Channel ID</label>
                                <input type="text" id="logChannel" value="${settings.LogChannel || ''}" placeholder="Enter channel ID">
                            </div>
                            <button class="btn" style="margin-top:15px" id="btnSaveGeneral">Save Settings</button>
                        </div>
                    </div>
                    
                    <div id="automod" class="section">
                        <div class="card">
                            <h2>Auto Moderation</h2>
                            <div class="toggle-group">
                                <span>Anti-Spam</span>
                                <div class="toggle ${settings.AntiSpam ? 'active' : ''}" id="antiSpam"></div>
                            </div>
                            <div class="toggle-group">
                                <span>Anti-Links</span>
                                <div class="toggle ${settings.AntiLinks ? 'active' : ''}" id="antiLinks"></div>
                            </div>
                            <div class="toggle-group">
                                <span>Anti-Invite</span>
                                <div class="toggle ${settings.AntiInvite ? 'active' : ''}" id="antiInvite"></div>
                            </div>
                            <div class="toggle-group">
                                <span>Anti-Caps</span>
                                <div class="toggle ${settings.AntiCaps ? 'active' : ''}" id="antiCaps"></div>
                            </div>
                            <div class="toggle-group">
                                <span>Anti-Mass Mention</span>
                                <div class="toggle ${settings.AntiMassMention ? 'active' : ''}" id="antiMassMention"></div>
                            </div>
                            <button class="btn" style="margin-top:15px" id="btnSaveAutomod">Save Settings</button>
                        </div>
                    </div>
                    
                    <div id="moderation" class="section">
                        <div class="card">
                            <h2>Moderation Panel</h2>
                            <p style="color:#7f8c8d;margin-bottom:15px">Manage server members directly from here.</p>
                            <div style="display:flex;gap:10px;margin-bottom:15px">
                                <input type="text" id="memberSearch" placeholder="Search members..." style="flex:1">
                                <button class="btn" id="btnLoadMembers">Load Members</button>
                            </div>
                            <div id="membersList" style="max-height:400px;overflow-y:auto">
                                <p style="color:#7f8c8d;text-align:center">Click "Load Members" to see server members</p>
                            </div>
                            <div id="modActionPanel" style="display:none;margin-top:20px;padding:20px;background:#0f3460;border-radius:8px">
                                <h3 style="margin-bottom:15px">Action on: <span id="selectedMemberName" style="color:#00d4ff"></span></h3>
                                <input type="hidden" id="selectedMemberId">
                                <div class="grid-3" style="margin-bottom:15px">
                                    <button class="btn" style="background:#f39c12" data-action="kick">Kick</button>
                                    <button class="btn btn-danger" data-action="ban">Ban</button>
                                    <button class="btn" style="background:#9b59b6" data-action="warn">Warn</button>
                                    <button class="btn" style="background:#3498db" data-action="mute">Mute</button>
                                    <button class="btn btn-success" data-action="unmute">Unmute</button>
                                    <button class="btn" style="background:#7f8c8d" id="btnCancelMod">Cancel</button>
                                </div>
                                <label style="color:#00d4ff">Reason</label>
                                <input type="text" id="modReason" placeholder="Enter reason...">
                                <div id="muteDurationDiv" style="margin-top:10px">
                                    <label style="color:#00d4ff">Mute Duration (hours)</label>
                                    <input type="number" id="muteDuration" value="1" min="1" max="672">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="permissions" class="section">
                        <div class="card">
                            <h2>Command Permissions</h2>
                            <p style="color:#7f8c8d;margin-bottom:15px">Set which roles can use specific command groups.</p>
                            <div style="margin-bottom:15px">
                                <label style="color:#00d4ff">Moderation Commands</label>
                                <select multiple id="modRoles">
                                    ${(botServer.roles || []).map(r => '<option value="' + r.id + '"' + ((settings.CommandPermissions?.moderation || []).includes(r.id) ? ' selected' : '') + '>' + r.name + '</option>').join('')}
                                </select>
                            </div>
                            <div style="margin-bottom:15px">
                                <label style="color:#00d4ff">Admin Commands</label>
                                <select multiple id="adminRoles">
                                    ${(botServer.roles || []).map(r => '<option value="' + r.id + '"' + ((settings.CommandPermissions?.admin || []).includes(r.id) ? ' selected' : '') + '>' + r.name + '</option>').join('')}
                                </select>
                            </div>
                            <div style="margin-bottom:15px">
                                <label style="color:#00d4ff">Music Commands</label>
                                <select multiple id="musicRoles">
                                    ${(botServer.roles || []).map(r => '<option value="' + r.id + '"' + ((settings.CommandPermissions?.music || []).includes(r.id) ? ' selected' : '') + '>' + r.name + '</option>').join('')}
                                </select>
                            </div>
                            <div style="margin-bottom:15px">
                                <label style="color:#00d4ff">Economy Commands</label>
                                <select multiple id="economyRoles">
                                    ${(botServer.roles || []).map(r => '<option value="' + r.id + '"' + ((settings.CommandPermissions?.economy || []).includes(r.id) ? ' selected' : '') + '>' + r.name + '</option>').join('')}
                                </select>
                            </div>
                            <div style="margin-bottom:15px">
                                <label style="color:#00d4ff">DJ Role</label>
                                <select id="djRole">
                                    <option value="">None</option>
                                    ${(botServer.roles || []).map(r => '<option value="' + r.id + '"' + (settings.DJRole === r.id ? ' selected' : '') + '>' + r.name + '</option>').join('')}
                                </select>
                            </div>
                            <button class="btn" id="btnSavePermissions">Save Permissions</button>
                        </div>
                    </div>
                    
                    <div id="staffapp" class="section">
                        <div class="card">
                            <h2>Staff Applications</h2>
                            <div class="toggle-group">
                                <span>Enable Staff Applications</span>
                                <div class="toggle ${settings.StaffAppEnabled ? 'active' : ''}" id="staffAppEnabled"></div>
                            </div>
                            <div style="margin-top:15px">
                                <label style="color:#00d4ff">Application Link</label>
                                <input type="text" readonly value="${req.protocol}://${req.get('host')}/apply/${serverId}" id="appLinkInput">
                            </div>
                            <div style="margin-top:15px">
                                <label style="color:#00d4ff">Questions (one per line)</label>
                                <textarea id="staffQuestions" rows="6">${(settings.StaffAppQuestions || ['Why do you want to be staff?', 'How old are you?', 'What experience do you have?']).join('\\n')}</textarea>
                            </div>
                            <button class="btn" style="margin-top:15px" id="btnSaveStaffApp">Save Settings</button>
                        </div>
                    </div>
                    
                    <div id="appanswers" class="section">
                        <div class="card">
                            <h2>Application Answers</h2>
                            <div id="applicationsList">
                                ${applications.length === 0 ? '<p style="color:#7f8c8d;text-align:center">No applications yet</p>' : applications.map(app => `
                                    <div class="app-item">
                                        <div class="app-header">
                                            <div>
                                                <strong style="color:#00d4ff">${app.username}</strong>
                                                <span style="color:#7f8c8d;font-size:12px;margin-left:10px">${new Date(app.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <span class="status-badge status-${app.status}">${app.status}</span>
                                        </div>
                                        <div style="background:#16213e;padding:10px;border-radius:5px;margin-bottom:10px">
                                            ${app.answers.map((a, i) => '<div style="margin-bottom:8px"><div style="color:#00d4ff;font-size:12px">Q: ' + (settings.StaffAppQuestions?.[i] || 'Question ' + (i + 1)) + '</div><div>' + a + '</div></div>').join('')}
                                        </div>
                                        ${app.status === 'pending' ? '<div style="display:flex;gap:10px"><button class="btn btn-success" data-appid="' + app._id + '" data-status="approved">Approve</button><button class="btn btn-danger" data-appid="' + app._id + '" data-status="rejected">Reject</button></div>' : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                const serverId = '${serverId}';
                let allMembers = [];
                
                document.querySelectorAll('#sidebar a').forEach(link => {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        const section = this.dataset.section;
                        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                        document.querySelectorAll('#sidebar a').forEach(a => a.classList.remove('active'));
                        document.getElementById(section).classList.add('active');
                        this.classList.add('active');
                    });
                });
                
                document.querySelectorAll('.toggle').forEach(toggle => {
                    toggle.addEventListener('click', function() {
                        this.classList.toggle('active');
                    });
                });
                
                function getSelectedOptions(id) {
                    return Array.from(document.getElementById(id).selectedOptions).map(o => o.value);
                }
                
                document.getElementById('appLinkInput').addEventListener('click', function() { this.select(); });
                
                async function saveGeneral() {
                    await fetch('/api/server/' + serverId + '/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            welcomeEnabled: document.getElementById('welcomeEnabled').classList.contains('active'),
                            leaveEnabled: document.getElementById('leaveEnabled').classList.contains('active'),
                            modLogs: document.getElementById('modLogsEnabled').classList.contains('active'),
                            messageLogs: document.getElementById('messageLogsEnabled').classList.contains('active'),
                            logChannel: document.getElementById('logChannel').value
                        })
                    });
                    alert('Settings saved!');
                }
                
                async function saveAutomod() {
                    await fetch('/api/server/' + serverId + '/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            antiSpam: document.getElementById('antiSpam').classList.contains('active'),
                            antiLinks: document.getElementById('antiLinks').classList.contains('active'),
                            antiInvite: document.getElementById('antiInvite').classList.contains('active'),
                            antiCaps: document.getElementById('antiCaps').classList.contains('active'),
                            antiMassMention: document.getElementById('antiMassMention').classList.contains('active')
                        })
                    });
                    alert('Auto-mod settings saved!');
                }
                
                async function savePermissions() {
                    await fetch('/api/server/' + serverId + '/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            commandPermissions: {
                                moderation: getSelectedOptions('modRoles'),
                                admin: getSelectedOptions('adminRoles'),
                                music: getSelectedOptions('musicRoles'),
                                economy: getSelectedOptions('economyRoles')
                            },
                            djRole: document.getElementById('djRole').value
                        })
                    });
                    alert('Permissions saved!');
                }
                
                async function saveStaffApp() {
                    const questions = document.getElementById('staffQuestions').value.split('\\n').filter(q => q.trim());
                    await fetch('/api/server/' + serverId + '/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            staffAppEnabled: document.getElementById('staffAppEnabled').classList.contains('active'),
                            staffAppQuestions: questions
                        })
                    });
                    alert('Staff application settings saved!');
                }
                
                async function handleApp(appId, status) {
                    await fetch('/api/application/' + appId, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status })
                    });
                    location.reload();
                }
                
                async function loadMembers() {
                    const list = document.getElementById('membersList');
                    list.innerHTML = '<p style="color:#7f8c8d;text-align:center">Loading...</p>';
                    try {
                        const res = await fetch('/api/server/' + serverId + '/members');
                        allMembers = await res.json();
                        renderMembers();
                    } catch(e) {
                        list.innerHTML = '<p style="color:#e74c3c">Failed to load members</p>';
                    }
                }
                
                function renderMembers() {
                    const search = document.getElementById('memberSearch').value.toLowerCase();
                    const filtered = allMembers.filter(m => m.username.toLowerCase().includes(search) || (m.nickname && m.nickname.toLowerCase().includes(search)));
                    const list = document.getElementById('membersList');
                    if (filtered.length === 0) {
                        list.innerHTML = '<p style="color:#7f8c8d;text-align:center">No members found</p>';
                        return;
                    }
                    list.innerHTML = filtered.map(m => {
                        const avatar = m.avatar ? 'https://cdn.discordapp.com/avatars/' + m.id + '/' + m.avatar + '.png?size=36' : 'https://cdn.discordapp.com/embed/avatars/0.png';
                        const muted = m.isMuted ? '<span style="color:#e74c3c;font-size:10px;margin-left:5px">[MUTED]</span>' : '';
                        return '<div class="member-item" data-id="' + m.id + '" data-name="' + m.username.replace(/"/g, '') + '"><img src="' + avatar + '"><div><div style="color:#00d4ff;font-weight:bold">' + m.username + muted + '</div><div style="color:#7f8c8d;font-size:11px">' + (m.roles.length > 0 ? m.roles.join(', ') : 'No roles') + '</div></div></div>';
                    }).join('');
                    
                    document.querySelectorAll('.member-item').forEach(item => {
                        item.addEventListener('click', function() {
                            document.getElementById('selectedMemberId').value = this.dataset.id;
                            document.getElementById('selectedMemberName').textContent = this.dataset.name;
                            document.getElementById('modActionPanel').style.display = 'block';
                            document.getElementById('modReason').value = '';
                        });
                    });
                }
                
                document.getElementById('memberSearch').addEventListener('input', renderMembers);
                
                function closeModPanel() {
                    document.getElementById('modActionPanel').style.display = 'none';
                }
                
                async function performModAction(action) {
                    const userId = document.getElementById('selectedMemberId').value;
                    const reason = document.getElementById('modReason').value;
                    const duration = document.getElementById('muteDuration').value;
                    
                    if (!confirm('Are you sure you want to ' + action + ' this member?')) return;
                    
                    try {
                        const res = await fetch('/api/server/' + serverId + '/moderate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action, userId, reason, duration: parseInt(duration) })
                        });
                        const data = await res.json();
                        if (data.success) {
                            alert(data.message);
                            closeModPanel();
                            loadMembers();
                        } else {
                            alert('Error: ' + (data.error || 'Unknown error'));
                        }
                    } catch(e) {
                        alert('Failed to perform action');
                    }
                }
                
                document.getElementById('btnSaveGeneral').addEventListener('click', saveGeneral);
                document.getElementById('btnSaveAutomod').addEventListener('click', saveAutomod);
                document.getElementById('btnSavePermissions').addEventListener('click', savePermissions);
                document.getElementById('btnSaveStaffApp').addEventListener('click', saveStaffApp);
                document.getElementById('btnLoadMembers').addEventListener('click', loadMembers);
                document.getElementById('btnCancelMod').addEventListener('click', closeModPanel);
                document.getElementById('memberSearch').addEventListener('input', renderMembers);
                
                document.querySelectorAll('[data-action]').forEach(btn => {
                    btn.addEventListener('click', function() {
                        performModAction(this.dataset.action);
                    });
                });
                
                document.querySelectorAll('[data-appid]').forEach(btn => {
                    btn.addEventListener('click', async function() {
                        const appId = this.dataset.appid;
                        const status = this.dataset.status;
                        await fetch('/api/application/' + appId, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status })
                        });
                        location.reload();
                    });
                });
            </script>
        </body>
        </html>
    `);
});

app.get('/apply/:serverId', async (req, res) => {
    const user = req.session.user;
    const serverId = req.params.serverId;
    const botServer = global.botServers.find(s => s.id === serverId);
    
    if (!botServer) return res.send('Server not found');
    
    try {
        const Functions = require('./database/models/functions');
        const settings = await Functions.findOne({ Guild: serverId });
        
        if (!settings?.StaffAppEnabled) {
            return res.send('Staff applications are not enabled for this server.');
        }
        
        const questions = settings.StaffAppQuestions || ['Why do you want to be staff?', 'How old are you?', 'What experience do you have?'];
        
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Staff Application - ${botServer.name}</title>
                <style>
                    * { box-sizing: border-box; }
                    body { font-family: monospace; background: #1a1a2e; color: #eee; padding: 20px; margin: 0; min-height: 100vh; }
                    .container { max-width: 600px; margin: 0 auto; }
                    h1 { color: #00d4ff; }
                    .server-info { background: #16213e; padding: 20px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px; }
                    .server-icon { width: 64px; height: 64px; border-radius: 50%; background: #0f3460; display: flex; align-items: center; justify-content: center; font-size: 24px; }
                    .form-group { margin-bottom: 20px; }
                    .form-group label { display: block; color: #00d4ff; margin-bottom: 8px; }
                    .form-group textarea { width: 100%; padding: 12px; border: none; border-radius: 5px; background: #16213e; color: #eee; min-height: 100px; resize: vertical; }
                    .form-group input { width: 100%; padding: 12px; border: none; border-radius: 5px; background: #16213e; color: #eee; }
                    .submit-btn { width: 100%; padding: 15px; background: #00d4ff; color: #1a1a2e; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 16px; }
                    .submit-btn:hover { background: #00b8d4; }
                    .login-notice { background: #f39c12; color: #1a1a2e; padding: 15px; border-radius: 5px; text-align: center; margin-bottom: 20px; }
                    .login-notice a { color: #1a1a2e; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Staff Application</h1>
                    <div class="server-info">
                        <div class="server-icon">${botServer.name.charAt(0)}</div>
                        <div>
                            <h2 style="margin:0;color:#00d4ff">${botServer.name}</h2>
                            <p style="margin:5px 0 0;color:#7f8c8d">${botServer.memberCount} members</p>
                        </div>
                    </div>
                    
                    ${!user ? `<div class="login-notice">Please <a href="/login">login with Discord</a> to submit your application.</div>` : ''}
                    
                    <form action="/apply/${serverId}/submit" method="POST" ${!user ? 'style="opacity:0.5;pointer-events:none"' : ''}>
                        ${questions.map((q, i) => `
                            <div class="form-group">
                                <label>${q}</label>
                                <textarea name="answer_${i}" required placeholder="Your answer..."></textarea>
                            </div>
                        `).join('')}
                        
                        <div class="form-group">
                            <label>Additional Information (optional)</label>
                            <textarea name="additional" placeholder="Anything else you'd like to add..."></textarea>
                        </div>
                        
                        <button type="submit" class="submit-btn">Submit Application</button>
                    </form>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        res.send('Error loading application form');
    }
});

app.post('/apply/:serverId/submit', async (req, res) => {
    const user = req.session.user;
    if (!user) return res.redirect('/login');
    
    const serverId = req.params.serverId;
    const botServer = global.botServers.find(s => s.id === serverId);
    if (!botServer) return res.send('Server not found');
    
    try {
        const Functions = require('./database/models/functions');
        const StaffApplications = require('./database/models/staffApplications');
        const settings = await Functions.findOne({ Guild: serverId });
        const questions = settings?.StaffAppQuestions || ['Why do you want to be staff?', 'How old are you?', 'What experience do you have?'];
        
        const answers = questions.map((q, i) => req.body[`answer_${i}`] || '');
        
        await StaffApplications.create({
            guildId: serverId,
            guildName: botServer.name,
            userId: user.id,
            username: user.username,
            avatar: user.avatar,
            answers,
            additional: req.body.additional || '',
            status: 'pending'
        });
        
        console.log('Application submitted for guild:', serverId, 'by user:', user.username);
        
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Application Submitted</title>
                <style>
                    body { font-family: monospace; background: #1a1a2e; color: #eee; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                    .success { text-align: center; background: #16213e; padding: 40px; border-radius: 12px; }
                    h1 { color: #2ecc71; }
                    p { color: #7f8c8d; }
                    a { color: #00d4ff; }
                </style>
            </head>
            <body>
                <div class="success">
                    <h1>Application Submitted!</h1>
                    <p>Your staff application for ${botServer.name} has been submitted successfully.</p>
                    <p>The server admins will review your application.</p>
                    <a href="/">Return to Dashboard</a>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        res.send('Error submitting application');
    }
});

app.get('/api/applications/:serverId', async (req, res) => {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    
    const serverId = req.params.serverId;
    const userGuild = user.guilds?.find(g => g.id === serverId);
    
    if (!userGuild || !(userGuild.owner || (parseInt(userGuild.permissions) & 0x8))) {
        return res.status(403).json({ error: 'No permission' });
    }
    
    const StaffApplications = require('./database/models/staffApplications');
    const apps = await StaffApplications.find({ guildId: serverId }).sort({ createdAt: -1 });
    res.json(apps);
});

app.post('/api/application/:appId', async (req, res) => {
    const user = req.session.user;
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    
    const { appId } = req.params;
    const { status } = req.body;
    
    const StaffApplications = require('./database/models/staffApplications');
    const app = await StaffApplications.findById(appId);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    
    const userGuild = user.guilds?.find(g => g.id === app.guildId);
    if (!userGuild || !(userGuild.owner || (parseInt(userGuild.permissions) & 0x8))) {
        return res.status(403).json({ error: 'No permission' });
    }
    
    app.status = status;
    await app.save();
    
    console.log('Application', appId, 'updated to:', status);
    res.json({ success: true });
});

app.get('/', function(req, res) {
    if (req.query.health === 'check' || req.headers['user-agent']?.includes('health') || req.headers['user-agent']?.includes('kube')) {
        return res.status(200).send('OK');
    }
    const accept = req.headers['accept'] || '';
    if (!accept.includes('text/html')) {
        return res.status(200).send('OK');
    }
    
    const user = req.session.user;

    if (!global.botReady) {
        return res.status(200).send(`<!DOCTYPE html><html><head><title>Loading</title><meta http-equiv="refresh" content="2"><style>body{font-family:sans-serif;background:#1a1a2e;color:#eee;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}h1{color:#00d4ff}</style></head><body><h1>Loading bot...</h1></body></html>`);
    }

    if (!user) {
        return res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Discord Bot Dashboard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1, h2 { color: #00d4ff; }
        .login-box { text-align: center; background: #16213e; padding: 40px; border-radius: 12px; max-width: 400px; margin: 40px auto; }
        .login-btn { display: inline-block; background: #5865F2; color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px; }
        .login-btn:hover { background: #4752c4; }
        .stats { display: flex; gap: 15px; justify-content: center; margin: 30px 0; flex-wrap: wrap; }
        .stat { background: #16213e; padding: 20px 30px; border-radius: 8px; text-align: center; }
        .stat-num { color: #00d4ff; font-size: 28px; font-weight: bold; display: block; }
        .servers { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-top: 20px; }
        .server { background: #16213e; padding: 15px; border-radius: 8px; display: flex; align-items: center; gap: 12px; }
        .server-icon { width: 48px; height: 48px; border-radius: 50%; background: #0f3460; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #00d4ff; }
        .server-name { color: #00d4ff; font-weight: bold; }
        .server-info { color: #7f8c8d; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="login-box">
            <h1>Discord Bot Dashboard</h1>
            <p style="color:#7f8c8d;margin-top:10px">Login to manage your servers</p>
            <a href="/login" class="login-btn">Login with Discord</a>
        </div>
        <div class="stats">
            <div class="stat"><span class="stat-num">${global.botServers.length}</span>Servers</div>
            <div class="stat"><span class="stat-num">${global.botStats.commands}</span>Commands</div>
            <div class="stat"><span class="stat-num">${global.botStats.events}</span>Events</div>
        </div>
        <h2>All Bot Servers</h2>
        <div class="servers">
            ${global.botServers.map(s => `
                <div class="server">
                    <div class="server-icon">${s.name.charAt(0)}</div>
                    <div>
                        <div class="server-name">${s.name}</div>
                        <div class="server-info">${s.memberCount} members</div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`);
    }

    const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/0.png`;
    const ownedGuilds = (user.guilds || []).filter(g => g.owner || (parseInt(g.permissions) & 0x8));
    const botGuildIds = global.botServers.map(s => s.id);
    const managedServers = ownedGuilds.filter(g => botGuildIds.includes(g.id));

    res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh; }
        .header { background: #0f3460; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .header h1 { color: #00d4ff; font-size: 20px; }
        .user { display: flex; align-items: center; gap: 10px; }
        .user img { width: 36px; height: 36px; border-radius: 50%; }
        .user-name { color: #00d4ff; }
        .logout { background: #e74c3c; color: white; padding: 8px 15px; border-radius: 5px; text-decoration: none; font-size: 12px; }
        .main { padding: 20px; max-width: 1400px; margin: 0 auto; }
        .tabs { display: flex; gap: 5px; margin-bottom: 20px; flex-wrap: wrap; background: #16213e; padding: 10px; border-radius: 8px; }
        .tab { padding: 10px 20px; background: transparent; border: none; color: #7f8c8d; border-radius: 5px; cursor: pointer; font-size: 14px; }
        .tab:hover { background: #0f3460; color: #eee; }
        .tab.active { background: #00d4ff; color: #1a1a2e; font-weight: bold; }
        .panel { display: none; }
        .panel.active { display: block; }
        h2 { color: #00d4ff; margin-bottom: 15px; }
        .stats { display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; }
        .stat { background: #16213e; padding: 20px; border-radius: 8px; text-align: center; min-width: 120px; }
        .stat-num { color: #00d4ff; font-size: 24px; font-weight: bold; display: block; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
        .card { background: #16213e; padding: 20px; border-radius: 8px; border-left: 4px solid #00d4ff; }
        .card-title { color: #00d4ff; font-weight: bold; font-size: 16px; margin-bottom: 5px; }
        .card-info { color: #7f8c8d; font-size: 13px; margin-bottom: 10px; }
        .card-badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 11px; margin-right: 5px; }
        .badge-owner { background: #f39c12; color: #1a1a2e; }
        .badge-admin { background: #3498db; color: white; }
        .btn { display: inline-block; padding: 8px 16px; border-radius: 5px; text-decoration: none; font-size: 13px; font-weight: bold; cursor: pointer; border: none; }
        .btn-primary { background: #00d4ff; color: #1a1a2e; }
        .btn-secondary { background: #0f3460; color: #00d4ff; }
        .btn:hover { opacity: 0.9; }
        .card-actions { display: flex; gap: 8px; margin-top: 12px; }
        .all-server { background: #16213e; padding: 12px; border-radius: 8px; display: flex; align-items: center; gap: 12px; }
        .server-icon { width: 40px; height: 40px; border-radius: 50%; background: #0f3460; display: flex; align-items: center; justify-content: center; color: #00d4ff; font-weight: bold; }
        .log { background: #0f3460; padding: 10px; border-radius: 5px; margin-bottom: 8px; font-size: 13px; }
        .log-author { color: #f1c40f; }
        .log-cmd { color: #2ecc71; }
        .log-channel { color: #3498db; }
        .section { background: #16213e; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .no-servers { color: #7f8c8d; text-align: center; padding: 40px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Dashboard</h1>
        <div class="user">
            <img src="${avatarUrl}" alt="">
            <span class="user-name">${user.username}</span>
            <a href="/logout" class="logout">Logout</a>
        </div>
    </div>
    
    <div class="main">
        <div class="tabs">
            <button class="tab active" data-tab="overview">Overview</button>
            <button class="tab" data-tab="myservers">My Servers</button>
            <button class="tab" data-tab="allservers">All Bot Servers</button>
            <button class="tab" data-tab="logs">Logs</button>
        </div>
        
        <div id="overview" class="panel active">
            <div class="stats">
                <div class="stat"><span class="stat-num">${global.botServers.length}</span>Servers</div>
                <div class="stat"><span class="stat-num">${global.botStats.commands}</span>Commands</div>
                <div class="stat"><span class="stat-num">${global.botStats.events}</span>Events</div>
                <div class="stat"><span class="stat-num">${managedServers.length}</span>Your Servers</div>
            </div>
            
            <div class="section">
                <h2>Quick Access - Your Managed Servers</h2>
                ${managedServers.length === 0 ? '<p class="no-servers">No servers to manage. Add the bot to a server where you are admin.</p>' : `
                <div class="grid">
                    ${managedServers.slice(0, 6).map(g => {
                        const botData = global.botServers.find(s => s.id === g.id);
                        return `
                        <div class="card">
                            <div class="card-title">${g.name}</div>
                            <div class="card-info">${botData?.memberCount || 0} members</div>
                            <span class="card-badge ${g.owner ? 'badge-owner' : 'badge-admin'}">${g.owner ? 'Owner' : 'Admin'}</span>
                            <div class="card-actions">
                                <a href="/panel/${g.id}" class="btn btn-primary">Open Panel</a>
                            </div>
                        </div>`;
                    }).join('')}
                </div>`}
            </div>
            
            <div class="section">
                <h2>Recent Commands</h2>
                ${(global.commandLogs || []).length === 0 ? '<p style="color:#7f8c8d">No commands logged yet</p>' : 
                (global.commandLogs || []).slice(-5).reverse().map(l => `<div class="log"><span class="log-author">${l.author}</span> used <span class="log-cmd">${l.command}</span> in <span class="log-channel">#${l.channel}</span></div>`).join('')}
            </div>
        </div>
        
        <div id="myservers" class="panel">
            <h2>Your Servers (Owner/Admin)</h2>
            ${ownedGuilds.length === 0 ? '<p class="no-servers">No servers where you are owner or admin</p>' : `
            <div class="grid">
                ${ownedGuilds.map(g => {
                    const inBot = botGuildIds.includes(g.id);
                    const botData = global.botServers.find(s => s.id === g.id);
                    return `
                    <div class="card" style="border-left-color: ${inBot ? '#2ecc71' : '#7f8c8d'}; ${inBot ? '' : 'opacity: 0.6'}">
                        <div class="card-title">${g.name}</div>
                        <div class="card-info">${inBot ? (botData?.memberCount || 0) + ' members' : 'Bot not in server'}</div>
                        <span class="card-badge ${g.owner ? 'badge-owner' : 'badge-admin'}">${g.owner ? 'Owner' : 'Admin'}</span>
                        ${inBot ? `<div class="card-actions"><a href="/panel/${g.id}" class="btn btn-primary">Open Panel</a></div>` : ''}
                    </div>`;
                }).join('')}
            </div>`}
        </div>
        
        <div id="allservers" class="panel">
            <h2>All Bot Servers (${global.botServers.length})</h2>
            <div class="grid">
                ${global.botServers.map(s => `
                    <div class="all-server">
                        <div class="server-icon">${s.name.charAt(0)}</div>
                        <div>
                            <div class="card-title">${s.name}</div>
                            <div class="card-info">${s.memberCount} members</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div id="logs" class="panel">
            <div class="section" style="margin-bottom:20px">
                <h2>Log Filters</h2>
                <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
                    <input type="text" id="logSearch" placeholder="Search by user or command..." style="padding:10px;background:#0f3460;border:none;border-radius:5px;color:#eee;width:200px">
                    <select id="logType" style="padding:10px;background:#0f3460;border:none;border-radius:5px;color:#eee">
                        <option value="all">All Types</option>
                        <option value="commands">Commands Only</option>
                        <option value="messages">Messages Only</option>
                    </select>
                    <select id="logServer" style="padding:10px;background:#0f3460;border:none;border-radius:5px;color:#eee">
                        <option value="">All Servers</option>
                        ${global.botServers.map(s => '<option value="' + s.name + '">' + s.name + '</option>').join('')}
                    </select>
                    <button id="btnFilter" style="padding:10px 20px;background:#00d4ff;border:none;border-radius:5px;color:#1a1a2e;font-weight:bold;cursor:pointer">Filter</button>
                    <button id="btnClearFilter" style="padding:10px 20px;background:#7f8c8d;border:none;border-radius:5px;color:white;cursor:pointer">Clear</button>
                </div>
            </div>
            <div class="section" id="commandLogsSection">
                <h2>Command Logs (${(global.commandLogs || []).length})</h2>
                <div id="commandLogsList">
                ${(global.commandLogs || []).length === 0 ? '<p style="color:#7f8c8d">No commands logged</p>' :
                (global.commandLogs || []).slice(-30).reverse().map(l => `<div class="log" data-author="${l.author}" data-cmd="${l.command}" data-server="${l.guild}"><span class="log-author">${l.author}</span> used <span class="log-cmd">${l.command}</span> in <span class="log-channel">#${l.channel}</span> <span style="color:#7f8c8d">(${l.guild})</span></div>`).join('')}
                </div>
            </div>
            <div class="section" id="messageLogsSection">
                <h2>Message Logs (${(global.messageLogs || []).length})</h2>
                <div id="messageLogsList">
                ${(global.messageLogs || []).length === 0 ? '<p style="color:#7f8c8d">No messages logged</p>' :
                (global.messageLogs || []).slice(-20).reverse().map(l => `<div class="log" data-author="${l.author}" data-content="${(l.content || '').replace(/"/g, '')}" data-server="${l.guild}"><span class="log-author">${l.author}</span>: "${(l.content || '').substring(0, 60)}${l.content?.length > 60 ? '...' : ''}" in <span class="log-channel">#${l.channel}</span> <span style="color:#7f8c8d">(${l.guild})</span></div>`).join('')}
                </div>
            </div>
        </div>
    </div>
    
    <script>
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
                this.classList.add('active');
                document.getElementById(this.dataset.tab).classList.add('active');
            });
        });
        
        // Log filter functionality
        document.getElementById('btnFilter')?.addEventListener('click', function() {
            const search = document.getElementById('logSearch').value.toLowerCase();
            const type = document.getElementById('logType').value;
            const server = document.getElementById('logServer').value;
            
            const cmdSection = document.getElementById('commandLogsSection');
            const msgSection = document.getElementById('messageLogsSection');
            
            // Show/hide sections based on type filter
            if (type === 'messages') {
                cmdSection.style.display = 'none';
                msgSection.style.display = 'block';
            } else if (type === 'commands') {
                cmdSection.style.display = 'block';
                msgSection.style.display = 'none';
            } else {
                cmdSection.style.display = 'block';
                msgSection.style.display = 'block';
            }
            
            // Filter command logs
            document.querySelectorAll('#commandLogsList .log').forEach(log => {
                const author = (log.dataset.author || '').toLowerCase();
                const cmd = (log.dataset.cmd || '').toLowerCase();
                const srv = log.dataset.server || '';
                
                const matchSearch = !search || author.includes(search) || cmd.includes(search);
                const matchServer = !server || srv === server;
                
                log.style.display = (matchSearch && matchServer) ? 'block' : 'none';
            });
            
            // Filter message logs
            document.querySelectorAll('#messageLogsList .log').forEach(log => {
                const author = (log.dataset.author || '').toLowerCase();
                const content = (log.dataset.content || '').toLowerCase();
                const srv = log.dataset.server || '';
                
                const matchSearch = !search || author.includes(search) || content.includes(search);
                const matchServer = !server || srv === server;
                
                log.style.display = (matchSearch && matchServer) ? 'block' : 'none';
            });
        });
        
        document.getElementById('btnClearFilter')?.addEventListener('click', function() {
            document.getElementById('logSearch').value = '';
            document.getElementById('logType').value = 'all';
            document.getElementById('logServer').value = '';
            
            document.getElementById('commandLogsSection').style.display = 'block';
            document.getElementById('messageLogsSection').style.display = 'block';
            
            document.querySelectorAll('#commandLogsList .log, #messageLogsList .log').forEach(log => {
                log.style.display = 'block';
            });
        });
    </script>
</body>
</html>`);
})

require("./bot.js")
