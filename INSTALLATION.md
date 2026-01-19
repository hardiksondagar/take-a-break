# Installation Guide

## Quick Start

### Step 1: Download
Download or clone this repository to your computer.

```bash
git clone https://github.com/yourusername/take-a-break.git
cd take-a-break
```

### Step 2: Open Chrome Extensions
1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** using the toggle in the top-right corner

### Step 3: Load Extension
1. Click **"Load unpacked"** button
2. Select the `take-a-break` folder
3. The extension icon (🌙) should appear in your toolbar!

### Step 4: Configure (Optional)
1. Click the extension icon
2. Adjust settings to your preference:
   - Set your watch duration
   - Configure bedtime hour
   - Enable/disable specific sites
3. Settings save automatically!

## Testing

To quickly test the extension:

1. **Reduce timer**: Set watch duration to 1 minute in settings
2. **Visit YouTube**: Open youtube.com or any supported site
3. **Wait**: After 1 minute, countdown overlay should appear
4. **Test buttons**: Try "Snooze" and "Good night" buttons

## Troubleshooting

### Extension not working?
- ✅ Check that Developer mode is enabled
- ✅ Refresh the streaming site after loading extension
- ✅ Check that the site is in your enabled websites list
- ✅ Make sure "Pause for tonight" is not active

### Timer not triggering?
- ✅ Wait the full configured duration
- ✅ Check Chrome's extension permissions
- ✅ Try reloading the extension: Toggle off/on at `chrome://extensions/`

### Icons not showing?
Icons are included as PNG files. If you need to regenerate:
```bash
./convert-icons.sh
```

## Updating

To update the extension:
1. Pull latest changes: `git pull origin main`
2. Go to `chrome://extensions/`
3. Click the refresh icon on the "Take a Break" card

## Uninstalling

1. Go to `chrome://extensions/`
2. Click **"Remove"** on the Take a Break card
3. All local data will be deleted

---

Need help? Open an issue on GitHub! 🙋‍♂️
