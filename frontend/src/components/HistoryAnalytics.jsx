import React from 'react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, Sun, Snowflake, Droplets, Info } from 'lucide-react';

export default function HistoryAnalytics({ historyData, tempUnit = 'C' }) {
  if (!historyData || !historyData.daily || !historyData.daily.time) {
    return (
      <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center min-h-[300px]">
        <BarChart3 className="w-12 h-12 text-indigo-400 mb-2 animate-bounce" />
        <p className="text-gray-400">Historical analytics data unavailable for this city.</p>
      </div>
    );
  }

  const daily = historyData.daily;
  const time = daily.time;
  const maxTemps = daily.temperature_2m_max;
  const minTemps = daily.temperature_2m_min;
  const meanTemps = daily.temperature_2m_mean;
  const precip = daily.precipitation_sum;

  // Temperature unit conversion helpers
  const formatTemp = (val) => {
    if (tempUnit === 'F') {
      return Math.round((val * 9/5) + 32);
    }
    return Math.round(val);
  };

  // 1. Compile chart data array
  const chartData = time.map((t, idx) => {
    const date = new Date(t);
    return {
      dateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      max: formatTemp(maxTemps[idx]),
      min: formatTemp(minTemps[idx]),
      mean: formatTemp(meanTemps[idx]),
      rain: precip[idx] || 0
    };
  });

  // 2. Compute key historical aggregates
  const sumMean = meanTemps.reduce((acc, v) => acc + v, 0);
  const avgTemp = formatTemp(sumMean / meanTemps.length);

  let hottestVal = -999;
  let hottestIdx = 0;
  let coldestVal = 999;
  let coldestIdx = 0;
  let totalRain = 0;

  maxTemps.forEach((val, idx) => {
    if (val > hottestVal) {
      hottestVal = val;
      hottestIdx = idx;
    }
  });

  minTemps.forEach((val, idx) => {
    if (val < coldestVal) {
      coldestVal = val;
      coldestIdx = idx;
    }
  });

  precip.forEach((val) => {
    totalRain += val || 0;
  });

  const hottestDate = new Date(time[hottestIdx]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const coldestDate = new Date(time[coldestIdx]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6">
      
      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Avg Temp */}
        <div className="bg-black/5 dark:bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between glass-card">
          <div className="flex justify-between items-start">
            <span className="text-3xs text-gray-400 font-bold uppercase tracking-wider">Average Temp</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black block">{avgTemp}°{tempUnit}</span>
            <span className="text-3xs text-gray-400">Past 30 days mean</span>
          </div>
        </div>

        {/* Hottest Day */}
        <div className="bg-black/5 dark:bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between glass-card">
          <div className="flex justify-between items-start">
            <span className="text-3xs text-gray-400 font-bold uppercase tracking-wider">Hottest Day</span>
            <Sun className="w-4 h-4 text-orange-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black block text-orange-400">{formatTemp(hottestVal)}°{tempUnit}</span>
            <span className="text-3xs text-gray-400 truncate block">{hottestDate}</span>
          </div>
        </div>

        {/* Coldest Day */}
        <div className="bg-black/5 dark:bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between glass-card">
          <div className="flex justify-between items-start">
            <span className="text-3xs text-gray-400 font-bold uppercase tracking-wider">Coldest Day</span>
            <Snowflake className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black block text-sky-400">{formatTemp(coldestVal)}°{tempUnit}</span>
            <span className="text-3xs text-gray-400 truncate block">{coldestDate}</span>
          </div>
        </div>

        {/* Cumulative Rain */}
        <div className="bg-black/5 dark:bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col justify-between glass-card">
          <div className="flex justify-between items-start">
            <span className="text-3xs text-gray-400 font-bold uppercase tracking-wider">Cumulative Rain</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black block text-blue-400">{totalRain.toFixed(1)} mm</span>
            <span className="text-3xs text-gray-400">Total volume recorded</span>
          </div>
        </div>

      </div>

      {/* Temperature Historical Line Chart */}
      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          30-Day Temperature Trend
        </h3>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="dateFormatted" stroke="#9ca3af" fontSize={9} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.85)', 
                  borderColor: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
              <Line type="monotone" dataKey="max" name="Max Temp" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="mean" name="Mean Temp" stroke="#6366f1" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="min" name="Min Temp" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rain Historical Bar Chart */}
      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
          <Droplets className="w-4 h-4 text-indigo-400" />
          30-Day Precipitation Distribution
        </h3>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="dateFormatted" stroke="#9ca3af" fontSize={9} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.85)', 
                  borderColor: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px'
                }}
              />
              <Bar dataKey="rain" name="Rainfall (mm)" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
