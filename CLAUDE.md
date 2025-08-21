# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Architecture Overview

**Sinkin** is a meditation music combination app built with Next.js 15 and React 19. The app allows users to combine different ambient sounds and music for meditation.

### Key Features
- Audio combination and playback
- Global volume control with mute
- Preset management (save/load combinations)
- Countdown timer with alarm functionality
- Multi-language support (Chinese, English, Japanese)
- Responsive design for mobile and desktop

### Core Components

**Context Providers (src/app/context/):**
- `AudioContext.js` - Manages global audio state, volume, and player registration
- `ConfigContext.jsx` - Handles app configuration
- `I18nContext.jsx` - Internationalization support

**Main Components (src/app/components/):**
- `audioItem.js` - Individual audio player with volume control
- `Header.jsx` - Navigation with timer and controls
- `CountdownTimer.jsx` - Timer with alarm functionality
- `GlobalVolumeControl.js` - Global volume slider and mute
- `PresetManager.jsx` - Save/load audio combinations
- `BackgroundColorManager.jsx` - Dynamic background theming

### Audio System
- Uses native Web Audio API via HTML5 Audio elements
- Audio files loaded from configurable remote URLs
- Individual audio items register with global AudioContext
- Supports combination saving/loading via preset system
- Alarm functionality prevents other audio playback when active

### Configuration
- Audio sources configured via `public/config.json`
- Supports local file overrides and remote audio hosting
- Icons automatically matched to audio files in `public/icons/`

### File Structure
```
src/
├── app/
│   ├── components/          # React components
│   ├── context/            # React contexts
│   ├── utils/              # Utility functions
│   ├── layout.js           # Root layout
│   └── page.js             # Home page
├── constant/               # Constants
└── public/                 # Static assets
    ├── icons/              # Audio item icons
    ├── svgs/               # UI icons
    └── config.json         # Audio configuration
```

### Key Implementation Patterns
- Audio items use memoization for performance
- Context providers manage cross-component state
- Responsive design with mobile/desktop variants
- Error handling for audio loading and playback
- Combination system for preset management