# 🌙 Take a Break

A friendly Chrome extension that helps you get better sleep by gently reminding you to stop binge-watching late at night.

**Install:** [Chrome Web Store](https://chromewebstore.google.com/detail/take-a-break/ehhhemnkemficpheoidniabkoohmolaj)

## ✨ Features

### Auto Wind-Down Timer
- Monitors your watch time on streaming sites
- Shows a friendly countdown when it's time to rest
- **Snooze**: "Just 30 more minutes..." button adds extra time
- **Good night**: Gracefully closes the tab
- Auto-closes if no response after countdown

### Midnight Reminder
- Gentle toast notification after your bedtime
- No auto-close, just a friendly nudge
- Customizable bedtime hour

### Fully Configurable
- **Watch Duration**: 30 min - 4 hours (default: 90 min)
- **Countdown Warning**: 5-30 seconds (default: 10 sec)
- **Snooze Duration**: 15 min - 1 hour (default: 30 min)
- **Bedtime Hour**: Set your personal bedtime
- **Monitored Websites**: Enable/disable default sites, add custom domains

### Supported Streaming Sites

**Global:**
- Netflix
- Prime Video
- Disney+
- Hulu
- HBO Max / Max
- YouTube
- Apple TV+
- Peacock
- Paramount+
- Crunchyroll

**India:**
- Disney+ Hotstar
- JioCinema
- SonyLIV
- ZEE5
- Voot
- MX Player
- ALTBalaji
- Eros Now
- Sun NXT
- Hoichoi (Bengali)
- Aha (Telugu/Tamil)
- Chaupal (Punjabi/Haryanvi)
- ShemarooMe

## 🚀 Installation

### From Source (Developer Mode)

1. **Clone or Download** this repository
   ```bash
  git clone https://github.com/hardiksondagar/take-a-break.git
   cd take-a-break
   ```

2. **Convert Icons** (if needed)
   ```bash
   # Icons are already included as PNG
   # If you need to regenerate from SVG:
   ./convert-icons.sh
   ```

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `take-a-break` folder
   - The extension is now active! 🎉

### From Chrome Web Store
[Install on Chrome Web Store](https://chromewebstore.google.com/detail/take-a-break/ehhhemnkemficpheoidniabkoohmolaj)

## 🎨 How It Works

1. **Visit a streaming site** - Timer starts automatically
2. **Watch your content** - Enjoy your show!
3. **After configured time** - Countdown overlay appears
4. **Choose your action:**
   - Click "Just 30 more minutes..." to snooze
   - Click "Good night! 😴" to close tab
   - Do nothing - tab closes automatically after countdown

## ⚙️ Configuration

Click the extension icon to open settings:

### Timer Settings
- Adjust how long you can watch before the reminder
- Customize countdown duration
- Set snooze time that works for you

### Bedtime Mode
- Enable/disable midnight reminders
- Set your personal bedtime hour
- Get gentle nudges without forced closures

### Websites
- **Default tab**: Toggle built-in streaming sites
- **Custom tab**: Add your own domains
  - Format: `example.com` (no http:// or www)

### Quick Actions
- **Pause for tonight**: Temporarily disable monitoring
- View current watch status

## 🎯 Use Cases

- **Prevent accidental all-nighters** while binge-watching
- **Build healthier sleep habits** with gentle reminders
- **Save battery** by auto-closing forgotten tabs
- **Improve next-day productivity** with better sleep

## 🛠️ Technical Details

- **Manifest Version**: V3 (latest Chrome extension standard)
- **Permissions**: `storage`, `tabs`, `alarms`
- **Architecture**:
  - Service Worker for reliable background timers
  - Content Scripts for UI injection
  - Chrome Storage API for persistence
- **Performance**: Minimal CPU usage with Chrome Alarms API
- **Privacy**: All data stored locally, no external connections

## 📝 Development

### Project Structure
```
take-a-break/
├── manifest.json           # Extension configuration
├── background.js           # Service worker (timer logic)
├── content.js              # Content script (UI injection)
├── popup/
│   ├── popup.html          # Settings UI
│   ├── popup.css           # Popup styles
│   └── popup.js            # Popup logic
├── styles/
│   └── overlay.css         # Overlay & toast styles
├── icons/
│   ├── icon16.png          # Extension icon (small)
│   ├── icon48.png          # Extension icon (medium)
│   └── icon128.png         # Extension icon (large)
└── README.md
```

### Testing
1. Load extension in Chrome
2. Visit a supported streaming site (e.g., youtube.com)
3. Reduce watch duration to 1 minute in settings
4. Wait for countdown overlay to appear
5. Test snooze and dismiss buttons
6. Test midnight reminder by setting bedtime to current hour

### Adding New Websites
1. Open `popup.js`
2. Add to `DEFAULT_WEBSITES` array:
   ```javascript
   { domain: 'example.com', name: 'Example Streaming', enabled: true }
   ```
3. Update `manifest.json` to include new domain in permissions

## 🌟 Philosophy

We believe technology should serve our wellbeing, not disrupt it. Take a Break uses:
- **Friendly language** instead of harsh warnings
- **Gentle nudges** rather than forced actions
- **User control** with snooze and customization
- **Empathy** in copy: "Your bed misses you" 🛏️

## 🤝 Contributing

Contributions are welcome! Whether it's:
- Adding new streaming sites
- Improving UI/UX
- Fixing bugs
- Translating to other languages

## 📄 License

MIT License - feel free to use and modify!

## 💬 Feedback

Found a bug? Have a feature request? Your future self will thank you for reporting it!

---

**Sleep well, stream better ✨**

Made with 🌙 for night owls who want to become early birds
