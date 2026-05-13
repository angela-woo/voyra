'use client'

import { useEffect, useState } from 'react'
import { Cloud, Sun, CloudRain, Wind, Droplets } from 'lucide-react'

interface WeatherData {
  temperature: number
  weatherCode: number
  windSpeed: number
  humidity: number
  city: string
}

const weatherIcons: Record<number, React.ReactNode> = {
  0: <Sun className="w-8 h-8 text-yellow-400" />,
  1: <Sun className="w-8 h-8 text-yellow-300" />,
  2: <Cloud className="w-8 h-8 text-gray-400" />,
  3: <Cloud className="w-8 h-8 text-gray-500" />,
  61: <CloudRain className="w-8 h-8 text-blue-400" />,
  63: <CloudRain className="w-8 h-8 text-blue-500" />,
  80: <CloudRain className="w-8 h-8 text-blue-400" />,
}

const weatherLabels: Record<number, string> = {
  0: '맑음', 1: '대체로 맑음', 2: '구름 조금', 3: '흐림',
  61: '약한 비', 63: '보통 비', 80: '소나기',
}

function getWeatherIcon(code: number) {
  const key = Object.keys(weatherIcons).map(Number).find(k => k === code) ?? 2
  return weatherIcons[key] ?? <Cloud className="w-8 h-8 text-gray-400" />
}

function getWeatherLabel(code: number) {
  return weatherLabels[code] ?? '알 수 없음'
}

export default function WeatherWidget({ lat, lng, city }: { lat: number | null; lng: number | null; city: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (lat == null || lng == null) { setLoading(false); setError(true); return }
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m&timezone=auto`
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const c = data.current
        setWeather({
          temperature: Math.round(c.temperature_2m),
          weatherCode: c.weathercode,
          windSpeed: Math.round(c.windspeed_10m),
          humidity: c.relativehumidity_2m,
          city,
        })
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [lat, lng, city])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-sky-100 rounded-[var(--radius)] p-4 animate-pulse h-28" />
    )
  }

  if (error || !weather) {
    return (
      <div className="bg-gray-50 rounded-[var(--radius)] p-4 text-sm text-gray-400 text-center">
        날씨 정보를 불러올 수 없습니다
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-sky-100 rounded-[var(--radius)] p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs text-blue-500 font-medium">{weather.city} 현재 날씨</p>
          <p className="text-3xl font-bold text-blue-800">{weather.temperature}°C</p>
          <p className="text-xs text-blue-600">{getWeatherLabel(weather.weatherCode)}</p>
        </div>
        {getWeatherIcon(weather.weatherCode)}
      </div>
      <div className="flex gap-4 mt-2">
        <span className="flex items-center gap-1 text-xs text-blue-500">
          <Wind className="w-3 h-3" /> {weather.windSpeed} km/h
        </span>
        <span className="flex items-center gap-1 text-xs text-blue-500">
          <Droplets className="w-3 h-3" /> {weather.humidity}%
        </span>
      </div>
    </div>
  )
}
