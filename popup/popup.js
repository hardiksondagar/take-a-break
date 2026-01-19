// Popup script for Take a Break extension

let defaultWebsites = [];
let defaultConfig = null;

let currentConfig = null;
let customWebsites = [];

async function loadDefaults() {
  if (defaultConfig) return defaultConfig;
  const response = await fetch(chrome.runtime.getURL('config/defaults.json'));
  const defaults = await response.json();
  defaultWebsites = defaults.websites;
  defaultConfig = {
    watchDuration: defaults.watchDuration,
    countdownDuration: defaults.countdownDuration,
    snoozeDuration: defaults.snoozeDuration,
    bedtimeHour: defaults.bedtimeHour,
    bedtimeEnabled: defaults.bedtimeEnabled,
    websites: defaults.websites.map(w => w.domain),
    pausedForTonight: false
  };
  applyDefaultsToUI(defaults);
  return defaultConfig;
}

function applyDefaultsToUI(defaults) {
  const watchSlider = document.getElementById('watchDuration');
  watchSlider.min = defaults.watchDurationMin;
  watchSlider.max = defaults.watchDurationMax;
  watchSlider.step = defaults.watchDurationStep;
  document.getElementById('watchDurationMinLabel').textContent = `${defaults.watchDurationMin} min`;
  document.getElementById('watchDurationMaxLabel').textContent = `${defaults.watchDurationMax / 60} hrs`;

  const countdownSlider = document.getElementById('countdownDuration');
  countdownSlider.min = defaults.countdownDurationMin;
  countdownSlider.max = defaults.countdownDurationMax;
  countdownSlider.step = defaults.countdownDurationStep;
  document.getElementById('countdownMinLabel').textContent = `${defaults.countdownDurationMin} sec`;
  document.getElementById('countdownMaxLabel').textContent = `${defaults.countdownDurationMax} sec`;

  const snoozeSlider = document.getElementById('snoozeDuration');
  snoozeSlider.min = defaults.snoozeDurationMin;
  snoozeSlider.max = defaults.snoozeDurationMax;
  snoozeSlider.step = defaults.snoozeDurationStep;
  document.getElementById('snoozeMinLabel').textContent = `${defaults.snoozeDurationMin} min`;
  document.getElementById('snoozeMaxLabel').textContent = `${defaults.snoozeDurationMax / 60} hr`;
}

// Initialize popup
async function init() {
  await loadDefaults();

  // Load config
  const stored = await chrome.storage.local.get('config');
  currentConfig = stored.config || getDefaultConfig();

  // Load custom websites
  const customStored = await chrome.storage.local.get('customWebsites');
  customWebsites = customStored.customWebsites || [];

  // Update UI
  updateUI();

  // Attach event listeners
  attachListeners();

  // Load and display active timers
  updateActiveTimers();

  // Update active timers every 10 seconds
  setInterval(updateActiveTimers, 10000);
}

function getDefaultConfig() {
  return defaultConfig;
}

// Update UI with current config
function updateUI() {
  // Watch duration
  document.getElementById('watchDuration').value = currentConfig.watchDuration;
  updateSliderValue('watchDuration', currentConfig.watchDuration, (val) => `${val} minutes`);

  // Countdown duration
  document.getElementById('countdownDuration').value = currentConfig.countdownDuration;
  updateSliderValue('countdownDuration', currentConfig.countdownDuration, (val) => `${val} seconds`);

  // Snooze duration
  document.getElementById('snoozeDuration').value = currentConfig.snoozeDuration;
  updateSliderValue('snoozeDuration', currentConfig.snoozeDuration, (val) => `${val} minutes`);

  // Bedtime enabled
  document.getElementById('bedtimeEnabled').checked = currentConfig.bedtimeEnabled;
  updateBedtimeVisibility();

  // Bedtime hour
  document.getElementById('bedtimeHour').value = currentConfig.bedtimeHour;
  updateSliderValue('bedtimeHour', currentConfig.bedtimeHour, formatBedtimeHour);

  // Paused status
  updatePauseButton();

  // Default websites
  renderDefaultWebsites();

  // Custom websites
  renderCustomWebsites();
}

// Update slider value display
function updateSliderValue(sliderId, value, formatter) {
  const valueElement = document.getElementById(`${sliderId}Value`);
  if (valueElement) {
    valueElement.textContent = formatter(value);
  }
}

// Format bedtime hour
function formatBedtimeHour(hour) {
  if (hour === 0) return '12:00 AM';
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return '12:00 PM';
  return `${hour - 12}:00 PM`;
}

// Update bedtime visibility
function updateBedtimeVisibility() {
  const container = document.getElementById('bedtimeHourContainer');
  if (currentConfig.bedtimeEnabled) {
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
}

// Update pause button
function updatePauseButton() {
  const btn = document.getElementById('pauseToggle');
  const statusIcon = document.getElementById('statusIcon');
  const statusText = document.getElementById('statusText');

  if (currentConfig.pausedForTonight) {
    btn.classList.add('active');
    document.getElementById('pauseText').textContent = 'Resume monitoring';
    statusIcon.textContent = '⏸️';
    statusIcon.classList.add('paused');
    statusText.textContent = 'Paused for tonight';
  } else {
    btn.classList.remove('active');
    document.getElementById('pauseText').textContent = 'Pause for tonight';
    statusIcon.textContent = '✓';
    statusIcon.classList.remove('paused');
    statusText.textContent = 'Monitoring your watch time';
  }
}

// Update active timers display
async function updateActiveTimers() {

  try {
    const response = await chrome.runtime.sendMessage({ action: 'getAllTimers' });


    const timers = response?.timers || [];

    const container = document.getElementById('activeTimers');
    const list = document.getElementById('timersList');

    if (timers.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    list.innerHTML = '';


    timers.forEach(timer => {
      const item = document.createElement('div');
      item.className = 'timer-item';

      // Extract site name from URL
      let siteName = 'Streaming site';
      try {
        const url = new URL(timer.url);
        siteName = url.hostname.replace('www.', '').split('.')[0];
        siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
      } catch (e) {
        // Ignore URL parsing errors
      }

      const siteSpan = document.createElement('span');
      siteSpan.className = 'timer-site';
      siteSpan.textContent = siteName;

      const durationSpan = document.createElement('span');
      durationSpan.className = 'timer-duration';
      durationSpan.textContent = `${timer.elapsed} min`;

      item.appendChild(siteSpan);
      item.appendChild(durationSpan);

      if (timer.snoozed) {
        const snoozedSpan = document.createElement('span');
        snoozedSpan.className = 'timer-snoozed';
        snoozedSpan.textContent = '💤';
        snoozedSpan.title = 'Snoozed';
        item.appendChild(snoozedSpan);
      }

      list.appendChild(item);
    });
  } catch (error) {
    console.error('Failed to get timers:', error);
  }
}

// Render default websites
function renderDefaultWebsites() {
  const container = document.getElementById('defaultWebsiteList');
  container.innerHTML = '';

  defaultWebsites.forEach(site => {
    const isEnabled = currentConfig.websites.includes(site.domain);

    const item = document.createElement('div');
    item.className = 'website-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `site-${site.domain}`;
    checkbox.checked = isEnabled;
    checkbox.addEventListener('change', () => {
      toggleWebsite(site.domain, checkbox.checked);
    });

    const label = document.createElement('label');
    label.htmlFor = `site-${site.domain}`;
    label.textContent = site.name;

    item.appendChild(checkbox);
    item.appendChild(label);
    container.appendChild(item);
  });
}

// Render custom websites
function renderCustomWebsites() {
  const container = document.getElementById('customWebsiteList');
  container.innerHTML = '';

  if (customWebsites.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'help-text';
    empty.textContent = 'No custom websites added yet';
    container.appendChild(empty);
    return;
  }

  customWebsites.forEach((domain, index) => {
    const item = document.createElement('div');
    item.className = 'website-item';

    const label = document.createElement('label');
    label.textContent = domain;
    label.style.flex = '1';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'website-remove-btn';
    removeBtn.textContent = '×';
    removeBtn.title = 'Remove';
    removeBtn.addEventListener('click', () => {
      removeCustomWebsite(index);
    });

    item.appendChild(label);
    item.appendChild(removeBtn);
    container.appendChild(item);
  });
}

// Toggle website
async function toggleWebsite(domain, enabled) {
  if (enabled) {
    if (!currentConfig.websites.includes(domain)) {
      currentConfig.websites.push(domain);
    }
  } else {
    currentConfig.websites = currentConfig.websites.filter(w => w !== domain);
  }

  await saveConfig();
}

// Add custom website
async function addCustomWebsite() {
  const input = document.getElementById('customWebsiteInput');
  let domain = input.value.trim();

  if (!domain) return;

  // Clean domain
  domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

  if (!domain.includes('.')) {
    alert('Please enter a valid domain (e.g., example.com)');
    return;
  }

  if (customWebsites.includes(domain)) {
    alert('This website is already in your list');
    return;
  }

  customWebsites.push(domain);
  currentConfig.websites.push(domain);

  await chrome.storage.local.set({ customWebsites });
  await saveConfig();

  input.value = '';
  renderCustomWebsites();
}

// Remove custom website
async function removeCustomWebsite(index) {
  const domain = customWebsites[index];
  customWebsites.splice(index, 1);
  currentConfig.websites = currentConfig.websites.filter(w => w !== domain);

  await chrome.storage.local.set({ customWebsites });
  await saveConfig();

  renderCustomWebsites();
}

// Save config
async function saveConfig() {

  await chrome.storage.local.set({ config: currentConfig });
  showSaveIndicator();
}

// Show save indicator
function showSaveIndicator() {
  const indicator = document.getElementById('saveIndicator');
  indicator.classList.add('show');
  setTimeout(() => {
    indicator.classList.remove('show');
  }, 2000);
}

// Attach event listeners
function attachListeners() {
  // Watch duration slider
  document.getElementById('watchDuration').addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    updateSliderValue('watchDuration', value, (val) => `${val} minutes`);
    currentConfig.watchDuration = value;


    saveConfig();
  });

  // Countdown duration slider
  document.getElementById('countdownDuration').addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    updateSliderValue('countdownDuration', value, (val) => `${val} seconds`);
    currentConfig.countdownDuration = value;
    saveConfig();
  });

  // Snooze duration slider
  document.getElementById('snoozeDuration').addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    updateSliderValue('snoozeDuration', value, (val) => `${val} minutes`);
    currentConfig.snoozeDuration = value;
    saveConfig();
  });

  // Bedtime enabled toggle
  document.getElementById('bedtimeEnabled').addEventListener('change', (e) => {
    currentConfig.bedtimeEnabled = e.target.checked;
    updateBedtimeVisibility();
    saveConfig();
  });

  // Bedtime hour slider
  document.getElementById('bedtimeHour').addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    updateSliderValue('bedtimeHour', value, formatBedtimeHour);
    currentConfig.bedtimeHour = value;
    saveConfig();
  });

  // Pause toggle button
  document.getElementById('pauseToggle').addEventListener('click', () => {
    currentConfig.pausedForTonight = !currentConfig.pausedForTonight;
    updatePauseButton();
    saveConfig();
  });

  // Website tabs
  document.querySelectorAll('.website-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });

  // Add custom website button
  document.getElementById('addWebsiteBtn').addEventListener('click', addCustomWebsite);

  // Add website on Enter key
  document.getElementById('customWebsiteInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addCustomWebsite();
    }
  });
}

// Switch tabs
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.website-tab').forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Update content
  if (tabName === 'default') {
    document.getElementById('defaultWebsites').classList.remove('hidden');
    document.getElementById('customWebsites').classList.add('hidden');
  } else {
    document.getElementById('defaultWebsites').classList.add('hidden');
    document.getElementById('customWebsites').classList.remove('hidden');
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
