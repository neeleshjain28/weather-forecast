import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMap } from 'react-leaflet';
import { Layers, Thermometer, CloudRain, Wind, Cloud, MapPin } from 'lucide-react';

// Helper component to recenter map when search coordinates update
function MapRecenter({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) {
      map.setView([lat, lon], 7);
    }
  }, [lat, lon, map]);
  return null;
}

export default function WeatherMap({ lat, lon, cityName, forecastData }) {
  const [activeLayer, setActiveLayer] = useState('temp'); // 'temp' | 'rain' | 'wind' | 'cloud'
  const [stations, setStations] = useState([]);

  const centerLat = lat || 28.61;
  const centerLon = lon || 77.23;
  const name = cityName || 'Delhi';

  // Generate interactive sub-stations (surrounding cities) based on offset values
  useEffect(() => {
    if (!forecastData || !forecastData.current) return;
    const cur = forecastData.current;

    const baseTemp = cur.temperature_2m;
    const baseRain = cur.precipitation;
    const baseWind = cur.wind_speed_10m;
    const baseCloud = cur.cloud_cover;

    // Create 5 nearby virtual weather stations to represent localized data
    const offsets = [
      { name: `${name} North`, latOff: 0.6, lonOff: 0, tempOff: -1.2, rainOff: 0.2, windOff: 3, cloudOff: 10 },
      { name: `${name} South`, latOff: -0.6, lonOff: 0.1, tempOff: 0.8, rainOff: -0.1, windOff: -2, cloudOff: -15 },
      { name: `${name} East`, latOff: 0.1, lonOff: 0.7, tempOff: -0.5, rainOff: 0.5, windOff: 5, cloudOff: 20 },
      { name: `${name} West`, latOff: -0.1, lonOff: -0.7, tempOff: 1.2, rainOff: -0.3, windOff: -1, cloudOff: -5 },
      { name: `${name} Central`, latOff: 0, lonOff: 0, tempOff: 0, rainOff: 0, windOff: 0, cloudOff: 0 }
    ];

    const generated = offsets.map((off, idx) => {
      const wTemp = parseFloat((baseTemp + off.tempOff).toFixed(1));
      const wRain = Math.max(0, parseFloat((baseRain + off.rainOff).toFixed(1)));
      const wWind = Math.max(0, parseFloat((baseWind + off.windOff).toFixed(1)));
      const wCloud = Math.min(100, Math.max(0, baseCloud + off.cloudOff));

      return {
        id: idx,
        name: off.name,
        lat: centerLat + off.latOff,
        lon: centerLon + off.lonOff,
        temp: wTemp,
        rain: wRain,
        wind: wWind,
        cloud: wCloud
      };
    });

    setStations(generated);
  }, [centerLat, centerLon, name, forecastData]);

  // Color mapping helper depending on active layer and values
  const getCircleColor = (station) => {
    if (activeLayer === 'temp') {
      const t = station.temp;
      if (t > 35) return '#ef4444'; // Red
      if (t > 28) return '#f97316'; // Orange
      if (t > 18) return '#eab308'; // Yellow
      if (t > 8) return '#10b981';  // Emerald
      return '#3b82f6';             // Blue
    }
    
    if (activeLayer === 'rain') {
      const r = station.rain;
      if (r > 5) return '#1d4ed8';  // Dark Blue
      if (r > 1) return '#3b82f6';  // Blue
      if (r > 0) return '#93c5fd';  // Light Blue
      return 'transparent';
    }
    
    if (activeLayer === 'wind') {
      const w = station.wind;
      if (w > 25) return '#a855f7'; // Purple
      if (w > 12) return '#6366f1'; // Indigo
      return '#3b82f6';             // Blue
    }
    
    if (activeLayer === 'cloud') {
      const c = station.cloud;
      if (c > 75) return '#6b7280'; // Gray
      if (c > 35) return '#9ca3af'; // Light Gray
      if (c > 10) return '#d1d5db'; // Off-white
      return 'transparent';
    }

    return '#6366f1';
  };

  // Label text helper
  const getPopupContent = (station) => {
    return (
      <div className="text-xs font-semibold p-1">
        <h4 className="font-bold border-b border-gray-700 pb-1 mb-1 text-indigo-400">{station.name}</h4>
        <p>🌡️ Temperature: {station.temp}°C</p>
        <p>🌧️ Rainfall: {station.rain} mm</p>
        <p>💨 Wind Speed: {station.wind} km/h</p>
        <p>☁️ Cloud Cover: {station.cloud}%</p>
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col h-[400px]">
      
      {/* Map Control Bar */}
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" />
            Interactive Weather Layers
          </h3>
          <p className="text-3xs text-gray-400">Zoom and pan to explore local details</p>
        </div>
        
        {/* Layer Toggles */}
        <div className="flex bg-black/15 dark:bg-white/5 border border-white/5 p-1 rounded-xl gap-1">
          <button 
            onClick={() => setActiveLayer('temp')} 
            className={`p-1.5 rounded-lg text-3xs font-bold flex items-center gap-1 transition-all ${
              activeLayer === 'temp' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-indigo-200'
            }`}
            title="Temperature Layer"
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Temp</span>
          </button>
          
          <button 
            onClick={() => setActiveLayer('rain')} 
            className={`p-1.5 rounded-lg text-3xs font-bold flex items-center gap-1 transition-all ${
              activeLayer === 'rain' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-indigo-200'
            }`}
            title="Precipitation Layer"
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rain</span>
          </button>
          
          <button 
            onClick={() => setActiveLayer('wind')} 
            className={`p-1.5 rounded-lg text-3xs font-bold flex items-center gap-1 transition-all ${
              activeLayer === 'wind' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-indigo-200'
            }`}
            title="Wind Speed Layer"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wind</span>
          </button>
          
          <button 
            onClick={() => setActiveLayer('cloud')} 
            className={`p-1.5 rounded-lg text-3xs font-bold flex items-center gap-1 transition-all ${
              activeLayer === 'cloud' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-indigo-200'
            }`}
            title="Cloud Coverage Layer"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clouds</span>
          </button>
        </div>
      </div>

      {/* Map Window */}
      <div className="grow rounded-2xl overflow-hidden border border-white/10 relative shadow-inner z-0">
        <MapContainer 
          center={[centerLat, centerLon]} 
          zoom={7} 
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapRecenter lat={centerLat} lon={centerLon} />

          {/* Current searched location marker pin */}
          <Circle 
            center={[centerLat, centerLon]}
            radius={25000}
            pathOptions={{ color: '#6366f1', fillBackgroundColor: '#6366f1', fillOpacity: 0.35 }}
          >
            <Popup>
              <div className="text-xs font-bold p-1 text-indigo-400">
                <MapPin className="w-3.5 h-3.5 inline mr-1" /> {name} (Selected)
              </div>
            </Popup>
          </Circle>

          {/* Color coded weather overlay stations */}
          {stations.map(station => {
            const color = getCircleColor(station);
            // Hide circle if transparent (e.g. no rain)
            if (color === 'transparent') return null;

            return (
              <Circle
                key={station.id}
                center={[station.lat, station.lon]}
                radius={35000}
                pathOptions={{ 
                  color: color, 
                  fillColor: color, 
                  fillOpacity: activeLayer === 'cloud' ? 0.6 : 0.45,
                  weight: 2 
                }}
              >
                <Popup>
                  {getPopupContent(station)}
                </Popup>
              </Circle>
            );
          })}
        </MapContainer>
      </div>

    </div>
  );
}
