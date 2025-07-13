# AgriSense2 - AI-Powered Agricultural Assistant

A comprehensive agricultural management platform with AI assistance, weather monitoring, and voice interaction capabilities.

## Features

- 🤖 **AI Assistant**: Powered by Google Gemini for agricultural advice
- 🌤️ **Weather Integration**: Real-time weather data and forecasts
- 🎤 **Voice Interaction**: Speech recognition and synthesis
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔐 **User Authentication**: Secure login and user management
- 📊 **Dashboard**: Comprehensive agricultural management tools

## Voice Assistant Troubleshooting

If you're experiencing issues with the voice assistant not working, follow these steps:

### 1. Browser Permissions
- **Chrome/Edge**: Click the microphone icon in the address bar and allow microphone access
- **Firefox**: Click the microphone icon in the address bar and allow microphone access
- **Safari**: Go to Safari > Preferences > Websites > Microphone and allow access

### 2. HTTPS Requirement
- Voice recognition requires HTTPS (except on localhost)
- If running locally, make sure you're using `http://localhost:3000`
- For production, ensure your site uses HTTPS

### 3. Browser Compatibility
- **Chrome**: Full support for speech recognition and synthesis
- **Edge**: Full support for speech recognition and synthesis
- **Firefox**: Limited support, may not work properly
- **Safari**: Limited support, may not work properly

### 4. Testing Voice Features
1. Click the **Bot icon** in the header to open the debug panel
2. Click **"Test Mic"** to test microphone access
3. Click **"Test Speech"** to test speech synthesis
4. Check the browser console (F12) for detailed error messages

### 5. Common Issues and Solutions

#### Issue: "Speech recognition not supported"
**Solution**: 
- Use Chrome or Edge browser
- Ensure you're on HTTPS or localhost
- Check if your browser supports Web Speech API

#### Issue: "Microphone permission denied"
**Solution**:
- Allow microphone access when prompted
- Check browser settings for microphone permissions
- Refresh the page and try again

#### Issue: "No sound from speech synthesis"
**Solution**:
- Check your system volume
- Ensure browser has permission to play audio
- Try refreshing the page
- Check if your system has text-to-speech voices installed

#### Issue: "Voice assistant not responding"
**Solution**:
- Check internet connection
- Ensure the AI service is working
- Try the test buttons in the debug panel
- Check browser console for errors

### 6. Debug Panel
The debug panel shows:
- Voice service support status
- Current speaking/listening state
- Protocol information
- Quick test buttons
- Error messages

### 7. Console Debugging
Open browser console (F12) and look for:
- `VoiceService:` prefixed messages
- Error messages related to speech recognition
- Permission denied errors
- Network errors

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## Voice Assistant Usage

1. **Start Live Assistant**: Click the microphone button to start voice interaction
2. **Speak naturally**: Ask questions about farming, weather, or agricultural practices
3. **Visual feedback**: Watch the status indicators in the header
4. **Debug issues**: Use the debug panel (Bot icon) to troubleshoot problems

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **AI**: Google Gemini API
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Weather**: OpenWeatherMap API
- **Voice**: Web Speech API

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly, especially voice features
5. Submit a pull request

## Support

If you continue to have voice assistant issues:
1. Check the debug panel for specific error messages
2. Review browser console logs
3. Try different browsers (Chrome/Edge recommended)
4. Ensure all permissions are granted
5. Check your system's audio settings
