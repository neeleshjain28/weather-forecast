import React from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  LineChart, Line, Legend, CartesianGrid 
} from 'recharts';
import { 
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, 
  Snowflake, CloudLightning, HelpCircle, Thermometer, Droplets 
} from 'lucide-react';

// WMO weather code mapping helper
export function getWeatherDetails(code) {
  if (code === 0) return { label: 'Clear Sky', icon: Sun, color: 'text-amber-400' };
  if ([1, 2, 3].includes(code)) return { label: 'Partly Cloudy', icon: CloudSun, color: 'text-sky-300' };
  if ([45, 48].includes(code)) return { label: 'Foggy', icon: CloudFog, color: 'text-gray-400' };
  if ([51, 53, 55].includes(code)) return { label: 'Drizzle', icon: CloudDrizzle, color: 'text-blue-300' };
  if ([61, 63, 65, 80, 81, 82].includes(code)) return { label: 'Rainy', icon: CloudRain, color: 'text-blue-400' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Snowy', icon: Snowflake, color: 'text-sky-200' };
  if ([95, 96, 99].includes(code)) return { label: 'Thunderstorm', icon: CloudLightning, color: 'text-purple-400' };
  return { label: 'Unknown', icon: HelpCircle, color: 'text-gray-400' };
}

export default function AnalyticsDashboard({ forecastData, tempUnit = 'C' }) {
  if (!forecastData || !forecastData.current) return null;

  const current = forecastData.current;
  const hourly = forecastData.hourly;
  const daily = forecastData.daily;

  // Temperature unit conversion helper
  const formatTemp = (val) => {
    if (tempUnit === 'F') {
      return Math.round((val * 9/5) + 32);
    }
    return Math.round(val);
  };

  // 1. Process 24h Hourly Data
  const hourlyData = [];
  const now = new Date();
  const currentHour = now.getHours();

  for (let i = 0; i < 24; i++) {
    const timeStr = hourly.time[i];
    const hourVal = new Date(timeStr).getHours();
    
    // Add is_now flag to the current hour
    const isNow = hourVal === currentHour;

    hourlyData.push({
      time: `${hourVal.toString().padStart(2, '0')}:00`,
      temp: formatTemp(hourly.temperature_2m[i]),
      rainChance: hourly.precipitation_probability[i],
      isNow
    });
  }

  // 2. Process 7-Day Data
  const dailyData = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(daily.time[i]);
    const dayName = i === 0 ? 'Today' : daysOfWeek[date.getDay()];
    const code = daily.weather_code[i];
    const details = getWeatherDetails(code);

    dailyData.push({
      dayName,
      dateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      maxTemp: formatTemp(daily.temperature_2m_max[i]),
      minTemp: formatTemp(daily.temperature_2m_min[i]),
      rainChance: daily.precipitation_probability_max[i] || 0,
      details,
      code
    });
  }

  return (
    <div className="space-y-6">
      
      {/* 24-Hour Trends Chart */}
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-indigo-400" />
              24-Hour Forecast Trend
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Real-time hourly variations in temperature and rain probability</p>
          </div>
          
          <div className="flex gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-500 block"></span> Temp (°{tempUnit})</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-400 block"></span> Rain Probability (%)</span>
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                yAxisId="left" 
                stroke="#9ca3af" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                domain={['auto', 'auto']}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#9ca3af" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.85)', 
                  borderColor: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Area 
                yAxisId="left" 
                type="monotone" 
                dataKey="temp" 
                stroke="#6366f1" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorTemp)" 
              />
              <Area 
                yAxisId="right" 
                type="monotone" 
                dataKey="rainChance" 
                stroke="#60a5fa" 
                strokeWidth={1.5}
                fillOpacity={1} 
                fill="url(#colorRain)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7-Day Weather Forecast Dashboard */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 px-1">
          <CloudSun className="w-5 h-5 text-indigo-400" />
          7-Day Forecast
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {dailyData.map((day, idx) => {
            const IconComp = day.details.icon;
            return (
              <div 
                key={idx} 
                className="glass-panel border border-white/5 rounded-2xl p-4 flex flex-col justify-between items-center text-center glass-card"
              >
                <div>
                  <span className="text-xs font-bold block">{day.dayName}</span>
                  <span className="text-3xs text-gray-400 block mt-0.5">{day.dateFormatted}</span>
                </div>
                
                <div className="my-4 flex flex-col items-center">
                  <IconComp className={`w-8 h-8 ${day.details.color} drop-shadow-md`} />
                  <span className="text-3xs text-gray-400 mt-1 leading-none">{day.details.label}</span>
                </div>

                <div className="w-full">
                  <div className="flex justify-center gap-3 text-xs font-bold">
                    <span className="text-gray-100">{day.maxTemp}°</span>
                    <span className="text-gray-400">{day.minTemp}°</span>
                  </div>
                  {day.rainChance > 10 && (
                    <div className="flex items-center justify-center gap-0.5 text-blue-400 mt-2">
                      <Droplets className="w-3 h-3" />
                      <span className="text-3xs font-semibold">{day.rainChance}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
