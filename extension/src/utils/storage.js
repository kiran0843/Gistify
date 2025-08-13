const STORAGE_KEY = 'gistify_summaries';
const MAX_SUMMARIES = 50; // Keep only the last 50 summaries

export const saveSummary = async (summary) => {
  try {
    const summaries = await getSummaries();
    
    // Add new summary to the beginning
    summaries.unshift(summary);
    
    // Keep only the last MAX_SUMMARIES
    if (summaries.length > MAX_SUMMARIES) {
      summaries.splice(MAX_SUMMARIES);
    }
    
    await chrome.storage.local.set({ [STORAGE_KEY]: summaries });
    return true;
  } catch (error) {
    console.error('Failed to save summary:', error);
    throw error;
  }
};

export const getSummaries = async () => {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    return result[STORAGE_KEY] || [];
  } catch (error) {
    console.error('Failed to get summaries:', error);
    return [];
  }
};

export const deleteSummary = async (id) => {
  try {
    const summaries = await getSummaries();
    const updatedSummaries = summaries.filter(summary => summary.id !== id);
    await chrome.storage.local.set({ [STORAGE_KEY]: updatedSummaries });
    return true;
  } catch (error) {
    console.error('Failed to delete summary:', error);
    throw error;
  }
};

export const clearAllSummaries = async () => {
  try {
    await chrome.storage.local.remove([STORAGE_KEY]);
    return true;
  } catch (error) {
    console.error('Failed to clear summaries:', error);
    throw error;
  }
};

export const getSummaryById = async (id) => {
  try {
    const summaries = await getSummaries();
    return summaries.find(summary => summary.id === id);
  } catch (error) {
    console.error('Failed to get summary by ID:', error);
    return null;
  }
};
