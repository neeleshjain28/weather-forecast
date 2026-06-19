import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader2, ArrowLeftRight, CheckCircle2, ShieldAlert, Sparkles, Wind, Droplets, Sun, AlertTriangle } from 'lucide-react';
import { getWeatherDetails } from './AnalyticsDashboard';

export default function WeatherCompare({ tempUnit = 'C' }) {
  const [queryA, setQueryA] = useState('');
  const [queryB, setQueryB] = useState('');
  
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  
  const [errorA, setErrorA] = useState('');
  const [errorB, setErrorB] = useState('');

  const formatTempValue = (celsius) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9/5) + 32)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  const handleSearch = async (cityNum, query) => {
    if (!query.trim()) return;
    
    if (cityNum === 'A') {
      setLoadingA(true);
      setErrorA('');
      setDataA(null);
    } else {
      setLoadingB(true);
      setErrorB('');
      setDataB(null);
    }

    try {
      const res = await axios.get(`/api/weather/search?city=${encodeURIComponent(query)}`);
      if (cityNum === 'A') {
        setDataA(res.data);
      } else {
        setDataB(res.data);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to fetch weather data';
      if (cityNum === 'A') setErrorA(errMsg);
      else setErrorB(errMsg);
    } finally {
      if (cityNum === 'A') setLoadingA(false);
      else setLoadingB(false);
    }
  };

  // Metrics to compare
  const getMetrics = () => {
    if (!dataA || !dataB) return [];

    const fA = dataA.forecast.current;
    const fB = dataB.forecast.current;
    const dA = dataA.forecast.daily;
    const dB = dataB.forecast.daily;
    
    const aqiA = dataA.aqi?.current?.us_aqi || 0;
    const aqiB = dataB.aqi?.current?.us_aqi || 0;

    return [
      {
        name: 'Temperature',
        icon: Sun,
        valA: fA.temperature_2m,
        valB: fB.temperature_2m,
        displayA: formatTempValue(fA.temperature_2m),
        displayB: formatTempValue(fB.temperature_2m),
        better: fA.temperature_2m < fB.temperature_2m ? 'A' : 'B', // cooler is better (general preference)
        betterLabel: 'Cooler',
        maxLimit: 50
      },
      {
        name: 'Feels-Like Temp',
        icon: Sun,
        valA: fA.apparent_temperature,
        valB: fB.apparent_temperature,
        displayA: formatTempValue(fA.apparent_temperature),
        displayB: formatTempValue(fB.apparent_temperature),
        better: fA.apparent_temperature < fB.apparent_temperature ? 'A' : 'B',
        betterLabel: 'Cooler',
        maxLimit: 50
      },
      {
        name: 'Air Quality (AQI)',
        icon: ShieldAlert,
        valA: aqiA,
        valB: aqiB,
        displayA: `${aqiA} AQI`,
        displayB: `${aqiB} AQI`,
        better: aqiA < aqiB ? 'A' : 'B', // lower AQI is cleaner
        betterLabel: 'Cleaner Air',
        maxLimit: 300
      },
      {
        name: 'Humidity',
        icon: Droplets,
        valA: fA.relative_humidity_2m,
        valB: fB.relative_humidity_2m,
        displayA: `${fA.relative_humidity_2m}%`,
        displayB: `${fB.relative_humidity_2m}%`,
        better: Math.abs(fA.relative_humidity_2m - 50) < Math.abs(fB.relative_humidity_2m - 50) ? 'A' : 'B', // closer to 50% humidity is comfortable
        betterLabel: 'More Comfortable',
        maxLimit: 100
      },
      {
        name: 'Wind Speed',
        icon: Wind,
        valA: fA.wind_speed_10m,
        valB: fB.wind_speed_10m,
        displayA: `${fA.wind_speed_10m} km/h`,
        displayB: `${fB.wind_speed_10m} km/h`,
        better: fA.wind_speed_10m < fB.wind_speed_10m ? 'A' : 'B', // calmer wind is better
        betterLabel: 'Calmer Wind',
        maxLimit: 60
      },
      {
        name: 'Rain Probability Today',
        icon: Droplets,
        valA: dA.precipitation_probability_max[0] || 0,
        valB: dB.precipitation_probability_max[0] || 0,
        displayA: `${dA.precipitation_probability_max[0] || 0}%`,
        displayB: `${dB.precipitation_probability_max[0] || 0}%`,
        better: (dA.precipitation_probability_max[0] || 0) < (dB.precipitation_probability_max[0] || 0) ? 'A' : 'B', // lower rain chance is better for outdoors
        betterLabel: 'Drier Weather',
        maxLimit: 100
      },
      {
        name: 'UV Index',
        icon: Sun,
        valA: fA.uv_index || 0,
        valB: fB.uv_index || 0,
        displayA: `${fA.uv_index || 0}`,
        displayB: `${fB.uv_index || 0}`,
        better: (fA.uv_index || 0) < (fB.uv_index || 0) ? 'A' : 'B', // lower UV exposure is safer
        betterLabel: 'Safer UV Level',
        maxLimit: 12
      }
    ];
  };

  const metrics = getMetrics();

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* City A Input */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 relative">
          <label className="text-2xs font-bold block mb-2 opacity-80 uppercase tracking-wider text-indigo-400">City A</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search City A..." 
              value={queryA} 
              onChange={(e) => setQueryA(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch('A', queryA)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <button 
              onClick={() => handleSearch('A', queryA)}
              className="absolute right-2 top-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition-all"
            >
              {loadingA ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
            </button>
          </div>
          {errorA && <p className="text-3xs text-rose-400 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errorA}</p>}

          {/* Quick Info City A */}
          {dataA && (
            <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 animate-fade-in">
              <div>
                <span className="font-extrabold text-sm block">{dataA.cityName}</span>
                <span className="text-3xs text-gray-400">{dataA.country}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold block">{formatTempValue(dataA.forecast.current.temperature_2m)}</span>
                <span className="text-3xs text-gray-400">{getWeatherDetails(dataA.forecast.current.weather_code).label}</span>
              </div>
            </div>
          )}
        </div>

        {/* City B Input */}
        <div className="glass-panel p-5 rounded-3xl border border-white/5 relative">
          <label className="text-2xs font-bold block mb-2 opacity-80 uppercase tracking-wider text-indigo-400">City B</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search City B..." 
              value={queryB} 
              onChange={(e) => setQueryB(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch('B', queryB)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <button 
              onClick={() => handleSearch('B', queryB)}
              className="absolute right-2 top-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition-all"
            >
              {loadingB ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
            </button>
          </div>
          {errorB && <p className="text-3xs text-rose-400 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errorB}</p>}

          {/* Quick Info City B */}
          {dataB && (
            <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 animate-fade-in">
              <div>
                <span className="font-extrabold text-sm block">{dataB.cityName}</span>
                <span className="text-3xs text-gray-400">{dataB.country}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold block">{formatTempValue(dataB.forecast.current.temperature_2m)}</span>
                <span className="text-3xs text-gray-400">{getWeatherDetails(dataB.forecast.current.weather_code).label}</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Comparison Grid */}
      {dataA && dataB ? (
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <h3 className="text-base font-bold flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-indigo-400 animate-pulse" />
              Side-by-Side Analytics
            </h3>
            <span className="text-2xs bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Comparison Mode
            </span>
          </div>

          <div className="space-y-6">
            {metrics.map((m, idx) => {
              const IconComp = m.icon;
              const isWinnerA = m.better === 'A';
              const percentA = Math.min((Math.max(m.valA, 0) / m.maxLimit) * 100, 100);
              const percentB = Math.min((Math.max(m.valB, 0) / m.maxLimit) * 100, 100);

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <IconComp className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-bold">{m.name}</span>
                    </div>
                    <span className="text-3xs text-indigo-400 font-bold uppercase tracking-wider">{m.betterLabel} winner: City {m.better}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    
                    {/* City A Bar */}
                    <div className="flex items-center gap-3">
                      <span className="w-24 text-right font-bold text-sm truncate">{dataA.cityName}</span>
                      <div className="grow bg-black/15 dark:bg-white/5 h-4 rounded-full overflow-hidden relative border border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isWinnerA 
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                              : 'bg-gray-500/40'
                          }`}
                          style={{ width: `${percentA || 5}%` }}
                        />
                      </div>
                      <span className={`w-14 font-extrabold text-xs text-right ${isWinnerA ? 'text-indigo-400' : 'text-gray-400'}`}>
                        {m.displayA}
                      </span>
                    </div>

                    {/* City B Bar */}
                    <div className="flex items-center gap-3">
                      <span className="w-24 text-right font-bold text-sm truncate">{dataB.cityName}</span>
                      <div className="grow bg-black/15 dark:bg-white/5 h-4 rounded-full overflow-hidden relative border border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            !isWinnerA 
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                              : 'bg-gray-500/40'
                          }`}
                          style={{ width: `${percentB || 5}%` }}
                        />
                      </div>
                      <span className={`w-14 font-extrabold text-xs text-right ${!isWinnerA ? 'text-indigo-400' : 'text-gray-400'}`}>
                        {m.displayB}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        <div className="glass-panel p-10 rounded-3xl border border-white/5 text-center flex flex-col items-center justify-center min-h-[300px]">
          <ArrowLeftRight className="w-12 h-12 text-indigo-400/50 mb-3 animate-pulse" />
          <p className="text-sm font-semibold max-w-sm">
            Search and select two cities above side-by-side to initiate an advanced comparison.
          </p>
          <span className="text-3xs text-gray-400 mt-1">E.g., Delhi vs Mumbai, New York vs London</span>
        </div>
      )}

    </div>
  );
}
