// Background Service Worker for Take a Break extension

const DEBUG = true; // Set to false in production

function log(...args) {
  if (DEBUG) {
    console.log('[Take a Break]', ...args);
  }
}

let defaultConfigCache = null;

async function loadDefaultConfig() {
  if (defaultConfigCache) return defaultConfigCache;
  const response = await fetch(chrome.runtime.getURL('config/defaults.json'));
  const defaults = await response.json();
  defaultConfigCache = {
    watchDuration: defaults.watchDuration,
    countdownDuration: defaults.countdownDuration,
    snoozeDuration: defaults.snoozeDuration,
    bedtimeHour: defaults.bedtimeHour,
    bedtimeEnabled: defaults.bedtimeEnabled,
    websites: defaults.websites.map(site => site.domain),
    pausedForTonight: false
  };
  return defaultConfigCache;
}

// Tab timers: Map of tabId -> {startTime, snoozedUntil, notifiedMidnight, alarmName, url}
const tabTimers = new Map();

// Restore timers from storage on startup (service worker wakes up)
async function restoreTimers() {

  try {
    const result = await chrome.storage.session.get('tabTimers');
    if (result.tabTimers) {
      const storedTimers = result.tabTimers;


      const config = await getConfig();

      // Restore Map from stored object and check/recreate alarms
      for (const [tabIdStr, timer] of Object.entries(storedTimers)) {
        const tabId = parseInt(tabIdStr);
        tabTimers.set(tabId, timer);

        // Check if alarm still exists
        const alarm = await chrome.alarms.get(timer.alarmName);


        if (!alarm) {
          // Alarm was lost, recreate it
          const elapsed = Math.floor((Date.now() - timer.startTime) / 1000 / 60);
          const remaining = config.watchDuration - elapsed;


          if (remaining > 0) {
            await chrome.alarms.create(timer.alarmName, {
              delayInMinutes: remaining
            });
          } else {
            // Timer already expired, trigger immediately
            chrome.tabs.sendMessage(tabId, {
              action: 'showWindDown',
              countdown: config.countdownDuration
            });
          }
        }
      }
      updateBadge();
    }
  } catch (error) {
    log('Error restoring timers:', error);
  }
}

// Persist timers to session storage
async function persistTimers() {
  const timersObj = {};
  tabTimers.forEach((timer, tabId) => {
    timersObj[tabId] = timer;
  });
  await chrome.storage.session.set({ tabTimers: timersObj });

}

// Initialize on service worker startup
restoreTimers();

// Create a periodic alarm for badge updates (service workers don't support setInterval reliably)
chrome.alarms.create('badgeUpdate', {
  periodInMinutes: 1
});

// Listen for badge update alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'badgeUpdate') {
    updateBadge();
  }
});

// Initialize config on install
chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get('config');
  if (!stored.config) {
    const defaults = await loadDefaultConfig();
    await chrome.storage.local.set({ config: defaults });
  }
});

// Check if URL matches any configured website
function isStreamingSite(url, websites) {
  if (!url) return false;
  return websites.some(site => url.includes(site));
}

// Get config from storage
async function getConfig() {
  const stored = await chrome.storage.local.get('config');
  if (stored.config) return stored.config;
  return loadDefaultConfig();
}

// Start timer for a tab
async function startTimer(tabId, url) {

  const config = await getConfig();


  if (config.pausedForTonight) return;
  if (!isStreamingSite(url, config.websites)) {
    return;
  }

  const now = Date.now();
  const alarmName = `winddown_${tabId}`;

  // Clear any existing alarm
  await chrome.alarms.clear(alarmName);

  // Create alarm for wind-down
  const delayMinutes = config.watchDuration;
  await chrome.alarms.create(alarmName, {
    delayInMinutes: delayMinutes
  });

  tabTimers.set(tabId, {
    startTime: now,
    snoozedUntil: null,
    notifiedMidnight: false,
    alarmName: alarmName,
    url: url
  });


  log(`Timer started for tab ${tabId}, will trigger in ${delayMinutes} minutes`);

  // Persist to storage
  await persistTimers();

  // Update badge immediately
  updateBadge();
}

// Clear timer for a tab
async function clearTimer(tabId) {
  const timer = tabTimers.get(tabId);
  if (timer) {
    await chrome.alarms.clear(timer.alarmName);
    tabTimers.delete(tabId);
    log(`Timer cleared for tab ${tabId}`);
    await persistTimers();
    updateBadge();
  }
}

// Snooze timer for a tab
async function snoozeTimer(tabId) {
  const config = await getConfig();
  const timer = tabTimers.get(tabId);

  if (!timer) return;

  const now = Date.now();
  const snoozeUntil = now + (config.snoozeDuration * 60 * 1000);

  timer.snoozedUntil = snoozeUntil;

  // Clear existing alarm and create new one
  await chrome.alarms.clear(timer.alarmName);
  await chrome.alarms.create(timer.alarmName, {
    delayInMinutes: config.snoozeDuration
  });

  log(`Timer snoozed for tab ${tabId}, will trigger in ${config.snoozeDuration} minutes`);
  await persistTimers();
  updateBadge();
}

// Update badge with total watch time
function updateBadge() {

  if (tabTimers.size === 0) {
    chrome.action.setBadgeText({ text: '' });
    return;
  }

  // Get active tab's watch time, or longest if no active
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

    if (tabs.length > 0 && tabTimers.has(tabs[0].id)) {
      const timer = tabTimers.get(tabs[0].id);
      const elapsed = Math.floor((Date.now() - timer.startTime) / 1000 / 60);


      chrome.action.setBadgeText({ text: `${elapsed}m` }, () => {
      });
      chrome.action.setBadgeBackgroundColor({ color: '#8b5cf6' });
    } else {
      // Show total active timers count
      chrome.action.setBadgeText({ text: `${tabTimers.size}` }, () => {
      });
      chrome.action.setBadgeBackgroundColor({ color: '#6366f1' });
    }
  });
}

// Update badge every minute
setInterval(() => {
  updateBadge();
}, 60000);

// Handle alarm triggers
chrome.alarms.onAlarm.addListener(async (alarm) => {
  // Badge update alarm
  if (alarm.name === 'badgeUpdate') {
    updateBadge();
    return;
  }


  if (alarm.name.startsWith('winddown_')) {
    const tabId = parseInt(alarm.name.split('_')[1]);

    // Check if tab still exists
    try {
      const tab = await chrome.tabs.get(tabId);
      const config = await getConfig();


      // Send message to content script to show overlay
      chrome.tabs.sendMessage(tabId, {
        action: 'showWindDown',
        countdown: config.countdownDuration
      });
    } catch (error) {
      // Tab doesn't exist anymore, clean up
      clearTimer(tabId);
    }
  }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const config = await getConfig();

    if (isStreamingSite(tab.url, config.websites)) {
      // Check if timer already exists
      if (!tabTimers.has(tabId)) {
        await startTimer(tabId, tab.url);
      }

      // Check for midnight reminder
      if (config.bedtimeEnabled) {
        const timer = tabTimers.get(tabId);
        const now = new Date();
        const currentHour = now.getHours();

        if (currentHour >= config.bedtimeHour && currentHour < 6 &&
            timer && !timer.notifiedMidnight) {
          // Send midnight reminder
          chrome.tabs.sendMessage(tabId, {
            action: 'showMidnightReminder'
          });
          timer.notifiedMidnight = true;
        }
      }
    } else {
      // Not a streaming site, clear timer if exists
      await clearTimer(tabId);
    }
  }
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener(async (tabId) => {
  await clearTimer(tabId);
});

// Listen for active tab changes to update badge
chrome.tabs.onActivated.addListener(() => {
  updateBadge();
});

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener(() => {
  updateBadge();
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;


  if (message.action === 'snooze' && tabId) {
    snoozeTimer(tabId);
    sendResponse({ success: true });
  } else if (message.action === 'dismiss' && tabId) {
    chrome.tabs.remove(tabId);
    sendResponse({ success: true });
  } else if (message.action === 'getTimerStatus' && tabId) {
    const timer = tabTimers.get(tabId);
    if (timer) {
      const elapsed = Math.floor((Date.now() - timer.startTime) / 1000 / 60);
      sendResponse({
        active: true,
        elapsed: elapsed,
        snoozed: timer.snoozedUntil !== null
      });
    } else {
      sendResponse({ active: false });
    }
  } else if (message.action === 'getAllTimers') {
    // For popup: get all active timers
    const timers = [];
    tabTimers.forEach((timer, tabId) => {
      const elapsed = Math.floor((Date.now() - timer.startTime) / 1000 / 60);
      timers.push({
        tabId: tabId,
        elapsed: elapsed,
        url: timer.url,
        snoozed: timer.snoozedUntil !== null
      });
    });


    sendResponse({ timers: timers });
  }

  return true; // Keep message channel open for async response
});

// Handle config updates
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'local' && changes.config) {
    const newConfig = changes.config.newValue;
    const oldConfig = changes.config.oldValue;

    // If paused for tonight changed to true, clear all timers
    if (newConfig.pausedForTonight) {
      for (const [tabId, timer] of tabTimers.entries()) {
        await chrome.alarms.clear(timer.alarmName);
      }
      tabTimers.clear();
      log('All timers paused for tonight');
      await persistTimers();
      updateBadge();
    } else if (changes.config.oldValue?.pausedForTonight && !newConfig.pausedForTonight) {
      // Restarted, check all tabs
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.url && isStreamingSite(tab.url, newConfig.websites)) {
          await startTimer(tab.id, tab.url);
        }
      }
    }

    // If watch duration changed, reset timers to the new duration
    if (oldConfig?.watchDuration !== newConfig.watchDuration) {

      const now = Date.now();
      for (const [tabId, timer] of tabTimers.entries()) {
        // Reset timer start time to now so new duration applies from change
        timer.startTime = now;
        timer.snoozedUntil = null;
        await chrome.alarms.clear(timer.alarmName);
        await chrome.alarms.create(timer.alarmName, {
          delayInMinutes: newConfig.watchDuration
        });

      }
      await persistTimers();
      updateBadge();
    }
  }
});
