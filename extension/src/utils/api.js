const API_BASE_URL = 'http://localhost:3001';

export const summarizeContent = async (content, style, type) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        style,
        type
      })
    });

    if (!response.ok) {
      let message = 'Failed to generate summary';
      try {
        const errorData = await response.json();
        message = errorData.details || errorData.error || message;
      } catch (_) {
        message = `${response.status} ${response.statusText}`;
      }
      throw new Error(message);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
      throw new Error('Server is not responding');
    }
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};
