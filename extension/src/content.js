// Content script for Gistify extension
// This script runs on web pages and enables communication with the extension

console.log('Gistify content script loaded');

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : '';
    sendResponse({ text: selectedText });
  }
  
  if (request.action === 'getPageContent') {
    const content = extractPageContent();
    sendResponse({ content });
  }
  
  if (request.action === 'getYouTubeTranscript') {
    const transcript = extractYouTubeTranscript();
    sendResponse({ transcript });
  }
});

// Function to extract page content
function extractPageContent() {
  // Remove unwanted elements
  const unwantedSelectors = 'script, style, nav, header, footer, aside, .ad, .advertisement, .sidebar';
  const unwantedElements = document.querySelectorAll(unwantedSelectors);
  unwantedElements.forEach(el => el.remove());

  // Get main content areas
  const selectors = [
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
  
  // Try to find main content area
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      content = element.textContent || element.innerText;
      break;
    }
  }

  // If no main content found, get body content
  if (!content) {
    const body = document.body;
    if (body) {
      content = body.textContent || body.innerText;
    }
  }

  // Clean up the content
  if (content) {
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
    
    // Limit content length to avoid API limits
    if (content.length > 10000) {
      content = content.substring(0, 10000) + '...';
    }
  }

  return content || '';
}

// Function to extract YouTube transcript
function extractYouTubeTranscript() {
  // Check if we're on a YouTube video page
  if (!window.location.hostname.includes('youtube.com') || !window.location.pathname.includes('/watch')) {
    return null;
  }

  // Look for transcript button and click it if needed
  const transcriptButton = document.querySelector('button[aria-label*="transcript"], button[aria-label*="Transcript"]');
  
  if (transcriptButton) {
    transcriptButton.click();
  }

  // Look for transcript segments
  const transcriptSegments = document.querySelectorAll('.ytd-transcript-segment-renderer');
  
  if (transcriptSegments.length > 0) {
    let transcript = '';
    transcriptSegments.forEach(segment => {
      const textElement = segment.querySelector('.ytd-transcript-segment-renderer-text');
      if (textElement) {
        transcript += textElement.textContent + ' ';
      }
    });
    
    return transcript.trim();
  }

  // Alternative method: look for existing transcript
  const transcriptContainer = document.querySelector('ytd-transcript-renderer');
  if (transcriptContainer) {
    const segments = transcriptContainer.querySelectorAll('.ytd-transcript-segment-renderer');
    let transcript = '';
    
    segments.forEach(segment => {
      const textElement = segment.querySelector('.ytd-transcript-segment-renderer-text');
      if (textElement) {
        transcript += textElement.textContent + ' ';
      }
    });
    
    if (transcript.trim()) {
      return transcript.trim();
    }
  }

  return null;
}

// Add visual indicator when text is selected (optional)
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    // You could add a floating button or indicator here
    console.log('Text selected:', selection.toString().trim());
  }
});

// Handle keyboard shortcuts (optional)
document.addEventListener('keydown', (event) => {
  // Ctrl+Shift+S to open Gistify popup
  if (event.ctrlKey && event.shiftKey && event.key === 'S') {
    event.preventDefault();
    chrome.runtime.sendMessage({ action: 'openPopup' });
  }
});
