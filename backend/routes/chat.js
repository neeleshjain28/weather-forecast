import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { dbService } from '../services/dbService.js';

const router = express.Router();

// Local Rule-Based NLP Fallback Engine
function getLocalChatResponse(message, weatherContext) {
  const msg = message.toLowerCase();
  
  if (!weatherContext || !weatherContext.forecast) {
    return "I'd love to help you with the weather, but I don't have a city selected yet. Please search for a city first, and then ask me anything about its forecast, outfit suggestions, or outdoor activities!";
  }

  const current = weatherContext.forecast.current;
  const daily = weatherContext.forecast.daily;
  const cityName = weatherContext.cityName || 'the selected city';
  const aqiVal = weatherContext.aqi?.current?.us_aqi;
  
  // Greeting
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('who are you')) {
    return `Hello! I am your UptoWeather AI Assistant. Currently, I'm analyzing the weather for **${cityName}** (Temp: ${current.temperature_2m}°C, feels like ${current.apparent_temperature}°C). Ask me questions like:
- Will it rain tomorrow?
- Is it a good day for running or cycling?
- What should I wear today?
- Is the air quality safe today?`;
  }

  // Rain / Umbrella
  if (msg.includes('rain') || msg.includes('umbrella') || msg.includes('wet') || msg.includes('shower') || msg.includes('precipitation')) {
    const rainChanceToday = daily.precipitation_probability_max[0] || 0;
    const rainChanceTomorrow = daily.precipitation_probability_max[1] || 0;
    
    if (msg.includes('tomorrow')) {
      if (rainChanceTomorrow > 50) {
        return `Yes, there is a high chance of rain in **${cityName}** tomorrow (${rainChanceTomorrow}% probability). I highly recommend bringing an umbrella or wearing a waterproof jacket if you're heading out.`;
      } else if (rainChanceTomorrow > 20) {
        return `There's a slight chance of showers in **${cityName}** tomorrow (${rainChanceTomorrow}% probability). You might want to carry a compact umbrella just in case.`;
      } else {
        return `No rain is expected in **${cityName}** tomorrow (rain chance is only ${rainChanceTomorrow}%). It should remain dry!`;
      }
    } else {
      // Default to today/current
      if (current.precipitation > 0) {
        return `It is currently raining in **${cityName}**. Definitely carry an umbrella and wear waterproof gear if you're stepping outside!`;
      } else if (rainChanceToday > 50) {
        return `There is a high chance of rain later today in **${cityName}** (${rainChanceToday}% probability). Keep an umbrella handy!`;
      } else {
        return `No rain is currently falling in **${cityName}**, and the rain chance for the rest of today is low (${rainChanceToday}%).`;
      }
    }
  }

  // Sports & Outdoor Activities
  if (msg.includes('cycling') || msg.includes('run') || msg.includes('hike') || msg.includes('hiking') || msg.includes('cricket') || msg.includes('football') || msg.includes('sport') || msg.includes('outdoor') || msg.includes('activity')) {
    const temp = current.temperature_2m;
    const wind = current.wind_speed_10m;
    const precip = current.precipitation;
    const aqi = aqiVal || 50;

    let warnings = [];
    if (temp > 35) warnings.push('extreme heat (above 35°C)');
    if (temp < 5) warnings.push('extreme cold (below 5°C)');
    if (wind > 25) warnings.push('high wind speeds');
    if (precip > 0) warnings.push('active precipitation/rain');
    if (aqi > 100) warnings.push('poor air quality');

    if (warnings.length === 0) {
      return `It's a **fantastic day** for outdoor activities like cycling, running, or cricket in **${cityName}**! The temperature is a comfortable ${temp}°C, the air is clean (AQI: ${aqi}), and there's no rain. Enjoy your time outside!`;
    } else if (warnings.length <= 2) {
      return `You can go for outdoor activities in **${cityName}**, but exercise **caution**. Current concerns include: ${warnings.join(' and ')}. Make sure to adapt your intensity or stay hydrated!`;
    } else {
      return `I would **not recommend** outdoor activities in **${cityName}** right now due to unfavorable conditions: ${warnings.join(', ')}. It's probably better to stick to an indoor workout today!`;
    }
  }

  // Outfit / Wear
  if (msg.includes('wear') || msg.includes('outfit') || msg.includes('clothes') || msg.includes('jacket') || msg.includes('coat')) {
    const temp = current.apparent_temperature;
    const isRaining = current.precipitation > 0;

    let wearSuggestion = "";
    if (temp >= 28) {
      wearSuggestion = "lightweight, breathable cotton clothes (like t-shirts and shorts), sunglasses, and sunblock. A cap is also recommended.";
    } else if (temp >= 18) {
      wearSuggestion = "comfortable casual clothes, such as a light shirt, t-shirt, jeans, or sneakers. Perfect weather for layers!";
    } else if (temp >= 10) {
      wearSuggestion = "a light jacket, sweater, or hoodie over your clothes to stay comfortable in the cool air.";
    } else {
      wearSuggestion = "a warm winter coat or thick jacket, gloves, and a beanie. Keep yourself well-insulated against the cold!";
    }

    if (isRaining) {
      wearSuggestion += " Don't forget a waterproof rain jacket or poncho and water-resistant footwear.";
    }

    return `Based on the feels-like temperature of **${temp.toFixed(1)}°C** in **${cityName}**, you should wear **${wearSuggestion}**`;
  }

  // Air Quality
  if (msg.includes('aqi') || msg.includes('air') || msg.includes('pollution') || msg.includes('breathe') || msg.includes('smog')) {
    if (!aqiVal) {
      return "I don't have active air quality measurements for this city right now, but generally, check local index readings before heavy outdoor workouts!";
    }
    
    let rating = "";
    let advice = "";
    
    if (aqiVal <= 50) {
      rating = "Good (Excellent)";
      advice = "The air quality is pristine! It's safe for everyone to spend time outdoors and breathe deeply.";
    } else if (aqiVal <= 100) {
      rating = "Moderate";
      advice = "Air quality is acceptable. However, unusually sensitive individuals should consider reducing heavy or prolonged outdoor exertion.";
    } else if (aqiVal <= 150) {
      rating = "Unhealthy for Sensitive Groups";
      advice = "Children, active adults, and individuals with respiratory issues should limit outdoor exposure.";
    } else {
      rating = "Unhealthy / Hazardous";
      advice = "AQI is very high. Everyone should avoid prolonged outdoor activities and keep windows closed. Consider wearing an N95 mask if going outside is necessary.";
    }
    
    return `The current US AQI in **${cityName}** is **${aqiVal}**, which is classified as **${rating}**. ${advice}`;
  }

  // Hot / Cold
  if (msg.includes('hot') || msg.includes('cold') || msg.includes('temp') || msg.includes('warm') || msg.includes('weather')) {
    const temp = current.temperature_2m;
    const maxTemp = daily.temperature_2m_max[0];
    const minTemp = daily.temperature_2m_min[0];
    
    let description = "";
    if (temp > 30) description = "quite hot";
    else if (temp > 20) description = "warm and pleasant";
    else if (temp > 10) description = "cool";
    else description = "cold";

    return `Currently, it is **${temp}°C** in **${cityName}**, which feels ${description}. Today's forecast expects a high of **${maxTemp}°C** and a low of **${minTemp}°C**.`;
  }

  // Default Fallback Response
  return `I see you're asking about **${cityName}**. The current temperature is **${current.temperature_2m}°C** with **${current.relative_humidity_2m}% humidity** and a wind speed of **${current.wind_speed_10m} km/h**. Please let me know if you want to know what to wear, if you should cycle, or if it will rain!`;
}

// GET Chat logs
router.get('/history', async (req, res) => {
  try {
    const history = await dbService.getChatHistory();
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Chat message
router.post('/', async (req, res) => {
  const { message, weatherContext } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Save user message in DB
    await dbService.addChatMessage({ role: 'user', content: message });

    let reply = '';
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey && geminiKey.trim().length > 0) {
      try {
        console.log('🤖 Utilizing Google Gemini API for chat response...');
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are "UptoWeather AI", a premium, friendly, and expert weather assistant chatbot.
Analyze the user's weather question and respond accurately using the provided weather context.
Keep responses concise, informative, and formatted with markdown.

Current Location Context:
${JSON.stringify(weatherContext, null, 2)}

User Question: "${message}"`;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        reply = textResponse.trim();
      } catch (geminiError) {
        console.warn('⚠️ Gemini API request failed. Falling back to local NLP engine.', geminiError.message);
        reply = getLocalChatResponse(message, weatherContext);
      }
    } else {
      // Use local rule-based response
      reply = getLocalChatResponse(message, weatherContext);
    }

    // Save assistant reply in DB
    const savedReply = await dbService.addChatMessage({ role: 'assistant', content: reply });
    
    res.json(savedReply);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// DELETE Chat logs
router.delete('/clear', async (req, res) => {
  try {
    await dbService.clearChatHistory();
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
