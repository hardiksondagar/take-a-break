# Watch Time Display Feature

## New Features Added ✨

### 1. Badge on Extension Icon
- Shows elapsed watch time for the active tab: **"2m"**, **"45m"**, etc.
- Updates every minute automatically
- Purple badge color (#8b5cf6)
- If multiple tabs are being monitored but none is active, shows count: **"3"** (3 tabs)

### 2. Active Timers in Popup
- New section in popup showing all active watch sessions
- Displays:
  - Site name (extracted from URL)
  - Elapsed time in minutes
  - Snoozed indicator (💤) if snoozed
- Updates every 10 seconds while popup is open
- Only visible when there are active timers
- Beautiful purple-themed box matching the extension style

## How It Works

### Badge Behavior
1. **Active streaming tab**: Shows watch time (e.g., "2m")
2. **Multiple tabs, none active**: Shows count of monitored tabs
3. **No active timers**: Badge is hidden

### Popup Display
```
⏱️ Active Watch Sessions
┌─────────────────────────┐
│ Netflix        15 min   │
│ Youtube        8 min 💤 │
└─────────────────────────┘
```

## Technical Details

### Background.js Changes
- Added `updateBadge()` function
- Stores URL with each timer for display
- New message handler: `getAllTimers` for popup
- Updates badge on:
  - Timer start/stop
  - Tab switch
  - Window focus change
  - Every 60 seconds

### Popup Changes
- New HTML section for active timers
- CSS styling for timer display
- JavaScript to fetch and render timers
- Auto-refresh every 10 seconds

## Testing

1. Open YouTube (or any streaming site)
2. Watch the extension icon - badge appears showing "0m", then "1m", etc.
3. Click the extension icon - see "Active Watch Sessions" section
4. Open multiple streaming sites in different tabs
5. Switch between tabs - badge updates to show active tab's time
6. Watch timers update in real-time in the popup

## Benefits

- **Visual feedback** - Always see how long you've been watching
- **Multiple tab awareness** - Track all open streaming sessions
- **Motivation** - Seeing the time might encourage breaks earlier
- **Transparency** - Know exactly when the wind-down will trigger

---

Ready to test! 🎉
