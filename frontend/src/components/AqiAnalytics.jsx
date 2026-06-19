import React from 'react';
import { ShieldAlert, Info, Wind, Heart, AlertTriangle } from 'lucide-react';

export default function AqiAnalytics({ aqiData }) {
  if (!aqiData || !aqiData.current) {
    return (
      <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center min-h-[300px]">
        <Wind className="w-12 h-12 text-indigo-400 mb-2 animate-bounce" />
        <p className="text-gray-400">Air quality data unavailable for this location.</p>
      </div>
    );
  }

  const cur = aqiData.current;
  const usAqi = cur.us_aqi || 0;

  // Determine AQI details
  const getAqiDetails = (val) => {
    if (val <= 50) {
      return {
        label: 'Good',
        color: 'from-emerald-400 to-teal-500 text-emerald-100',
        borderColor: 'border-emerald-500/30',
        advice: 'Air quality is satisfactory, and air pollution poses little or no risk.',
        recommendations: [
          'Great day for running, cycling, or outdoor sports.',
          'Perfect weather to open windows and ventilate your home.',
          'Safe for sensitive groups.'
        ]
      };
    } else if (val <= 100) {
      return {
        label: 'Moderate',
        color: 'from-amber-400 to-orange-500 text-amber-100',
        borderColor: 'border-amber-500/30',
        advice: 'Air quality is acceptable. However, active kids and adults with respiratory issues should limit outdoor activities.',
        recommendations: [
          'Sensitive groups should consider reducing heavy outdoor exertion.',
          'Open windows with caution if you are highly sensitive to pollen/smog.',
          'Standard outdoor events can proceed normally.'
        ]
      };
    } else if (val <= 150) {
      return {
        label: 'Unhealthy for Sensitive Groups',
        color: 'from-orange-400 to-red-500 text-orange-100',
        borderColor: 'border-orange-500/30',
        advice: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
        recommendations: [
          'Sensitive groups should move activities indoors or reschedule.',
          'Close windows to avoid outdoor dust/smoke.',
          'Take frequent breaks during outdoor work.'
        ]
      };
    } else if (val <= 200) {
      return {
        label: 'Unhealthy',
        color: 'from-red-400 to-rose-600 text-red-100',
        borderColor: 'border-rose-500/30',
        advice: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
        recommendations: [
          'Avoid heavy or prolonged outdoor activities. Move them indoors.',
          'Keep windows closed and run an air purifier if available.',
          'Wear an N95 mask if you must remain outdoors for extended periods.'
        ]
      };
    } else {
      return {
        label: 'Hazardous',
        color: 'from-purple-500 to-fuchsia-700 text-purple-100',
        borderColor: 'border-purple-500/30',
        advice: 'Health warnings of emergency conditions. The entire population is more likely to be affected.',
        recommendations: [
          'Strictly avoid all outdoor activities. Remain indoors.',
          'Seal windows and keep indoor air clean.',
          'Check on family members with asthma or cardiopulmonary disease.'
        ]
      };
    }
  };

  const aqi = getAqiDetails(usAqi);

  // Helper for formatting pollutant labels
  const pollutants = [
    { name: 'PM2.5', value: cur.pm2_5, unit: 'µg/m³', desc: 'Fine inhalable particles' },
    { name: 'PM10', value: cur.pm10, unit: 'µg/m³', desc: 'Coarse dust particles' },
    { name: 'CO', value: cur.carbon_monoxide ? (cur.carbon_monoxide / 1000).toFixed(2) : '0.00', unit: 'mg/m³', desc: 'Carbon Monoxide' },
    { name: 'NO₂', value: cur.nitrogen_dioxide, unit: 'µg/m³', desc: 'Nitrogen Dioxide' },
    { name: 'O₃', value: cur.ozone, unit: 'µg/m³', desc: 'Ozone' },
    { name: 'SO₂', value: cur.sulphur_dioxide || 0.5, unit: 'µg/m³', desc: 'Sulfur Dioxide' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* AQI Main Info Card */}
      <div className={`glass-panel border rounded-3xl p-6 flex flex-col justify-between ${aqi.borderColor}`}>
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold uppercase tracking-wider opacity-80">Air Quality Index</span>
            <ShieldAlert className="w-5 h-5 opacity-80" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-extrabold tracking-tight">{usAqi}</span>
            <span className="text-sm opacity-80">US AQI</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-black/10 dark:bg-white/10 h-3 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${aqi.color}`} 
              style={{ width: `${Math.min(usAqi / 3, 100)}%` }}
            />
          </div>
          
          <div className="mt-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${aqi.color} shadow-sm`}>
              {aqi.label}
            </span>
          </div>
        </div>
        
        <p className="mt-6 text-sm leading-relaxed opacity-95">
          {aqi.advice}
        </p>
      </div>

      {/* Pollutant Grid */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between lg:col-span-2">
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-indigo-400" />
            Key Pollutants
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {pollutants.map((p, idx) => (
              <div 
                key={idx} 
                className="bg-black/5 dark:bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between glass-card"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{p.name}</span>
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" title={p.desc} />
                  </div>
                  <span className="text-xs text-gray-400 leading-none">{p.desc}</span>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-xl font-bold">{p.value !== null && p.value !== undefined ? p.value : '--'}</span>
                  <span className="text-xs text-gray-400">{p.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Advisory Section */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5 text-indigo-400">
            <Heart className="w-4 h-4" />
            Health & Activity Recommendations
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {aqi.recommendations.map((rec, idx) => (
              <li key={idx} className="text-xs flex items-start gap-2 opacity-90">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
