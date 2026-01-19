# Changelog

All notable changes to the Take a Break extension will be documented in this file.

## [1.0.0] - 2026-01-19

### 🎉 Initial Release

#### Features
- **Auto Wind-Down Timer**: Monitors streaming sites and shows friendly countdown overlay
- **Midnight Reminder**: Gentle toast notification after bedtime (no auto-close)
- **Snooze Functionality**: "Just 30 more minutes..." button adds extra time
- **Configurable Settings**:
  - Watch duration (30 min - 4 hours)
  - Countdown warning (5-30 seconds)
  - Snooze duration (15 min - 1 hour)
  - Bedtime hour customization
- **Website Management**:
  - 25+ default streaming sites (global + India)
  - Custom domain support
  - Per-site enable/disable toggles
- **Pause for Tonight**: Temporary disable monitoring for current session
- **Beautiful UI**: Calming purple/blue gradient theme with smooth animations

#### Supported Sites
- **Global**: Netflix, Prime Video, Disney+, Hulu, HBO Max, YouTube, Apple TV+, and more
- **India**: Hotstar, JioCinema, SonyLIV, ZEE5, Voot, MX Player, and more

#### Technical
- Manifest V3 compliance
- Service Worker architecture for reliable timers
- Chrome Storage API for settings persistence
- Minimal performance impact with Alarms API
- Full accessibility support

---

**Friendly reminder**: Your bed misses you! 🛏️✨
