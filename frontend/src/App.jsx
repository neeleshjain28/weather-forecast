import React, { useState, useEffect } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  Sun, Moon, Globe, Star, Trash2, Search, MapPin, 
  Sparkles, FileDown, Share2, AlertOctagon, HelpCircle, 
  Menu, X, Loader2, RefreshCw, BarChart2, ShieldAlert
} from 'lucide-react';

import AnalyticsDashboard, { getWeatherDetails } from './components/AnalyticsDashboard';
import WeatherCompare from './components/WeatherCompare';
import WeatherMap from './components/WeatherMap';
import AqiAnalytics from './components/AqiAnalytics';
import SmartRecommendations from './components/SmartRecommendations';
import HistoryAnalytics from './components/HistoryAnalytics';
import AIChatbot from './components/AIChatbot';

const translations = {
  en: {
    title: 'uptowheather',
    searchPlaceholder: 'Search city...',
    currentWeather: 'Current Weather',
    feelsLike: 'Feels Like',
    humidity: 'Humidity',
    windSpeed: 'Wind Speed',
    visibility: 'Visibility',
    uvIndex: 'UV Index',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    airQuality: 'Air Quality',
    forecast: 'Forecast',
    compare: 'City Compare',
    map: 'Weather Map',
    aqiAnalytics: 'Air Quality',
    smartOutfit: 'Outfit Recommendations',
    activityEngine: 'Activity Index',
    travelAdvisor: 'Travel Advisor',
    historyAnalytics: 'Weather History',
    alerts: 'Severe Warnings',
    aiAssistant: 'Chatbot',
    favorites: 'Favorites',
    recentSearches: 'Recent Searches',
    clearAll: 'Clear All',
    noAlerts: 'No active weather warnings.',
    exportPDF: 'Export PDF',
    shareReport: 'Share Report',
    detectLocation: 'Detect Location',
    loading: 'Loading uptowheather Analytics...',
    errorMsg: 'Failed to retrieve city weather data.',
    today: 'Today',
    hourly: 'Hourly'
  },
  es: {
    title: 'uptowheather',
    searchPlaceholder: 'Buscar ciudad...',
    currentWeather: 'Clima Actual',
    feelsLike: 'Sensación Térmica',
    humidity: 'Humedad',
    windSpeed: 'Velocidad Viento',
    visibility: 'Visibilidad',
    uvIndex: 'Índice UV',
    sunrise: 'Amanecer',
    sunset: 'Atardecer',
    airQuality: 'Aire',
    forecast: 'Pronóstico',
    compare: 'Comparar',
    map: 'Mapa de Clima',
    aqiAnalytics: 'Calidad del Aire',
    smartOutfit: 'Ropa Recomendada',
    activityEngine: 'Actividades',
    travelAdvisor: 'Asesor de Viajes',
    historyAnalytics: 'Historial',
    alerts: 'Alertas',
    aiAssistant: 'Chatbot',
    favorites: 'Favoritos',
    recentSearches: 'Recientes',
    clearAll: 'Borrar todo',
    noAlerts: 'Sin advertencias activas.',
    exportPDF: 'Exportar PDF',
    shareReport: 'Compartir Clima',
    detectLocation: 'Detectar Ubicación',
    loading: 'Cargando uptowheather...',
    errorMsg: 'Clima no encontrado.',
    today: 'Hoy',
    hourly: 'Por hora'
  },
  de: {
    title: 'uptowheather',
    searchPlaceholder: 'Stadt suchen...',
    currentWeather: 'Aktuelles Wetter',
    feelsLike: 'Gefühlt wie',
    humidity: 'Feuchtigkeit',
    windSpeed: 'Windtempo',
    visibility: 'Sicht',
    uvIndex: 'UV-Index',
    sunrise: 'Aufgang',
    sunset: 'Untergang',
    airQuality: 'Luftqualität',
    forecast: 'Vorhersage',
    compare: 'Vergleich',
    map: 'Wetterkarte',
    aqiAnalytics: 'Luftqualität',
    smartOutfit: 'Outfit-Tipps',
    activityEngine: 'Aktivitäten',
    travelAdvisor: 'Reiseplaner',
    historyAnalytics: 'Verlauf',
    alerts: 'Warnungen',
    aiAssistant: 'Chatbot',
    favorites: 'Lieblingsstädte',
    recentSearches: 'Verlauf',
    clearAll: 'Löschen',
    noAlerts: 'Keine Wetterwarnungen.',
    exportPDF: 'Export PDF',
    shareReport: 'Teilen',
    detectLocation: 'Standort orten',
    loading: 'Lade uptowheather...',
    errorMsg: 'Wetterdaten konnten nicht geladen werden.',
    today: 'Heute',
    hourly: 'Stündlich'
  },
  hi: {
    title: 'uptowheather',
    searchPlaceholder: 'शहर खोजें...',
    currentWeather: 'वर्तमान मौसम',
    feelsLike: 'महसूस',
    humidity: 'नमी',
    windSpeed: 'हवा',
    visibility: 'दृश्यता',
    uvIndex: 'यूवी इंडेक्स',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्त',
    airQuality: 'वायु',
    forecast: 'पूर्वानुमान',
    compare: 'तुलना',
    map: 'नक्शा',
    aqiAnalytics: 'वायु गुणवत्ता',
    smartOutfit: 'स्मार्ट कपड़े',
    activityEngine: 'खेल / व्यायाम',
    travelAdvisor: 'यात्रा सलाह',
    historyAnalytics: 'मौसम इतिहास',
    alerts: 'चेतावनी',
    aiAssistant: 'चैटबॉट',
    favorites: 'पसंदीदा',
    recentSearches: 'खोजें',
    clearAll: 'साफ़ करें',
    noAlerts: 'कोई सक्रिय चेतावनी नहीं है।',
    exportPDF: 'निर्यात PDF',
    shareReport: 'साझा करें',
    detectLocation: 'लोकेशन खोजें',
    loading: 'मौसम विश्लेषण लोड हो रहा है...',
    errorMsg: 'शहर का मौसम नहीं मिला।',
    today: 'आज',
    hourly: 'प्रति घंटा'
  }
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [unit, setUnit] = useState('C');
  const [theme, setTheme] = useState('dark');
  
  const [query, setQuery] = useState('Delhi');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'compare' | 'map' | 'aqi' | 'advisors' | 'history' | 'ai'
  
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = translations[lang] || translations.en;

  // Initialize theme and load initial city weather
  useEffect(() => {
    const savedTheme = localStorage.getItem('uptowheather_theme') || 'dark';
    setTheme(savedTheme);
    document.body.className = savedTheme;
    
    fetchWeather('Delhi');
    fetchFavorites();
    fetchHistory();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('uptowheather_theme', nextTheme);
    document.body.className = nextTheme;
  };

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/weather/search?city=${encodeURIComponent(cityName)}`);
      setWeather(res.data);
      fetchHistory(); // refresh history list
    } catch (err) {
      setError(err.response?.data?.error || t.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon, name) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/api/weather/coords?lat=${lat}&lon=${lon}&name=${name || ''}`);
      setWeather(res.data);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || t.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude, 'My Location');
      },
      (err) => {
        alert('Unable to access location. Please search for your city manually.');
      }
    );
  };

  // FAVORITES OPERATIONS
  const fetchFavorites = async () => {
    try {
      const res = await axios.get('/api/favorites');
      setFavorites(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!weather) return;
    const isFav = favorites.find(f => f.cityName.toLowerCase() === weather.cityName.toLowerCase());
    
    try {
      if (isFav) {
        await axios.delete(`/api/favorites/${isFav._id}`);
      } else {
        await axios.post('/api/favorites', {
          cityName: weather.cityName,
          lat: weather.latitude,
          lon: weather.longitude,
          country: weather.country
        });
      }
      fetchFavorites();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  // HISTORY OPERATIONS
  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearHistory = async () => {
    try {
      await axios.delete('/api/history');
      setHistory([]);
    } catch (err) {
      console.error(err);
    }
  };

  // PDF EXPORT
  const handleExportPDF = () => {
    const element = document.getElementById('dashboard-capture');
    if (!element) return;

    const opt = {
      scale: 1.8,
      useCORS: true,
      scrollY: -window.scrollY
    };

    html2canvas(element, opt).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`uptowheather_${weather?.cityName || 'Weather'}_Report.pdf`);
    });
  };

  // COPY REPORT SHARE
  const handleShareReport = () => {
    if (!weather) return;
    const current = weather.forecast.current;
    const text = `🌤️ Weather Report: ${weather.cityName}, ${weather.country}\n🌡️ Temperature: ${current.temperature_2m}°C (feels like ${current.apparent_temperature}°C)\n💧 Humidity: ${current.relative_humidity_2m}%\n💨 Wind: ${current.wind_speed_10m} km/h\n🌫️ AQI: ${weather.aqi?.current?.us_aqi || 'N/A'}\n- Generated via uptowheather`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert('Weather report copied to clipboard!');
    }).catch(err => {
      console.error(err);
    });
  };

  // SCAN FOR DYNAMIC SEVERE ALERTS
  const getSevereAlerts = () => {
    if (!weather) return [];
    const cur = weather.forecast.current;
    const aqiVal = weather.aqi?.current?.us_aqi || 0;
    const alerts = [];

    if (cur.temperature_2m > 38) {
      alerts.push({ type: 'danger', message: 'Heatwave Alert: Temperatures exceeding 38°C. Stay hydrated.' });
    }
    if (cur.temperature_2m < 2) {
      alerts.push({ type: 'warning', message: 'Frost Alert: Sub-zero temperatures expected. Protect crop structures.' });
    }
    if (cur.precipitation > 4) {
      alerts.push({ type: 'danger', message: 'Heavy Rain Warning: Active downpours could trigger flash floods.' });
    }
    if (cur.wind_speed_10m > 25) {
      alerts.push({ type: 'warning', message: 'Gale Warning: High wind gusts. Caution with outdoor structures.' });
    }
    if (aqiVal > 150) {
      alerts.push({ type: 'danger', message: 'Air Quality Emergency: Critical AQI level. Stay indoors.' });
    } else if (aqiVal > 100) {
      alerts.push({ type: 'warning', message: 'Air Quality Advisory: AQI unhealthy for sensitive groups.' });
    }
    if ([95, 96, 99].includes(cur.weather_code)) {
      alerts.push({ type: 'danger', message: 'Severe Thunderstorm Warning: Hail and cloud lighting active.' });
    }

    return alerts;
  };

  const currentAlerts = getSevereAlerts();
  const weatherDetails = weather ? getWeatherDetails(weather.forecast.current.weather_code) : null;
  const WeatherIcon = weatherDetails ? weatherDetails.icon : null;
  const isFavorite = weather && favorites.some(f => f.cityName.toLowerCase() === weather.cityName.toLowerCase());

  return (
    <div className="min-h-screen flex flex-col font-sans select-none pb-12 transition-all">
      
      {/* Dynamic Navbar */}
      <nav className="glass-panel sticky top-0 z-50 w-full py-4 px-6 border-b border-white/5 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-indigo-600 shadow-md text-white animate-spin-slow shrink-0">
            <Sun className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500 tracking-tight">
            {t.title}
          </span>
        </div>

        {/* Global Search Center Widget (Desktop) */}
        <div className="hidden md:flex items-center grow max-w-md mx-6 relative">
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWeather(query)}
            className="w-full pl-10 pr-24 py-2 rounded-full glass-input text-xs"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          
          <button 
            onClick={detectUserLocation}
            title={t.detectLocation}
            className="absolute right-14 top-1.5 p-1.5 rounded-full hover:bg-white/10 text-indigo-400 transition-all"
          >
            <MapPin className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => fetchWeather(query)}
            className="absolute right-1.5 top-1.5 px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-3xs transition-all"
          >
            Search
          </button>
        </div>

        {/* Settings Bar */}
        <div className="flex items-center gap-3">
          
          {/* Unit Toggle */}
          <button 
            onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}
            className="p-2 rounded-xl bg-black/10 dark:bg-white/5 hover:bg-indigo-500/10 border border-white/5 font-extrabold text-xs transition-all min-w-[36px]"
          >
            °{unit}
          </button>

          {/* Lang Selector */}
          <div className="relative flex items-center bg-black/10 dark:bg-white/5 border border-white/5 px-2 py-1 rounded-xl text-xs gap-1.5 font-bold cursor-pointer">
            <Globe className="w-4 h-4 text-indigo-400" />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-xs pr-1 font-bold text-inherit"
            >
              <option value="en" className="dark:bg-slate-900 dark:text-white">EN</option>
              <option value="es" className="dark:bg-slate-900 dark:text-white">ES</option>
              <option value="de" className="dark:bg-slate-900 dark:text-white">DE</option>
              <option value="hi" className="dark:bg-slate-900 dark:text-white">HI</option>
            </select>
          </div>

          {/* Dark / Light Toggle */}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-xl bg-black/10 dark:bg-white/5 hover:bg-indigo-500/10 border border-white/5 text-indigo-400 transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 rounded-xl bg-black/10 dark:bg-white/5 border border-white/5 text-gray-400"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </nav>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="glass-panel w-full p-6 border-b border-white/5 md:hidden animate-fade-in space-y-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={query} 
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && { ...fetchWeather(query), ...setMobileMenuOpen(false) }}
              className="w-full pl-10 pr-12 py-2.5 rounded-2xl glass-input text-xs"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <button 
              onClick={() => { fetchWeather(query); setMobileMenuOpen(false); }}
              className="absolute right-2 top-2 p-1.5 rounded-xl bg-indigo-600 text-white font-bold text-3xs"
            >
              Go
            </button>
          </div>

          <button 
            onClick={() => { detectUserLocation(); setMobileMenuOpen(false); }}
            className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-indigo-500/10 border border-white/5 text-indigo-400 font-bold text-xs flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" /> {t.detectLocation}
          </button>
        </div>
      )}

      {/* Secondary Bar: Tab Switch Menu */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-6 shrink-0">
        <div className="glass-panel p-1.5 rounded-2xl border border-white/5 flex flex-wrap gap-1 overflow-x-auto scrollbar-none z-10 relative">
          {[
            { id: 'dashboard', label: t.forecast, icon: BarChart2 },
            { id: 'map', label: t.map, icon: MapPin },
            { id: 'compare', label: t.compare, icon: RefreshCw },
            { id: 'aqi', label: t.aqiAnalytics, icon: ShieldAlert },
            { id: 'advisors', label: t.smartOutfit, icon: Sparkles },
            { id: 'history', label: t.historyAnalytics, icon: BarChart2 },
            { id: 'ai', label: t.aiAssistant, icon: HelpCircle }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-3xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  active 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-400 hover:text-indigo-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Body */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6 grow items-start">
        
        {/* Left Hand Column: Favorites, History, Controls */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Favorites Card */}
          <div className="glass-panel rounded-3xl p-5 border border-white/5">
            <h3 className="text-2xs font-extrabold uppercase tracking-wider mb-3 text-indigo-400 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-indigo-400 fill-indigo-400" />
              {t.favorites}
            </h3>
            {favorites.length === 0 ? (
              <p className="text-3xs text-gray-400 leading-normal">
                Click the favorite star on searched cities to save them here for quick lookup!
              </p>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar">
                {favorites.map(fav => (
                  <div 
                    key={fav._id} 
                    className="flex justify-between items-center bg-black/10 dark:bg-white/5 border border-white/5 px-3 py-2 rounded-xl hover:bg-indigo-500/10 cursor-pointer transition-all"
                  >
                    <div 
                      onClick={() => fetchWeather(fav.cityName)}
                      className="grow"
                    >
                      <span className="text-xs font-bold block">{fav.cityName}</span>
                      <span className="text-3xs text-gray-400">{fav.country}</span>
                    </div>
                    
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await axios.delete(`/api/favorites/${fav._id}`);
                          fetchFavorites();
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="p-1 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Searches */}
          <div className="glass-panel rounded-3xl p-5 border border-white/5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-2xs font-extrabold uppercase tracking-wider text-indigo-400">
                {t.recentSearches}
              </h3>
              {history.length > 0 && (
                <button 
                  onClick={handleClearHistory}
                  className="text-3xs text-rose-400 font-bold hover:underline"
                >
                  {t.clearAll}
                </button>
              )}
            </div>
            
            {history.length === 0 ? (
              <p className="text-3xs text-gray-400 leading-normal">No recent searches yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar">
                {history.map(hist => (
                  <button 
                    key={hist._id}
                    onClick={() => fetchWeather(hist.query)}
                    className="w-full text-left bg-black/5 dark:bg-white/3 border border-white/3 px-3 py-1.5 rounded-lg text-3xs font-semibold hover:bg-indigo-500/10 transition-all truncate"
                  >
                    🔍 {hist.query}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Severe Weather Warnings */}
          <div className="glass-panel rounded-3xl p-5 border border-white/5">
            <h3 className="text-2xs font-extrabold uppercase tracking-wider mb-3 text-rose-400 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 animate-bounce" />
              {t.alerts}
            </h3>
            {currentAlerts.length === 0 ? (
              <p className="text-3xs text-gray-400 leading-normal">{t.noAlerts}</p>
            ) : (
              <div className="space-y-2.5">
                {currentAlerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl border text-3xs font-semibold leading-relaxed ${
                      alert.type === 'danger' 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    }`}
                  >
                    {alert.message}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Center / Right Content Panel (Dynamic according to Active Tab) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Main loader skeleton or error prompt */}
          {loading ? (
            <div className="glass-panel p-12 rounded-3xl flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
              <p className="text-sm font-semibold tracking-wide animate-pulse">{t.loading}</p>
            </div>
          ) : error ? (
            <div className="glass-panel p-12 rounded-3xl flex flex-col items-center justify-center min-h-[400px] border-rose-500/20">
              <AlertOctagon className="w-12 h-12 text-rose-400 mb-3 animate-pulse" />
              <p className="text-sm font-bold text-rose-300">{error}</p>
              <button 
                onClick={() => fetchWeather('Delhi')}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all"
              >
                Reset Dashboard
              </button>
            </div>
          ) : weather ? (
            <div id="dashboard-capture" className="space-y-6">
              
              {/* CURRENT CONDITIONS BLOCK (Only show on Dashboard & Map tabs by default) */}
              {['dashboard', 'map', 'aqi', 'advisors'].includes(activeTab) && (
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  
                  {/* Decorative background glow */}
                  <div className="absolute -right-24 -top-24 w-60 h-60 bg-indigo-600/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
                  
                  <div className="flex items-center gap-4">
                    {/* WMO Weather Icon */}
                    <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 shrink-0 shadow-sm animate-float">
                      {WeatherIcon && <WeatherIcon className="w-12 h-12 text-indigo-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl md:text-2xl font-black tracking-tight">{weather.cityName}</h2>
                        <button 
                          onClick={handleToggleFavorite}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isFavorite 
                              ? 'bg-amber-500/15 border-amber-500/20 text-amber-400' 
                              : 'bg-white/5 border-white/5 text-gray-400 hover:text-indigo-400'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>
                      <span className="text-xs text-gray-400 font-semibold">{weather.country}</span>
                      
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-4xl md:text-5xl font-black tracking-tight">
                          {unit === 'C' ? Math.round(weather.forecast.current.temperature_2m) : Math.round((weather.forecast.current.temperature_2m * 9/5) + 32)}°{unit}
                        </span>
                        <span className="text-xs font-bold text-gray-400 leading-none">
                          {t.feelsLike}: {unit === 'C' ? Math.round(weather.forecast.current.apparent_temperature) : Math.round((weather.forecast.current.apparent_temperature * 9/5) + 32)}°{unit}
                        </span>
                      </div>
                      <span className="text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full inline-block mt-3 shadow-2xs">
                        {weatherDetails.label}
                      </span>
                    </div>
                  </div>

                  {/* Core Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto shrink-0">
                    
                    {/* Humidity */}
                    <div className="bg-white/3 dark:bg-white/2 border border-white/5 p-3 rounded-2xl min-w-[100px]">
                      <span className="text-4xs text-gray-400 font-extrabold uppercase block">{t.humidity}</span>
                      <span className="text-sm font-black mt-1 block">{weather.forecast.current.relative_humidity_2m}%</span>
                    </div>

                    {/* Wind Speed */}
                    <div className="bg-white/3 dark:bg-white/2 border border-white/5 p-3 rounded-2xl min-w-[100px]">
                      <span className="text-4xs text-gray-400 font-extrabold uppercase block">{t.windSpeed}</span>
                      <span className="text-sm font-black mt-1 block">{weather.forecast.current.wind_speed_10m} km/h</span>
                    </div>

                    {/* UV Index */}
                    <div className="bg-white/3 dark:bg-white/2 border border-white/5 p-3 rounded-2xl min-w-[100px]">
                      <span className="text-4xs text-gray-400 font-extrabold uppercase block">{t.uvIndex}</span>
                      <span className="text-sm font-black mt-1 block">{weather.forecast.current.uv_index}</span>
                    </div>

                    {/* Visibility */}
                    <div className="bg-white/3 dark:bg-white/2 border border-white/5 p-3 rounded-2xl min-w-[100px]">
                      <span className="text-4xs text-gray-400 font-extrabold uppercase block">{t.visibility}</span>
                      <span className="text-sm font-black mt-1 block">{(weather.forecast.current.visibility / 1000).toFixed(1)} km</span>
                    </div>

                  </div>

                  {/* Share & PDF Buttons */}
                  <div className="absolute right-4 bottom-4 flex gap-2">
                    <button 
                      onClick={handleShareReport}
                      title={t.shareReport}
                      className="p-1.5 rounded-lg bg-black/10 dark:bg-white/5 border border-white/5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={handleExportPDF}
                      title={t.exportPDF}
                      className="p-1.5 rounded-lg bg-black/10 dark:bg-white/5 border border-white/5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              )}

              {/* DYNAMIC COMPONENT RENDER */}
              {activeTab === 'dashboard' && (
                <AnalyticsDashboard forecastData={weather.forecast} tempUnit={unit} />
              )}

              {activeTab === 'map' && (
                <WeatherMap 
                  lat={weather.latitude} 
                  lon={weather.longitude} 
                  cityName={weather.cityName} 
                  forecastData={weather.forecast} 
                />
              )}

              {activeTab === 'compare' && (
                <WeatherCompare tempUnit={unit} />
              )}

              {activeTab === 'aqi' && (
                <AqiAnalytics aqiData={weather.aqi} />
              )}

              {activeTab === 'advisors' && (
                <SmartRecommendations forecastData={weather.forecast} aqiData={weather.aqi} />
              )}

              {activeTab === 'history' && (
                <HistoryAnalytics historyData={weather.history} tempUnit={unit} />
              )}

              {activeTab === 'ai' && (
                <AIChatbot 
                  weatherContext={{
                    cityName: weather.cityName,
                    country: weather.country,
                    forecast: weather.forecast,
                    aqi: weather.aqi
                  }} 
                />
              )}

            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl flex flex-col items-center justify-center min-h-[400px]">
              <Search className="w-12 h-12 text-indigo-400/50 mb-3 animate-pulse" />
              <p className="text-sm font-semibold">Ready to query uptowheather. Search for any location above!</p>
            </div>
          )}

        </div>

      </div>

      <footer className="w-full text-center py-6 mt-8 border-t border-white/5 text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wide">
        Developed with ❤️ by <span className="text-indigo-400 font-bold">Neelesh Jain</span>
      </footer>

    </div>
  );
}
