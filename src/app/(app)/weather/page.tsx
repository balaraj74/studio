import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Droplets,
  Wind,
  MapPin,
  CloudSun,
} from "lucide-react";

type WeatherData = {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  forecast: {
    day: string;
    temp: number;
    icon: string;
  }[];
};

const weatherIcons: { [key: string]: React.ReactNode } = {
  "01d": <Sun className="h-full w-full text-yellow-500" />,
  "02d": <CloudSun className="h-full w-full text-yellow-500" />,
  "03d": <Cloud className="h-full w-full text-gray-500" />,
  "04d": <Cloud className="h-full w-full text-gray-600" />,
  "09d": <CloudRain className="h-full w-full text-blue-500" />,
  "10d": <CloudRain className="h-full w-full text-blue-600" />,
  "11d": <CloudRain className="h-full w-full text-blue-700" />,
  "13d": <CloudSnow className="h-full w-full text-blue-300" />,
  "50d": <Cloud className="h-full w-full text-gray-400" />,
  "unknown": <Sun className="h-full w-full text-yellow-500" />,
};

// WMO Weather interpretation codes
const weatherCodeMap: { [key: number]: { description: string, icon: string } } = {
    0: { description: "Clear sky", icon: "01d" },
    1: { description: "Mainly clear", icon: "01d" },
    2: { description: "Partly cloudy", icon: "02d" },
    3: { description: "Overcast", icon: "03d" },
    45: { description: "Fog", icon: "50d" },
    48: { description: "Depositing rime fog", icon: "50d" },
    51: { description: "Light drizzle", icon: "09d" },
    53: { description: "Moderate drizzle", icon: "09d" },
    55: { description: "Dense drizzle", icon: "09d" },
    61: { description: "Slight rain", icon: "10d" },
    63: { description: "Moderate rain", icon: "10d" },
    65: { description: "Heavy rain", icon: "10d" },
    71: { description: "Slight snow fall", icon: "13d" },
    73: { description: "Moderate snow fall", icon: "13d" },
    75: { description: "Heavy snow fall", icon: "13d" },
    80: { description: "Slight rain showers", icon: "09d" },
    81: { description: "Moderate rain showers", icon: "09d" },
    82: { description: "Violent rain showers", icon: "09d" },
    95: { description: "Thunderstorm", icon: "11d" },
    96: { description: "Thunderstorm with slight hail", icon: "11d" },
    99: { description: "Thunderstorm with heavy hail", icon: "11d" },
};


async function getWeatherData(): Promise<WeatherData> {
  // Default to Bengaluru if no location is available
  const lat = 12.97;
  const lon = 77.59;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max&timezone=auto&forecast_days=6`;

  const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }
  const data = await response.json();

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const forecast = data.daily.time.slice(1).map((time: string, index: number) => {
    const date = new Date(time);
    return {
        day: days[date.getDay()],
        temp: Math.round(data.daily.temperature_2m_max[index + 1]),
        icon: weatherCodeMap[data.daily.weather_code[index + 1]]?.icon || 'unknown',
    };
  });

  return {
    city: "Bengaluru, IN", // Open-Meteo doesn't provide city name
    temperature: Math.round(data.current.temperature_2m),
    description: weatherCodeMap[data.current.weather_code]?.description || 'Clear Sky',
    icon: weatherCodeMap[data.current.weather_code]?.icon || 'unknown',
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    forecast,
  };
}

export default async function WeatherPage() {
  const weather = await getWeatherData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <CloudSun className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-headline">Weather Forecast</h1>
          <p className="text-muted-foreground">
            Real-time local weather to help you plan your day.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span>Weather in {weather.city}</span>
          </CardTitle>
          <CardDescription>
            Last updated:{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-lg bg-muted p-6">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20">
                {weatherIcons[weather.icon] || weatherIcons["unknown"]}
              </div>
              <div>
                <p className="text-6xl font-bold">{weather.temperature}°C</p>
                <p className="text-muted-foreground capitalize text-lg">
                  {weather.description}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <Droplets className="h-4 w-4 text-muted-foreground" />
                <span>Humidity</span>
                <span className="text-right flex-1">{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Wind className="h-4 w-4 text-muted-foreground" />
                <span>Wind</span>
                <span className="text-right flex-1">
                  {weather.windSpeed} km/h
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">5-Day Forecast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {weather.forecast.map((day, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-muted transition-colors"
                >
                  <p className="font-bold text-lg">{day.day}</p>
                  <div className="h-10 w-10">
                    {weatherIcons[day.icon] || weatherIcons["unknown"]}
                  </div>
                  <p className="text-xl font-semibold">{day.temp}°C</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}