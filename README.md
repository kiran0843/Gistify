# Gistify - AI Content Summarizer Chrome Extension

A powerful Chrome extension that uses Google's Gemini AI to summarize web content, YouTube videos, and selected text in multiple styles.

## ✨ Features

- **Multiple Summary Styles**: TL;DR, Bullet Points, and Friendly summaries
- **Content Types**: 
  - Current webpage content
  - Selected text only
  - YouTube video transcripts
- **Clean UI**: Modern, responsive popup interface built with React and Tailwind CSS
- **Local Storage**: Save and manage your last 50 summaries
- **Copy to Clipboard**: One-click copying of summaries
- **History Management**: View, delete, and manage saved summaries

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **AI API**: Google Gemini API
- **Extension**: Chrome Extension Manifest V3
- **Package Manager**: npm

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Google Gemini API key
- Chrome browser

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gistify
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install extension dependencies
cd extension
npm install
cd ..
```

### 3. Set Up Environment Variables

1. Copy the environment example file:
```bash
cp env.example .env
```

2. Edit `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3001
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and paste it in your `.env` file

### 5. Build the Extension

```bash
# Build the extension
cd extension
npm run build
cd ..
```

### 6. Start the Backend Server

```bash
# Start the development server
npm run dev:server
```

The server will start on `http://localhost:3001`

### 7. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/dist` folder
5. The Gistify extension should now appear in your extensions list

## 🎯 Usage

### Basic Usage

1. **Navigate to any webpage** you want to summarize
2. **Click the Gistify extension icon** in your Chrome toolbar
3. **Choose your summary style**:
   - ⚡ **TL;DR**: Quick and concise summary
   - 📋 **Bullet Points**: Key points in structured format
   - 😊 **Friendly**: Conversational and easy to understand
4. **Select content type**:
   - 🌐 **Current Page**: Summarize the entire webpage
   - ✏️ **Selected Text**: Summarize highlighted text only
   - 📺 **YouTube Video**: Summarize video transcript
5. **Click "Generate Summary"**
6. **Copy the summary** to your clipboard

### YouTube Video Summarization

1. Navigate to a YouTube video with available transcripts
2. Open the Gistify popup
3. Select "YouTube Video" as content type
4. Choose your preferred summary style
5. Generate the summary

### Managing History

- Click the clock icon in the popup to view your summary history
- View, copy, or delete individual summaries
- Clear all summaries if needed

## 📁 Project Structure

```
gistify/
├── server/                 # Backend server
│   └── index.js           # Express server with Gemini API
├── extension/             # Chrome extension
│   ├── src/              # Source files
│   │   ├── components/   # React components
│   │   ├── utils/        # Utility functions
│   │   ├── popup.html    # Popup HTML
│   │   ├── popup.css     # Styles
│   │   ├── popup.jsx     # Main popup component
│   │   ├── content.js    # Content script
│   │   └── background.js # Background script
│   ├── dist/             # Built extension (after npm run build)
│   ├── icons/            # Extension icons
│   ├── manifest.json     # Extension manifest
│   ├── package.json      # Extension dependencies
│   ├── vite.config.js    # Vite configuration
│   ├── tailwind.config.js # Tailwind configuration
│   └── postcss.config.js # PostCSS configuration
├── package.json          # Root package.json
├── env.example           # Environment variables example
└── README.md            # This file
```

## 🔧 Development

### Running in Development Mode

```bash
# Start both backend and extension in development mode
npm run dev

# Or run them separately:
npm run dev:server    # Backend only
npm run dev:extension # Extension only
```

### Building for Production

```bash
# Build the extension
cd extension
npm run build
cd ..
```

### API Endpoints

- `POST /api/summarize` - Generate summary
- `GET /api/health` - Health check

## 🛡️ Security Features

- **API Key Protection**: Gemini API key is kept secure on the backend
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **CORS Protection**: Configured for Chrome extension origins only
- **Input Validation**: All inputs are validated before processing

## 🐛 Troubleshooting

### Common Issues

1. **"Server not responding" error**
   - Make sure the backend server is running on port 3001
   - Check if the server started without errors

2. **"Gemini API key not configured" error**
   - Verify your `.env` file has the correct API key
   - Restart the server after updating the `.env` file

3. **Extension not loading**
   - Make sure you're loading from the `extension/dist` folder
   - Check the browser console for any errors
   - Verify all files are present in the dist folder

4. **YouTube transcript not found**
   - Ensure you're on a YouTube video page
   - Check if the video has available transcripts
   - Try refreshing the page and opening the transcript manually first

### Debug Mode

To enable debug logging, set `NODE_ENV=development` in your `.env` file.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- React and Vite for the frontend framework
- Tailwind CSS for styling
- Chrome Extension API for browser integration

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Open an issue on GitHub with detailed information about the problem

---

**Happy Summarizing! 🚀**
