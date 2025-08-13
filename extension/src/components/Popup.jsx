import React, { useState, useEffect } from 'react';
import SummaryForm from './SummaryForm';
import SummaryResult from './SummaryResult';
import History from './History';
import { getCurrentTabContent, getSelectedText, getYouTubeTranscript } from '../utils/contentExtractor';
import { summarizeContent } from '../utils/api';
import { saveSummary, getSummaries } from '../utils/storage';

const Popup = () => {
  const [currentView, setCurrentView] = useState('form'); // 'form', 'result', 'history'
  const [isLoading, setIsLoading] = useState(false);
  const [currentSummary, setCurrentSummary] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    try {
      const savedSummaries = await getSummaries();
      setSummaries(savedSummaries);
    } catch (error) {
      console.error('Failed to load summaries:', error);
    }
  };

  const handleSummarize = async (style, type) => {
    setIsLoading(true);
    setError(null);

    try {
      let content = '';
      let contentType = type;

      if (type === 'selected') {
        content = await getSelectedText();
        if (!content) {
          throw new Error('No text selected. Please select some text on the page.');
        }
        contentType = 'selected text';
      } else if (type === 'youtube') {
        content = await getYouTubeTranscript();
        if (!content) {
          throw new Error('No transcript found for this YouTube video.');
        }
        contentType = 'YouTube transcript';
      } else {
        content = await getCurrentTabContent();
        if (!content) {
          throw new Error('Unable to extract content from this page.');
        }
        contentType = 'webpage';
      }

      const result = await summarizeContent(content, style, contentType);
      
      const summaryData = {
        id: Date.now(),
        content: result.summary,
        style,
        type: contentType,
        timestamp: result.timestamp,
        url: await getCurrentUrl()
      };

      setCurrentSummary(summaryData);
      await saveSummary(summaryData);
      await loadSummaries();
      setCurrentView('result');

    } catch (error) {
      setError(error.message);
      console.error('Summarization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUrl = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab.url;
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show a brief success message
      const notification = document.createElement('div');
      notification.textContent = 'Copied to clipboard!';
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-3 py-1 rounded text-sm z-50';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleNewSummary = () => {
    setCurrentView('form');
    setCurrentSummary(null);
    setError(null);
  };

  const handleViewHistory = () => {
    setCurrentView('history');
  };

  const handleViewSummary = (summary) => {
    setCurrentSummary(summary);
    setCurrentView('result');
  };

  const handleDeleteSummary = async (id) => {
    try {
      const updatedSummaries = summaries.filter(s => s.id !== id);
      setSummaries(updatedSummaries);
      await chrome.storage.local.set({ summaries: updatedSummaries });
      
      if (currentSummary && currentSummary.id === id) {
        setCurrentView('form');
        setCurrentSummary(null);
      }
    } catch (error) {
      console.error('Failed to delete summary:', error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Gistify</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleNewSummary}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="New Summary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={handleViewHistory}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="History"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {currentView === 'form' && (
          <SummaryForm
            onSummarize={handleSummarize}
            isLoading={isLoading}
            error={error}
          />
        )}

        {currentView === 'result' && currentSummary && (
          <SummaryResult
            summary={currentSummary}
            onCopy={handleCopy}
            onNewSummary={handleNewSummary}
          />
        )}

        {currentView === 'history' && (
          <History
            summaries={summaries}
            onViewSummary={handleViewSummary}
            onDeleteSummary={handleDeleteSummary}
            onBack={() => setCurrentView('form')}
          />
        )}
      </div>
    </div>
  );
};

export default Popup;
