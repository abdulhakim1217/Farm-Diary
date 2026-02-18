import React, { useState } from 'react';
import { Cloud, Search, History, MapPin, User, LogIn, UserPlus, LogOut } from 'lucide-react';

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  timestamp: string;
}

interface SearchLog {
  id: string;
  city: string;
  timestamp: string;
  success: boolean;
}

interface UserData {
  email: string;
  name: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<UserData | null>(null);
  
  // Auth form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'weather' | 'logs'>('weather');
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);

  // Replace with your OpenWeatherMap API key
  const API_KEY = '27dc6c697c344e49115d4dbe14f4ce0e';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!email || !password) {
      setAuthError('Please fill in all fields');
      return;
    }

    // Simulate login (in real app, call your backend API)
    setUser({ email, name: email.split('@')[0] });
    setIsAuthenticated(true);
    setEmail('');
    setPassword('');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!name || !email || !password) {
      setAuthError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    // Simulate registration (in real app, call your backend API)
    setUser({ email, name });
    setIsAuthenticated(true);
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setWeather(null);
    setSearchLogs([]);
  };

  const searchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');
    
    const logEntry: SearchLog = {
      id: Date.now().toString(),
      city: city,
      timestamp: new Date().toLocaleString(),
      success: false
    };

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('City not found');
      }

      const data = await response.json();
      
      const weatherData: WeatherData = {
        city: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        timestamp: new Date().toLocaleString()
      };

      setWeather(weatherData);
      logEntry.success = true;
      setSearchLogs(prev => [logEntry, ...prev]);
    } catch (err) {
      setError('Failed to fetch weather data. Please check the city name.');
      setSearchLogs(prev => [logEntry, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchWeather();
    }
  };

  // Login/Register Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 p-3 sm:p-4 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Auth Mode Tabs */}
            <div className="flex rounded-t-2xl overflow-hidden">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`flex-1 py-3 sm:py-4 font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all ${
                  authMode === 'login'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                Login
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`flex-1 py-3 sm:py-4 font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all ${
                  authMode === 'register'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                Register
              </button>
            </div>

            {/* Form Content */}
            <div className="p-5 sm:p-6 md:p-8">
              <div className="text-center mb-4 sm:mb-5">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3">
                  <Cloud className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {authMode === 'login' ? 'Welcome Back!' : 'Create Account'}
                </h2>
                <p className="text-gray-600 mt-1 text-sm">
                  {authMode === 'login' 
                    ? 'Login to access weather information' 
                    : 'Register to start tracking weather'}
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm text-center">{authError}</p>
                </div>
              )}

              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-3 sm:space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {authMode === 'login' ? (
                      <>
                        <LogIn className="w-5 h-5" />
                        Sign In
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-5 text-center text-sm text-gray-600">
                {authMode === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setAuthMode('register')}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Register here
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      onClick={() => setAuthMode('login')}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Login here
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Weather App (after authentication)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with User Info */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">{user?.name}</p>
                <p className="text-blue-100 text-sm">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-blue-500 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Cloud className="w-10 h-10 text-white" />
            <h1 className="text-4xl font-bold text-white">Weather App</h1>
          </div>
          <p className="text-blue-100">Search for weather information worldwide</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-lg shadow-lg">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('weather')}
              className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'weather'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MapPin className="w-5 h-5" />
              Weather Search
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'logs'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <History className="w-5 h-5" />
              Search Logs ({searchLogs.length})
            </button>
          </div>

          {/* Weather Tab */}
          {activeTab === 'weather' && (
            <div className="p-6">
              {/* Search Input */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter city name..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={searchWeather}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-red-500 text-sm">{error}</p>
                )}
              </div>

              {/* Weather Display */}
              {weather && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{weather.city}</h2>
                  <p className="text-gray-600 text-sm mb-4">{weather.timestamp}</p>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-6xl font-bold text-blue-600">{weather.temperature}°C</div>
                      <p className="text-xl text-gray-700 capitalize mt-2">{weather.description}</p>
                    </div>
                    <Cloud className="w-24 h-24 text-blue-400" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-600 text-sm">Humidity</p>
                      <p className="text-2xl font-semibold text-gray-800">{weather.humidity}%</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-gray-600 text-sm">Wind Speed</p>
                      <p className="text-2xl font-semibold text-gray-800">{weather.windSpeed} m/s</p>
                    </div>
                  </div>
                </div>
              )}

              {!weather && !loading && (
                <div className="text-center py-12 text-gray-500">
                  <Cloud className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Enter a city name to get weather information</p>
                </div>
              )}
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Search History</h2>
              
              {searchLogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No search history yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        log.success
                          ? 'bg-green-50 border-green-500'
                          : 'bg-red-50 border-red-500'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{log.city}</p>
                          <p className="text-sm text-gray-600">{log.timestamp}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            log.success
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {log.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
