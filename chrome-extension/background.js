// Background Service Worker for ATS LinkedIn Import Extension
// Manifest V3 compatible

import { CONFIG, MESSAGE_TYPES } from './config.js';

// Initialize extension on install
chrome.runtime.onInstalled.addListener((details) => {
  console.log('ATS LinkedIn Import Extension installed:', details.reason);
  
  // Set default settings
  chrome.storage.sync.set({
    atsDomain: '',
    atsApiKey: '',
    isFirstInstall: true
  });
  
  // Show welcome notification
  if (details.reason === 'install') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'ATS LinkedIn Import Installed',
      message: 'Click the extension icon to configure your ATS settings'
    });
  }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        case MESSAGE_TYPES.IMPORT_CANDIDATE:
          const result = await handleCandidateImport(message.data);
          sendResponse(result);
          break;
          
        case MESSAGE_TYPES.GET_SETTINGS:
          const settings = await chrome.storage.sync.get(['atsDomain', 'atsApiKey']);
          sendResponse({ success: true, settings });
          break;
          
        case MESSAGE_TYPES.SAVE_SETTINGS:
          await chrome.storage.sync.set({
            atsDomain: message.data.atsDomain,
            atsApiKey: message.data.atsApiKey
          });
          sendResponse({ success: true });
          break;
          
        case MESSAGE_TYPES.VALIDATE_SETTINGS:
          const validation = await validateSettings();
          sendResponse(validation);
          break;
          
        case MESSAGE_TYPES.GET_CANDIDATE_STATUS:
          const status = await checkCandidateStatus(message.candidateId);
          sendResponse(status);
          break;
          
        default:
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({ error: error.message });
    }
  })();
  
  return true; // Keep message channel open for async
});

// Handle candidate import to ATS
async function handleCandidateImport(data) {
  const { settings } = await chrome.storage.sync.get(['atsDomain', 'atsApiKey']);
  
  if (!settings.atsDomain || !settings.atsApiKey) {
    return { 
      success: false, 
      error: 'Please configure ATS domain and API key in the extension settings' 
    };
  }
  
  try {
    const response = await fetch(`${settings.atsDomain}/api/linkedin/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.atsApiKey}`,
        'X-Extension-Version': chrome.runtime.getManifest().version
      },
      body: JSON.stringify({
        linkedInUrl: data.linkedInUrl,
        linkedInData: data.linkedInData,
        importedAt: new Date().toISOString(),
        source: 'chrome_extension'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Import failed`);
    }
    
    const result = await response.json();
    
    // Store import history
    await storeImportHistory({
      candidateId: result.candidateId,
      candidateName: data.linkedInData.name,
      linkedInUrl: data.linkedInUrl,
      importedAt: new Date().toISOString(),
      status: 'success'
    });
    
    return { success: true, ...result };
    
  } catch (error) {
    console.error('Import failed:', error);
    return { success: false, error: error.message };
  }
}

// Validate extension settings
async function validateSettings() {
  const { atsDomain, atsApiKey } = await chrome.storage.sync.get(['atsDomain', 'atsApiKey']);
  
  if (!atsDomain || !atsApiKey) {
    return { valid: false, error: 'Settings not configured' };
  }
  
  try {
    const response = await fetch(`${atsDomain}/api/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${atsApiKey}`,
        'X-Extension-Version': chrome.runtime.getManifest().version
      }
    });
    
    if (response.ok) {
      return { valid: true };
    } else {
      return { valid: false, error: 'Invalid API key or domain' };
    }
  } catch (error) {
    return { valid: false, error: 'Cannot connect to ATS. Check domain URL.' };
  }
}

// Check candidate status in ATS
async function checkCandidateStatus(candidateId) {
  const { atsDomain, atsApiKey } = await chrome.storage.sync.get(['atsDomain', 'atsApiKey']);
  
  try {
    const response = await fetch(`${atsDomain}/api/candidates/${candidateId}`, {
      headers: {
        'Authorization': `Bearer ${atsApiKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, candidate: data };
    }
    
    return { success: false, error: 'Candidate not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Store import history
async function storeImportHistory(importData) {
  const { importHistory = [] } = await chrome.storage.local.get(['importHistory']);
  importHistory.unshift(importData);
  
  // Keep only last 100 imports
  if (importHistory.length > 100) {
    importHistory.pop();
  }
  
  await chrome.storage.local.set({ importHistory });
}

// Handle alarms for periodic sync (if needed)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sync-status') {
    // Implement periodic status sync if needed
  }
});

// Handle external messages (from other extensions or native apps)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  // Validate sender if needed
  sendResponse({ received: true });
  return true;
});

// Listen for tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('linkedin.com/in/')) {
    // Content script is automatically injected via manifest
    // This is a hook for any additional setup
  }
});

// Handle action icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url?.includes('linkedin.com/in/')) {
    // Send message to content script to trigger import
    chrome.tabs.sendMessage(tab.id, { type: MESSAGE_TYPES.TRIGGER_IMPORT });
  }
});

// Export for testing if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { handleCandidateImport, validateSettings };
}
