// Content script for Take a Break extension
// This runs on all streaming sites

let countdownInterval = null;
let overlayElement = null;
let toastElement = null;

// Friendly messages for wind-down overlay
const windDownMessages = [
  "Time flies when you're binging!",
  "Your bed misses you 🛏️",
  "Tomorrow-you will thank you!",
  "Even your favorite characters need sleep 😴",
  "The shows will be here tomorrow ✨",
  "Sweet dreams are calling 🌙",
  "Time to rest those tired eyes 👀",
  "Your pillow is getting jealous 😊",
  "Netflix and chill... in bed? 🤔",
  "The episode can wait, your sleep can't 💤",
  "Your future self is cheering you on! 🎉",
  "Sleep: the best season finale ever 🌟"
];

// Get a random message
function getRandomMessage() {
  return windDownMessages[Math.floor(Math.random() * windDownMessages.length)];
}

// Show wind-down overlay
function showWindDownOverlay(countdownSeconds) {
  // Remove any existing overlay
  removeOverlay();

  // Create overlay
  overlayElement = document.createElement('div');
  overlayElement.className = 'tab-overlay';
  overlayElement.setAttribute('role', 'dialog');
  overlayElement.setAttribute('aria-labelledby', 'tab-overlay-title');
  overlayElement.setAttribute('aria-describedby', 'tab-overlay-message');

  const card = document.createElement('div');
  card.className = 'tab-overlay-card';

  const icon = document.createElement('div');
  icon.className = 'tab-overlay-icon';
  icon.textContent = '🌙';

  const title = document.createElement('h1');
  title.id = 'tab-overlay-title';
  title.className = 'tab-overlay-title';
  title.textContent = 'Time to wind down';

  const message = document.createElement('p');
  message.id = 'tab-overlay-message';
  message.className = 'tab-overlay-message';
  message.textContent = getRandomMessage();

  const countdown = document.createElement('div');
  countdown.className = 'tab-overlay-countdown';
  countdown.textContent = countdownSeconds;

  const actions = document.createElement('div');
  actions.className = 'tab-overlay-actions';

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'tab-overlay-btn tab-overlay-btn-secondary';
  dismissBtn.textContent = 'Good night! 😴';
  dismissBtn.addEventListener('click', handleDismiss);

  const snoozeBtn = document.createElement('button');
  snoozeBtn.className = 'tab-overlay-btn tab-overlay-btn-primary';
  snoozeBtn.textContent = 'Just 30 more minutes...';
  snoozeBtn.addEventListener('click', handleSnooze);

  actions.appendChild(dismissBtn);
  actions.appendChild(snoozeBtn);

  card.appendChild(icon);
  card.appendChild(title);
  card.appendChild(message);
  card.appendChild(countdown);
  card.appendChild(actions);

  overlayElement.appendChild(card);
  document.body.appendChild(overlayElement);

  // Start countdown
  let remaining = countdownSeconds;
  countdownInterval = setInterval(() => {
    remaining--;
    countdown.textContent = remaining;

    if (remaining <= 0) {
      clearInterval(countdownInterval);
      handleDismiss(); // Auto-close when countdown reaches 0
    }
  }, 1000);

  // Focus the snooze button for accessibility
  snoozeBtn.focus();

  // Handle Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      handleSnooze();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// Handle snooze
function handleSnooze() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  removeOverlay();

  // Send message to background
  chrome.runtime.sendMessage({ action: 'snooze' });
}

// Handle dismiss
function handleDismiss() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  removeOverlay();

  // Send message to background to close tab
  chrome.runtime.sendMessage({ action: 'dismiss' });
}

// Remove overlay
function removeOverlay() {
  if (overlayElement) {
    overlayElement.remove();
    overlayElement = null;
  }
}

// Show midnight reminder toast
function showMidnightReminder() {
  // Don't show if already showing
  if (toastElement) return;

  toastElement = document.createElement('div');
  toastElement.className = 'tab-midnight-toast';
  toastElement.setAttribute('role', 'alert');

  const icon = document.createElement('div');
  icon.className = 'tab-midnight-toast-icon';
  icon.textContent = '🌜';

  const content = document.createElement('div');
  content.className = 'tab-midnight-toast-content';

  const title = document.createElement('div');
  title.className = 'tab-midnight-toast-title';
  title.textContent = "Hey night owl! 🦉";

  const message = document.createElement('div');
  message.className = 'tab-midnight-toast-message';
  message.textContent = "It's past midnight. Maybe time for bed? Your future self will appreciate the rest!";

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'tab-midnight-toast-btn';
  dismissBtn.textContent = 'Okay, okay...';
  dismissBtn.addEventListener('click', () => {
    removeMidnightToast();
  });

  content.appendChild(title);
  content.appendChild(message);
  content.appendChild(dismissBtn);

  toastElement.appendChild(icon);
  toastElement.appendChild(content);

  document.body.appendChild(toastElement);

  // Auto-dismiss after 15 seconds
  setTimeout(() => {
    removeMidnightToast();
  }, 15000);
}

// Remove midnight toast
function removeMidnightToast() {
  if (toastElement) {
    toastElement.style.animation = 'slideIn 0.5s ease-out reverse';
    setTimeout(() => {
      if (toastElement) {
        toastElement.remove();
        toastElement = null;
      }
    }, 500);
  }
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.action === 'showWindDown') {
    showWindDownOverlay(message.countdown);
    sendResponse({ success: true });
  } else if (message.action === 'showMidnightReminder') {
    showMidnightReminder();
    sendResponse({ success: true });
  }
  return true;
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  removeOverlay();
  removeMidnightToast();
});

const DEBUG = true;

function log(...args) {
  if (DEBUG) {
    console.log('[Take a Break Content]', ...args);
  }
}

log('Extension loaded on', window.location.hostname);
