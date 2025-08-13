import React from 'react';

const History = ({ summaries, onViewSummary, onDeleteSummary, onBack }) => {
  const getStyleIcon = (style) => {
    switch (style) {
      case 'tldr': return '⚡';
      case 'bullets': return '📋';
      case 'friendly': return '😊';
      default: return '📝';
    }
  };

  const getStyleName = (style) => {
    switch (style) {
      case 'tldr': return 'TL;DR';
      case 'bullets': return 'Bullet Points';
      case 'friendly': return 'Friendly';
      default: return 'Summary';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Summary History</h2>
        </div>
        <span className="text-sm text-gray-500">{summaries.length} summaries</span>
      </div>

      {/* Summaries List */}
      {summaries.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No summaries yet</p>
          <p className="text-sm text-gray-400">Your summaries will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {summaries.map((summary) => (
            <div
              key={summary.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getStyleIcon(summary.style)}</span>
                    <span className="font-medium text-gray-900">
                      {getStyleName(summary.style)}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{summary.type}</span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                    {truncateText(summary.content)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(summary.timestamp)}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewSummary(summary)}
                        className="text-xs bg-primary-100 hover:bg-primary-200 text-primary-700 px-2 py-1 rounded transition-colors duration-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onDeleteSummary(summary.id)}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear All Button */}
      {summaries.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete all summaries?')) {
                summaries.forEach(summary => onDeleteSummary(summary.id));
              }
            }}
            className="w-full text-sm text-red-600 hover:text-red-700 py-2 px-4 rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            Clear All Summaries
          </button>
        </div>
      )}
    </div>
  );
};

export default History;
