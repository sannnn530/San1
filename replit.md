# Discord Bot

## Overview

This is a comprehensive Discord bot built with Discord.js v14, featuring over 400+ commands across multiple categories including moderation, tickets, music, games, giveaways, economy, leveling, and utilities. The bot uses MongoDB for data persistence and supports slash commands exclusively.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Framework
- **Discord.js v14**: The bot is built on the latest Discord.js library with full support for slash commands, partials, and all gateway intents
- **Express Server**: A minimal Express server runs on port 3000 to keep the bot alive on hosting platforms like Replit

### Application Structure
- **Entry Point**: `src/index.js` starts the Express server and loads `src/bot.js`
- **Bot Client**: `src/bot.js` initializes the Discord client with comprehensive intents and partials configuration
- **Command Organization**: Commands are organized by category in `src/commands/` subdirectories (afk, announcement, automod, autosetup, birthdays, bot, casino, config, custom-commands, developers, economy, etc.)

### Database Layer
- **MongoDB with Mongoose**: Primary data storage using Mongoose ODM
- **Connection**: Handled in `src/database/connect.js` with automatic reconnection
- **Models**: Extensive schema definitions in `src/database/models/` for features like:
  - User economy (balance, items, timeouts)
  - Server configurations (channels, roles, settings)
  - Moderation (bans, warnings, blacklists)
  - Feature-specific data (birthdays, badges, tickets, giveaways)

### Configuration
- **Environment Variables**: Uses dotenv for sensitive data (MONGO_TOKEN, DISCORD_ID, TOPGG_TOKEN)
- **Bot Config**: `src/config/bot.js` contains colors, Discord settings, and owner information
- **Webhooks**: `src/config/webhooks.json` for logging to Discord channels
- **Emojis**: `src/config/emojis.json` for consistent emoji usage across commands

### Key Features Architecture
- **Economy System**: Full economy with wallet/bank, shop, gambling (blackjack, slots, crash, roulette)
- **Server Stock System**: Each server has unique, randomized stock for items. Prices fluctuate between 70%-150% of base price. Stock auto-restocks over time with randomized quantities. Models: `src/database/models/serverStock.js`, `src/database/models/shopStock.js`
- **Advanced Fishing System**: 52 unique fish across 8 rarity tiers (junk, common, uncommon, rare, epic, legendary, mythical, divine), 60 fishing rods with individual durability tracking, 75 bait types, multi-rod inventory with rod selection, shake & catch mini-games
- **Robbery System**: 3 robbery types (pickpocket/mug/heist) with equipment modifiers (mask, gloves, boots, lock)
- **Automod**: Configurable anti-spam, anti-invite, anti-links with blacklisted words
- **Auto-setup**: Automated channel/role creation for tickets, logs, games, and welcome systems
- **Custom Commands**: Guild-specific custom slash commands stored in database
- **Badge System**: User badge management for developers, supporters, premium users, etc.

### Audio/Voice
- **@discordjs/voice**: Voice connection handling with play-dl for YouTube streaming
- **Music Commands**: Play, pause, skip, queue, nowplaying, loop, shuffle, volume control
- **Soundboard**: Pre-configured sound effects for voice channels
- **Radio Streaming**: Live radio stations playback

### AI Integration
- **Gemini AI**: Powered by Replit AI Integrations (bills to Replit credits, no personal API key needed)
- **Chat Command**: `/fun ai chat` for AI conversations
- **Image Generation**: `/fun ai image` for AI-generated images
- **Chatbot Channel**: Auto-respond to messages in designated AI chatbot channels

### Verification & Security
- **Verification Gate**: Button-based verification for new server members (`/setup verification`)
- **Uses existing Bot_verify button handler**: Integrates with member verification flow

### Social Media Notifications
- **YouTube Alerts**: `/setup youtube` to configure channel notification settings

## External Dependencies

### Core Services
- **MongoDB**: Primary database for all persistent data (connected via MONGO_TOKEN environment variable)
- **Discord API**: Bot functionality through discord.js v14

### Third-Party APIs
- **Top.gg**: Bot listing and voting system (@top-gg/sdk)
- **Google Translate**: Translation functionality (@iamtraction/google-translate)
- **Giphy API**: GIF integration
- **Google GenAI**: AI capabilities (@google/genai)

### Media & Image Processing
- **Canvacord**: Image manipulation for rank cards and welcome images
- **@napi-rs/canvas**: Canvas rendering for image generation
- **discord-image-generation**: Additional image effects

### Utility Libraries
- **axios**: HTTP requests
- **cheerio**: HTML parsing
- **moment/moment-timezone**: Date and time handling
- **mathjs**: Mathematical operations
- **lyrics-finder**: Song lyrics fetching

### Discord-Specific Packages
- **discord-giveaways**: Giveaway management system
- **@haileybot/captcha-generator**: Verification captchas

### Music Streaming
- **play-dl**: YouTube streaming with search and playback
- erela.js-spotify
- erela.js-apple
- erela.js-deezer
- erela.js-facebook