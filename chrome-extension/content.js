// Content script for LinkedIn profile pages - Enhanced Version
(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    SELECTORS: {
      name: 'h1[class*="inline"]',
      headline: '[class*="text-body-medium"]',
      location: '[class*="top-card__subline-item"]',
      experience: '#experience',
      education: '#education',
      skills: '#skills',
      about: '#about',
      actionBar: '.pv-top-card-v2-ctas, [class*="pv-top-card__actions"], [class*="profile-buttons"]'
    },
    MAX_SKILLS: 50,
    MAX_EXPERIENCE: 10
  };

  const BUTTON_STATES = {
    default: { text: 'Import to ATS', class: '' },
    importing: { text: 'Importing...', class: 'ats-btn-loading' },
    success: { text: '✓ Imported!', class: 'ats-btn-success' },
    error: { text: '✗ Failed', class: 'ats-btn-error' },
    validating: { text: 'Checking...', class: 'ats-btn-loading' }
  };

  let importButton = null;
  let isProcessing = false;

  // Check if we're on a profile page
  function isProfilePage() {
    return window.location.href.includes('/in/') && 
           document.querySelector(CONFIG.SELECTORS.name) !== null;
  }

  // Create and add import button
  function createImportButton() {
    // Remove existing button
    removeImportButton();

    if (!isProfilePage()) return;

    // Create button element
    importButton = document.createElement('button');
    importButton.id = 'ats-import-btn';
    importButton.className = 'ats-import-button';
    importButton.innerHTML = `
      <span class="ats-btn-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </span>
      <span class="ats-btn-text">Import to ATS</span>
    `;
    
    // Add click handler
    importButton.addEventListener('click', handleImportClick);

    // Find insertion point
    const actionBar = document.querySelector(CONFIG.SELECTORS.actionBar);
    if (actionBar) {
      // Insert as first button
      actionBar.insertBefore(importButton, actionBar.firstChild);
    } else {
      // Fallback: Try to find alternative locations
      const header = document.querySelector('header') || document.querySelector('[class*="profile-header"]');
      if (header) {
        const container = document.createElement('div');
        container.className = 'ats-button-container';
        container.appendChild(importButton);
        header.appendChild(container);
      }
    }
  }

  function removeImportButton() {
    const existingBtn = document.getElementById('ats-import-btn');
    if (existingBtn) {
      existingBtn.remove();
    }
    const existingContainer = document.querySelector('.ats-button-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    importButton = null;
  }

  function updateButtonState(state, errorMessage = '') {
    if (!importButton) return;
    
    const config = BUTTON_STATES[state];
    const textSpan = importButton.querySelector('.ats-btn-text');
    
    if (textSpan) {
      textSpan.textContent = config.text;
    }
    
    // Remove all state classes
    Object.values(BUTTON_STATES).forEach(s => {
      if (s.class) importButton.classList.remove(s.class);
    });
    
    // Add new state class
    if (config.class) {
      importButton.classList.add(config.class);
    }
    
    // Update disabled state
    importButton.disabled = (state === 'importing' || state === 'validating');
    
    // Show error tooltip if error
    if (state === 'error' && errorMessage) {
      showTooltip(importButton, errorMessage);
    }
  }

  function showTooltip(element, message) {
    const tooltip = document.createElement('div');
    tooltip.className = 'ats-tooltip';
    tooltip.textContent = message;
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.bottom + 8}px`;
    
    setTimeout(() => tooltip.remove(), 3000);
  }

  // Enhanced profile data extraction
  function extractProfileData() {
    const data = {
      name: '',
      headline: '',
      currentTitle: '',
      currentCompany: '',
      location: '',
      about: '',
      experience: [],
      education: [],
      skills: [],
      linkedInUrl: window.location.href,
      extractedAt: new Date().toISOString()
    };

    try {
      // Name - try multiple selectors
      const nameSelectors = [
        'h1[class*="inline"]',
        'h1',
        '[class*="profile-name"]',
        'h1[class*="top-card-layout__title"]'
      ];
      for (const selector of nameSelectors) {
        const el = document.querySelector(selector);
        if (el?.textContent?.trim()) {
          data.name = el.textContent.trim();
          break;
        }
      }

      // Headline
      const headlineSelectors = [
        '[class*="text-body-medium"]',
        '[class*="headline"]',
        'h2[class*="top-card-layout__headline"]'
      ];
      for (const selector of headlineSelectors) {
        const el = document.querySelector(selector);
        if (el?.textContent?.trim()) {
          data.headline = el.textContent.trim();
          break;
        }
      }

      // Location
      const locationSelectors = [
        '[class*="top-card__subline-item"]',
        '[class*="location"]',
        '[class*="top-card__right-column"] [class*="text-body-small"]'
      ];
      for (const selector of locationSelectors) {
        const el = document.querySelector(selector);
        if (el?.textContent?.trim()) {
          const text = el.textContent.trim();
          if (text.includes(',') || text.toLowerCase().includes('area')) {
            data.location = text;
            break;
          }
        }
      }

      // Current Experience
      const expSection = document.querySelector(CONFIG.SELECTORS.experience);
      if (expSection) {
        const expItems = expSection.querySelectorAll('li, [class*="experience-item"]');
        let count = 0;
        expItems.forEach(item => {
          if (count >= CONFIG.MAX_EXPERIENCE) return;
          
          const titleEl = item.querySelector('[class*="experience-item__title"], h3, [class*="title"]');
          const companyEl = item.querySelector('[class*="experience-item__subtitle"], [class*="company"]');
          const dateEl = item.querySelector('[class*="date-range"], [class*="duration"]');
          
          if (titleEl || companyEl) {
            const exp = {
              title: titleEl?.textContent?.trim() || '',
              company: companyEl?.textContent?.trim() || '',
              duration: dateEl?.textContent?.trim() || ''
            };
            data.experience.push(exp);
            
            // Set current position from first experience
            if (count === 0) {
              data.currentTitle = exp.title;
              data.currentCompany = exp.company;
            }
            count++;
          }
        });
      }

      // Education
      const eduSection = document.querySelector(CONFIG.SELECTORS.education);
      if (eduSection) {
        const eduItems = eduSection.querySelectorAll('li, [class*="education-item"]');
        eduItems.forEach(item => {
          const schoolEl = item.querySelector('[class*="education__school"], h3');
          const degreeEl = item.querySelector('[class*="education__item"], [class*="degree"]');
          
          if (schoolEl) {
            data.education.push({
              school: schoolEl.textContent?.trim() || '',
              degree: degreeEl?.textContent?.trim() || ''
            });
          }
        });
      }

      // Skills
      const skillsSection = document.querySelector(CONFIG.SELECTORS.skills);
      if (skillsSection) {
        const skillItems = skillsSection.querySelectorAll(
          '.pv-skill-category-entity__name-text, [class*="skill-name"], [class*="skill-entity__skill-name"]'
        );
        let count = 0;
        skillItems.forEach(el => {
          if (count >= CONFIG.MAX_SKILLS) return;
          const skill = el.textContent?.trim();
          if (skill) {
            data.skills.push(skill);
            count++;
          }
        });
      }

      // About/Summary
      const aboutSection = document.querySelector(CONFIG.SELECTORS.about);
      if (aboutSection) {
        const aboutSelectors = [
          '.inline-show-more-text',
          '[class*="about__summary"]',
          '[class*="text-body-small"]',
          'span[class*="visually-hidden"]'
        ];
        for (const selector of aboutSelectors) {
          const aboutText = aboutSection.querySelector(selector);
          if (aboutText?.textContent?.trim()) {
            data.about = aboutText.textContent.trim();
            break;
          }
        }
      }

    } catch (error) {
      console.error('Error extracting profile data:', error);
    }

    return data;
  }

  // Handle import button click
  async function handleImportClick() {
    if (isProcessing) return;
    isProcessing = true;
    
    updateButtonState('importing');
    
    try {
      const profileData = extractProfileData();
      
      // Validate extracted data
      if (!profileData.name) {
        throw new Error('Could not extract candidate name. Please wait for the page to fully load.');
      }

      // Send to background script
      const response = await chrome.runtime.sendMessage({
        type: 'IMPORT_CANDIDATE',
        data: {
          linkedInUrl: window.location.href,
          linkedInData: profileData
        }
      });

      if (response.success) {
        updateButtonState('success');
        
        // Store candidate ID for status checking
        if (response.candidateId) {
          chrome.storage.local.set({
            [`lastImport_${response.candidateId}`]: {
              candidateId: response.candidateId,
              candidateName: profileData.name,
              importedAt: new Date().toISOString()
            }
          });
        }
      } else {
        throw new Error(response.error || 'Import failed');
      }

    } catch (error) {
      console.error('Import error:', error);
      updateButtonState('error', error.message);
    } finally {
      isProcessing = false;
      
      // Reset button after delay
      setTimeout(() => {
        updateButtonState('default');
      }, 3000);
    }
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'TRIGGER_IMPORT':
        if (importButton && !isProcessing) {
          handleImportClick();
        }
        sendResponse({ triggered: true });
        break;
        
      case 'SHOW_NOTIFICATION':
        showTooltip(importButton || document.body, message.message);
        sendResponse({ shown: true });
        break;
        
      default:
        sendResponse({ error: 'Unknown message type' });
    }
    return true;
  });

  // Watch for page changes (LinkedIn is a SPA)
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      // Small delay to let LinkedIn render the new content
      setTimeout(() => {
        if (isProfilePage()) {
          createImportButton();
        } else {
          removeImportButton();
        }
      }, 1500);
    }
  });

  // Start observing
  observer.observe(document, { subtree: true, childList: true });

  // Initial button creation with delay for page load
  if (document.readyState === 'complete') {
    setTimeout(createImportButton, 2000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(createImportButton, 2000);
    });
  }

  // Handle visibility changes (when user switches tabs)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && isProfilePage()) {
      setTimeout(createImportButton, 500);
    }
  });

})();
