import React, { useState } from 'react';

const SummaryForm = ({ onSummarize, isLoading, error }) => {
  const [selectedStyle, setSelectedStyle] = useState('tldr');
  const [selectedType, setSelectedType] = useState('page');

  const summaryStyles = [
    {
      id: 'tldr',
      name: 'TL;DR',
      description: 'Quick and concise summary',
      icon: '⚡'
    },
    {
      id: 'bullets',
      name: 'Bullet Points',
      description: 'Key points in a structured format',
      icon: '📋'
    },
    {
      id: 'friendly',
      name: 'Friendly',
      description: 'Conversational and easy to understand',
      icon: '😊'
    }
  ];

  const contentTypes = [
    {
      id: 'page',
      name: 'Current Page',
      description: 'Summarize the entire webpage',
      icon: '🌐'
    },
    {
      id: 'selected',
      name: 'Selected Text',
      description: 'Summarize highlighted text only',
      icon: '✏️'
    },
    {
      id: 'youtube',
      name: 'YouTube Video',
      description: 'Summarize video transcript',
      icon: '📺'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSummarize(selectedStyle, selectedType);
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Summary Style Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Summary Style
          </label>
          <div className="grid grid-cols-1 gap-3">
            {summaryStyles.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyle(style.id)}
                className={`p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedStyle === style.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{style.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{style.name}</div>
                    <div className="text-sm text-gray-500">{style.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What to Summarize
          </label>
          <div className="grid grid-cols-1 gap-3">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                className={`p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedType === type.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{type.name}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generating Summary...</span>
            </div>
          ) : (
            'Generate Summary'
          )}
        </button>
      </form>

      {/* Tip section removed per request */}
    </div>
  );
};

export default SummaryForm;
