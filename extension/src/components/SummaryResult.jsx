import React, { useState } from 'react';

const SummaryResult = ({ summary, onCopy, onNewSummary }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy(summary.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    return date.toLocaleString();
  };

  const escapeHtml = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const applyBoldHeuristics = (line) => {
    // Bold Markdown **text** if present
    let html = escapeHtml(line)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // If no markdown bold, bold lead phrase before ':' or ' - '
    if (!/\<strong\>/.test(html)) {
      const colon = html.indexOf(':');
      const dash = html.indexOf(' - ');
      const sepIndex = colon > 0 ? colon : (dash > 0 ? dash : -1);
      if (sepIndex > 0 && sepIndex < 80) {
        const lead = html.slice(0, sepIndex).trim();
        const rest = html.slice(sepIndex);
        html = `<strong>${lead}</strong>${rest}`;
      }
    }
    return html;
  };

  const renderContent = () => {
    if (!summary?.content) return null;

    if (summary.style === 'bullets') {
      const lines = summary.content
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);

      const normalized = lines.map((l) => {
        // Strip common bullet prefixes
        return l.replace(/^[-*•\d+\.\)\s]+/, '').trim();
      });

      return (
        <ul className="list-disc pl-5 space-y-2 text-gray-800 leading-relaxed">
          {normalized.map((line, idx) => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
              const lead = line.slice(0, colonIndex).trim();
              const rest = line.slice(colonIndex + 1).trim();
              return (
                <li key={idx}>
                  <span className="font-semibold text-gray-900">{lead}:</span> {rest}
                </li>
              );
            }
            return <li key={idx}><span className="font-medium text-gray-900">{line}</span></li>;
          })}
        </ul>
      );
    }

    // Default paragraph rendering with Markdown-bold and bolded leads
    const lines = summary.content.split(/\r?\n/);
    const html = lines
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(applyBoldHeuristics)
      .join('<br/>');
    return (
      <div
        className="text-gray-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getStyleIcon(summary.style)}</span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {getStyleName(summary.style)} Summary
            </h2>
            <p className="text-sm text-gray-500">
              {summary.type} • {formatTimestamp(summary.timestamp)}
            </p>
          </div>
        </div>
        <button
          onClick={onNewSummary}
          className="text-gray-400 hover:text-gray-600 p-1"
          title="New Summary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Summary Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {renderContent()}
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={handleCopy}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
            copied
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy Summary</span>
            </>
          )}
        </button>
        
        <button
          onClick={onNewSummary}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
        >
          New Summary
        </button>
      </div>

      {/* URL Info */}
      {summary.url && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 mb-1">Source URL</p>
              <p className="text-sm text-gray-700 truncate" title={summary.url}>
                {summary.url}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryResult;
