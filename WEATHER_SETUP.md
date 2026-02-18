# Weather API Integration Setup

## Getting Your API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API Keys section
4. Copy your API key

## Setup Instructions

1. Open `src/App.tsx`
2. Find the line: `const API_KEY = 'YOUR_API_KEY_HERE';`
3. Replace `'YOUR_API_KEY_HERE'` with your actual API key

## Features

- **Weather Search Tab**: Search for current weather by city name
- **Search Logs Tab**: View history of all searches with success/failure status
- Real-time weather data including temperature, humidity, and wind speed
- Responsive design with Tailwind CSS
- Search by pressing Enter or clicking the Search button

## Running the App

```bash
cd Farm-Dairy
npm install
npm run dev
```

## API Information

- Free tier: 60 calls/minute, 1,000,000 calls/month
- Data updates every 10 minutes
- Supports 200,000+ cities worldwide
