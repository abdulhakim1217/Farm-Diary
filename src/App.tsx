import React, { useState, useEffect } from 'react';
import { Cloud, Search, History, MapPin, User, LogIn, UserPlus, LogOut, Sun, CloudRain, CloudSnow, Wind, Droplets, Eye, Gauge } from 'lucide-react';

interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex?: number;
  icon: string;
  timestamp: string;
}

interface SearchLog {
  id: string;
  city: string;
  timestamp: string;
  success: boolean;
  error?: string;
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

  // Load saved data on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('weatherAppUser');
    const savedLogs = localStorage.getItem('weatherAppLogs');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    
    if (savedLogs) {
      setSearchLogs(JSON.parse(savedLogs));
    }
  }, []);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('weatherAppLogs', JSON.stringify(searchLogs));
  }, [searchLogs]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!email || !password) {
      setAuthError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setAuthError('Please enter a valid email address');
      return;
    }

    // Simulate login (in real app, call your backend API)
    const userData = { email, name: email.split('@')[0] };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('weatherAppUser', JSON.stringify(userData));
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

    if (!email.includes('@')) {
      setAuthError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    // Simulate registration (in real app, call your backend API)
    const userData = { email, name };
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('weatherAppUser', JSON.stringify(userData));
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setWeather(null);
    localStorage.removeItem('weatherAppUser');
  };

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      '01d': <Sun className="w-full h-full text-yellow-500" />,
      '01n': <Sun className="w-full h-full text-yellow-400" />,
      '02d': <Cloud className="w-full h-full text-gray-400" />,
      '02n': <Cloud className="w-full h-full text-gray-500" />,
      '03d': <Cloud className="w-full h-full text-gray-500" />,
      '03n': <Cloud className="w-full h-full text-gray-600" />,
      '04d': <Cloud className="w-full h-full text-gray-600" />,
      '04n': <Cloud className="w-full h-full text-gray-700" />,
      '09d': <CloudRain className="w-full h-full text-blue-500" />,
      '09n': <CloudRain className="w-full h-full text-blue-600" />,
      '10d': <CloudRain className="w-full h-full text-blue-500" />,
      '10n': <CloudRain className="w-full h-full text-blue-600" />,
      '11d': <CloudRain className="w-full h-full text-purple-500" />,
      '11n': <CloudRain className="w-full h-full text-purple-600" />,
      '13d': <CloudSnow className="w-full h-full text-blue-200" />,
      '13n': <CloudSnow className="w-full h-full text-blue-300" />,
      '50d': <Cloud className="w-full h-full text-gray-400" />,
      '50n': <Cloud className="w-full h-full text-gray-500" />,
    };
    return iconMap[iconCode] || <Cloud className="w-full h-full text-blue-400" />;
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
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'City not found');
      }

      const data = await response.json();
      
      const weatherData: WeatherData = {
        city: data.name,
        country: data.sys.country,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        pressure: data.main.pressure,
        visibility: Math.round(data.visibility / 1000), // Convert to km
        icon: data.weather[0].icon,
        timestamp: new Date().toLocaleString()
      };

      setWeather(weatherData);
      logEntry.success = true;
      setSearchLogs(prev => [logEntry, ...prev.slice(0, 49)]); // Keep only last 50 searches
      setCity(''); // Clear search input
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch weather data. Please check the city name.';
      setError(errorMessage);
      logEntry.error = errorMessage;
      setSearchLogs(prev => [logEntry, ...prev.slice(0, 49)]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchWeather();
    }
  };

  const clearLogs = () => {
    setSearchLogs([]);
    localStorage.removeItem('weatherAppLogs');
  };

  // Login/Register Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 p-3 sm:p-4 overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center py-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
            {/* Auth Mode Tabs */}
            <div className="flex rounded-t-3xl overflow-hidden">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`flex-1 py-4 font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LogIn className="w-5 h-5" />
                Login
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`flex-1 py-4 font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                  authMode === 'register'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                Register
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
                  <Cloud className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {authMode === 'login' ? 'Welcome Back!' : 'Create Account'}
                </h2>
                <p className="text-gray-600">
                  {authMode === 'login' 
                    ? 'Login to access weather information' 
                    : 'Register to start tracking weather'}
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm text-center font-medium">{authError}</p>
                </div>
              )}

              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-purple-600 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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

              <div className="mt-6 text-center text-sm text-gray-600">
                {authMode === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setAuthMode('register')}
                      className="text-blue-600 font-semibold hover:underline transition-all duration-200"
                    >
                      Register here
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      onClick={() => setAuthMode('login')}
                      className="text-blue-600 font-semibold hover:underline transition-all duration-200"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 p-3 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with User Info */}
        <div className="text-center mb-6 pt-4">
          <div className="flex items-center justify-between mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-lg">{user?.name}</p>
                <p className="text-blue-100 text-sm">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 flex items-center gap-2 font-semibold border border-white/20"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 mb-3">
            <Cloud className="w-12 h-12 text-white" />
            <h1 className="text-4xl sm:text-5xl font-bold text-white">Weather Pro</h1>
          </div>
          <p className="text-blue-100 text-lg">Professional weather tracking worldwide</p>
        </div>

        {/* Tabs */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('weather')}
              className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'weather'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MapPin className="w-5 h-5" />
              Weather Search
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                activeTab === 'logs'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <History className="w-5 h-5" />
              Search History ({searchLogs.length})
            </button>
          </div>

          {/* Weather Tab */}
          {activeTab === 'weather' && (
            <div className="p-6 sm:p-8">
              {/* Search Input */}
              <div className="mb-8">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter city name (e.g., London, New York, Tokyo)"
                    className="flex-1 px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base transition-all duration-200"
                    disabled={loading}
                  />
                  <button
                    onClick={searchWeather}
                    disabled={loading}
                    className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                  >
                    <Search className="w-5 h-5" />
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}
              </div>

              {/* Weather Display */}
              {weather && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-1">
                        {weather.city}, {weather.country}
                      </h2>
                      <p className="text-gray-600 text-sm">{weather.timestamp}</p>
                    </div>
                    <div className="w-16 h-16 sm:w-20 sm:h-20">
                      {getWeatherIcon(weather.icon)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="text-center lg:text-left">
                      <div className="text-6xl sm:text-7xl font-bold text-blue-600 mb-2">
                        {weather.temperature}°C
                      </div>
                      <p className="text-xl text-gray-700 capitalize mb-2">{weather.description}</p>
                      <p className="text-gray-600">Feels like {weather.feelsLike}°C</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                        <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Humidity</p>
                        <p className="text-xl font-semibold text-gray-800">{weather.humidity}%</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                        <Wind className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Wind Speed</p>
                        <p className="text-xl font-semibold text-gray-800">{weather.windSpeed} km/h</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                        <Gauge className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Pressure</p>
                        <p className="text-xl font-semibold text-gray-800">{weather.pressure} hPa</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                        <Eye className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Visibility</p>
                        <p className="text-xl font-semibold text-gray-800">{weather.visibility} km</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!weather && !loading && (
                <div className="text-center py-16 text-gray-500">
                  <Cloud className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Ready to explore weather?</h3>
                  <p>Enter a city name above to get detailed weather information</p>
                </div>
              )}
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Search History</h2>
                {searchLogs.length > 0 && (
                  <button
                    onClick={clearLogs}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 text-sm font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {searchLogs.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <History className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No search history yet</h3>
                  <p>Your weather searches will appear here</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md ${
                        log.success
                          ? 'bg-green-50 border-green-500 hover:bg-green-100'
                          : 'bg-red-50 border-red-500 hover:bg-red-100'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-lg">{log.city}</p>
                          <p className="text-sm text-gray-600 mt-1">{log.timestamp}</p>
                          {!log.success && log.error && (
                            <p className="text-sm text-red-600 mt-2 font-medium">{log.error}</p>
                          )}
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