import React from 'react';
import { Shirt, Footprints, Plane, ShieldCheck, AlertCircle, XCircle, Info, Sparkles, CloudRain, Sun, Compass } from 'lucide-react';

export default function SmartRecommendations({ forecastData, aqiData }) {
  if (!forecastData || !forecastData.current) return null;

  const current = forecastData.current;
  const daily = forecastData.daily;
  const usAqi = aqiData?.current?.us_aqi || 50;

  const temp = current.temperature_2m;
  const feelsLike = current.apparent_temperature;
  const isRaining = current.precipitation > 0;
  const wind = current.wind_speed_10m;

  // 1. OUTFIT RECOMMENDATION
  const getOutfitDetails = () => {
    if (feelsLike >= 28) {
      return {
        title: 'Light Cotton Wear',
        clothing: 'T-shirt, shorts, skirt, breathable cotton fabrics.',
        accessories: 'Sunglasses, sunblock (SPF 30+), and a wide-brimmed cap.',
        tips: 'Keep hydrated and limit exposure under peak UV periods.',
        bgColor: 'bg-orange-500/10 border-orange-500/20 text-orange-200'
      };
    } else if (feelsLike >= 18) {
      return {
        title: 'Mild Weather Layers',
        clothing: 'Casual t-shirt, light shirt, jeans, chinos, sneakers.',
        accessories: 'A light pullover or windbreaker is great for early morning/late evening.',
        tips: 'Highly pleasant temperatures; perfect for outdoors.',
        bgColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
      };
    } else if (feelsLike >= 10) {
      return {
        title: 'Cool Weather Cover',
        clothing: 'Hoodie, sweater, long-sleeve knitwear, denim jacket.',
        accessories: 'Light scarf if breezy, closed shoes.',
        tips: 'A light layer protects from sudden temperature shifts.',
        bgColor: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200'
      };
    } else {
      return {
        title: 'Heavy Winter Layers',
        clothing: 'Thermal undershirt, thick fleece or sweater, wind-resistant heavy coat.',
        accessories: 'Beanie, wool gloves, and a cozy scarf.',
        tips: 'Ensure your head, hands, and feet are well insulated.',
        bgColor: 'bg-sky-500/10 border-sky-500/20 text-sky-200'
      };
    }
  };

  const outfit = getOutfitDetails();

  // 2. ACTIVITY INDEX RECOMMENDATIONS
  const activities = [
    {
      name: 'Running',
      evaluate: () => {
        if (isRaining || temp > 35 || usAqi > 150) return { status: 'not_recommended', reason: isRaining ? 'Wet pathways and rain' : (temp > 35 ? 'Extreme heat exhaustion risk' : 'Hazardous air quality') };
        if (temp > 30 || temp < 5 || usAqi > 100 || wind > 25) return { status: 'caution', reason: usAqi > 100 ? 'Moderate air pollution' : 'Sub-optimal temperature/wind conditions' };
        return { status: 'recommended', reason: 'Ideal temp, clear paths, and clean air.' };
      }
    },
    {
      name: 'Cycling',
      evaluate: () => {
        if (isRaining || wind > 30 || temp > 36 || usAqi > 150) return { status: 'not_recommended', reason: wind > 30 ? 'Strong crosswinds risk' : 'Rain/unsafe roads' };
        if (wind > 20 || temp > 32 || usAqi > 100) return { status: 'caution', reason: 'Gusty winds and high humidity' };
        return { status: 'recommended', reason: 'Dry surface, pleasant wind, and nice weather.' };
      }
    },
    {
      name: 'Cricket',
      evaluate: () => {
        if (isRaining || current.relative_humidity_2m > 85 || temp > 38 || usAqi > 150) return { status: 'not_recommended', reason: isRaining ? 'Wet pitch and outfield' : 'Extreme heat or high humidity' };
        if (temp > 33 || temp < 12 || usAqi > 100) return { status: 'caution', reason: 'High heat index' };
        return { status: 'recommended', reason: 'Dry conditions, clear outfield, great sunshine.' };
      }
    },
    {
      name: 'Football',
      evaluate: () => {
        if (temp > 38 || wind > 35 || usAqi > 150) return { status: 'not_recommended', reason: 'Hazardous air quality/extreme heat' };
        if (isRaining || temp > 33 || temp < 5 || usAqi > 100) return { status: 'caution', reason: 'Slippery turf / drizzle' };
        return { status: 'recommended', reason: 'Firm turf, ideal cardio temperatures.' };
      }
    },
    {
      name: 'Hiking',
      evaluate: () => {
        if (isRaining || wind > 28 || temp > 35 || temp < 3) return { status: 'not_recommended', reason: 'Unsafe mountain trails & storm risk' };
        if (daily.precipitation_probability_max[0] > 40 || wind > 18 || usAqi > 100) return { status: 'caution', reason: 'Incoming rain warning / trail mist' };
        return { status: 'recommended', reason: 'Clean air, safe trails, great visibility.' };
      }
    },
    {
      name: 'Outdoor Events',
      evaluate: () => {
        if (isRaining || wind > 35 || temp > 40 || temp < 5) return { status: 'not_recommended', reason: 'Severe weather/infrastructure risks' };
        if (daily.precipitation_probability_max[0] > 30 || temp > 33 || usAqi > 100) return { status: 'caution', reason: 'Chance of light rain / heat stress' };
        return { status: 'recommended', reason: 'Perfect weather for open-air gatherings.' };
      }
    }
  ];

  // 3. TRAVEL WEATHER ADVISOR
  const getTravelAdvice = () => {
    const next3Days = daily.precipitation_probability_max.slice(0, 3);
    const maxTemps = daily.temperature_2m_max.slice(0, 3);
    const minTemps = daily.temperature_2m_min.slice(0, 3);
    
    const rainDays = next3Days.map((prob, idx) => ({ prob, idx })).filter(d => d.prob > 60);
    const heatDays = maxTemps.map((max, idx) => ({ max, idx })).filter(d => d.max > 36);
    const coldDays = minTemps.map((min, idx) => ({ min, idx })).filter(d => d.min < 8);

    if (rainDays.length > 0) {
      return {
        status: 'warning',
        text: `Heavy rain is forecasted over the next 3 days (up to ${Math.max(...next3Days)}% probability). Sightseeing may be disrupted; consider indoor attractions.`,
        tips: 'Bring heavy-duty umbrellas, carry waterproof bags for electronics, and plan museum or indoor cafe visits.'
      };
    } else if (heatDays.length > 0) {
      return {
        status: 'warning',
        text: `Extreme heat levels expected (reaching ${Math.max(...maxTemps)}°C). Seek shade and plan activities for early mornings.`,
        tips: 'Carry cooling spray, drink electrolytes, and limit outdoor walking between 11 AM and 4 PM.'
      };
    } else if (coldDays.length > 0) {
      return {
        status: 'caution',
        text: `Cool temperature drops expected (falling to ${Math.min(...minTemps)}°C). Ensure you bundle up.`,
        tips: 'Layer up appropriately before going out and check local heating options.'
      };
    } else {
      return {
        status: 'perfect',
        text: 'Optimal weather conditions are expected over the next 3 days! Mild temperatures, dry roads, and excellent travel vibes.',
        tips: 'Perfect window to visit parks, beaches, outdoor monuments, or take historical walking tours.'
      };
    }
  };

  const travel = getTravelAdvice();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Outfit Recommender */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Shirt className="w-5 h-5 text-indigo-400" />
              Smart Outfit
            </h3>
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>

          <div className={`p-4 rounded-2xl border mb-4 ${outfit.bgColor}`}>
            <span className="text-sm font-bold block mb-1">{outfit.title}</span>
            <p className="text-xs opacity-90">{outfit.clothing}</p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <span className="text-indigo-400 font-bold text-xs mt-0.5">Acc:</span>
              <p className="text-xs text-gray-400">{outfit.accessories}</p>
            </div>
            {isRaining && (
              <div className="flex gap-2 bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-xl text-blue-200">
                <CloudRain className="w-4 h-4 shrink-0 text-blue-400" />
                <p className="text-xs">It is currently raining. Carrying an umbrella and rain gear is required.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-white/5 flex gap-1.5 items-center">
          <Info className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-2xs text-gray-400 leading-none">{outfit.tips}</span>
        </div>
      </div>

      {/* Activity Engine */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col lg:col-span-2">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Footprints className="w-5 h-5 text-indigo-400" />
          Activity Recommendation Engine
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 grow">
          {activities.map((act, idx) => {
            const evaluation = act.evaluate();
            return (
              <div 
                key={idx} 
                className="bg-black/5 dark:bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between glass-card"
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm">{act.name}</span>
                  {evaluation.status === 'recommended' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  {evaluation.status === 'caution' && <AlertCircle className="w-4 h-4 text-amber-400" />}
                  {evaluation.status === 'not_recommended' && <XCircle className="w-4 h-4 text-rose-400" />}
                </div>

                <div className="mt-3">
                  <span 
                    className={`inline-block px-2 py-0.5 rounded-md text-3xs font-bold uppercase tracking-wider ${
                      evaluation.status === 'recommended' ? 'bg-emerald-500/15 text-emerald-300' :
                      evaluation.status === 'caution' ? 'bg-amber-500/15 text-amber-300' :
                      'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {evaluation.status === 'recommended' ? 'Recommended' :
                     evaluation.status === 'caution' ? 'Caution' : 'Not Advised'}
                  </span>
                  <p className="text-3xs text-gray-400 mt-1 leading-normal truncate-2-lines">
                    {evaluation.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Travel Weather Advisor */}
      <div className="glass-panel rounded-3xl p-6 lg:col-span-3 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            {travel.status === 'perfect' ? <Compass className="w-8 h-8 animate-spin-slow" /> : <Plane className="w-8 h-8" />}
          </div>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              Travel Weather Advisor
            </h3>
            <p className="text-sm font-medium mt-1 leading-relaxed max-w-2xl">
              {travel.text}
            </p>
          </div>
        </div>
        
        <div className="bg-black/10 dark:bg-white/5 border border-white/5 p-4 rounded-2xl max-w-md w-full">
          <span className="text-xs font-bold block mb-1 text-indigo-400">Advisor Pro-Tip</span>
          <p className="text-xs text-gray-400 leading-normal">{travel.tips}</p>
        </div>
      </div>

    </div>
  );
}
