import React from "react";
import { IoRainy, IoThunderstorm, IoSnow, IoCloud, IoSunny, IoPartlySunny } from "react-icons/io5";

export default function WeatherCard({ data }) {
  if (!data) return null;

  console.log(JSON.parse(JSON.stringify(data.content)));

  const getWeatherIcon = (condition) => {
    switch ((condition || "").toLowerCase()) {
      case "rain":
      case "drizzle":
        return { emoji: "🌧️", icon: <IoRainy size={36} className="text-blue-500" /> };
      case "thunderstorm":
        return { emoji: "⛈️", icon: <IoThunderstorm size={36} className="text-blue-500" /> };
      case "snow":
        return { emoji: "❄️", icon: <IoSnow size={36} className="text-blue-500" /> };
      case "clouds":
        return { emoji: "☁️", icon: <IoCloud size={36} className="text-blue-500" /> };
      case "clear":
        return { emoji: "☀️", icon: <IoSunny size={36} className="text-blue-500" /> };
      case "mist":
      case "fog":
        return { emoji: "🌫️", icon: <IoPartlySunny size={36} className="text-blue-500" /> };
      default:
        return { emoji: "🌤️", icon: <IoPartlySunny size={36} className="text-blue-500" /> };
    }
  };

  const { emoji, icon } = getWeatherIcon(data.condition);

  return (
    <div className="bg-[#111827] border border-blue-800 rounded-2xl p-5 w-[340px] mt-3 shadow-lg shadow-black/40">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <p className="text-lg font-semibold text-gray-200 ml-2">
            {emoji} {data.city || "Unknown City"}
          </p>
        </div>
        <p className="text-xs text-gray-500">
          {data.timestamp || new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Temperature */}
      <div className="text-center my-3">
        <p className="text-5xl font-bold text-blue-400">{data.temperature}°C</p>
        <p className="text-gray-300 text-lg capitalize">{data.condition}</p>
      </div>

      {/* Details */}
      <div className="flex justify-between bg-[#1e293b] rounded-xl p-3 my-2">
        <div>
          <p className="text-gray-300 text-sm">
            💧 Humidity: <span className="text-blue-300">{data.humidity}%</span>
          </p>
          <p className="text-gray-300 text-sm">
            🌬️ Wind: <span className="text-blue-300">{data.wind} m/s</span>
          </p>
        </div>
        <div>
          <p className="text-gray-300 text-sm">
            👁️ Visibility: <span className="text-blue-300">{data.visibility} m</span>
          </p>
          <p className="text-gray-300 text-sm">
            ⚙️ Pressure: <span className="text-blue-300">{data.pressure} hPa</span>
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-2 bg-[#0f172a] border border-blue-900 rounded-xl p-3">
        <p className="text-blue-300 italic text-sm leading-5">
          {data.summary ||
            `Currently ${data.condition} with ${data.temperature}°C. ${
              data.temperature > 35
                ? "☀️ Stay hydrated, it's hot today!"
                : data.temperature < 10
                ? "❄️ It's cold outside, keep warm!"
                : data.condition?.toLowerCase().includes("rain")
                ? "🌧️ Don't forget your umbrella!"
                : "🌤️ A comfortable day ahead!"
            }`}
        </p>
      </div>

      {/* Forecast Snapshot */}
      {data.forecast && (
        <div className="mt-3 bg-[#1e293b] rounded-xl p-3">
          <p className="text-blue-300 font-semibold text-sm mb-1">🔮 Forecast Snapshot</p>
          <p className="text-gray-300 text-sm leading-5">{data.forecast}</p>
        </div>
      )}

      {/* Quick Highlights */}
      {data.highlights && Array.isArray(data.highlights) && (
        <div className="mt-3 bg-[#0f172a] border border-blue-900 rounded-xl p-3">
          <p className="text-blue-300 font-semibold text-sm mb-1">📌 Quick Highlights</p>
          {data.highlights.map((item, index) => (
            <p key={index} className="text-gray-300 text-sm">• {item}</p>
          ))}
        </div>
      )}
    </div>
  );
}
