// Background service worker for Gistify extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Gistify extension installed successfully!');
    
    // Open welcome page or show notification
    chrome.tabs.create({
      url: 'https://github.com/your-username/gistify#readme'
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup automatically due to manifest configuration
  console.log('Extension icon clicked');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_TAB_INFO') {
    // Get current tab information
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendResponse({
          url: tabs[0].url,
          title: tabs[0].title,
          id: tabs[0].id
        });
      }
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.type === 'EXTRACT_CONTENT') {
    // Extract content from current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: extractContent
        }, (results) => {
          if (results && results[0]) {
            sendResponse({ content: results[0].result });
          } else {
            sendResponse({ error: 'Failed to extract content' });
          }
        });
      }
    });
    return true;
  }
});

// Content extraction function (injected into pages)
function extractContent() {
  // Remove unwanted elements
  const unwantedSelectors = 'script, style, nav, header, footer, aside, .ad, .advertisement, .sidebar';
  const unwantedElements = document.querySelectorAll(unwantedSelectors);
  unwantedElements.forEach(el => el.remove());

  // Get main content
  const mainSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.content',
    '.post-content',
    '.entry-content',
    '.article-content',
    '#content',
    '#main'
  ];

  let content = '';
  for (const selector of mainSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      content = element.textContent || element.innerText;
      break;
    }
  }

  if (!content) {
    content = document.body.textContent || document.body.innerText;
  }

  // Clean up content
  if (content) {
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
    
    if (content.length > 10000) {
      content = content.substring(0, 10000) + '...';
    }
  }

  return content || '';
}

// Context menu feature can be added later if needed
// For now, keeping the background script simple to avoid registration issues
