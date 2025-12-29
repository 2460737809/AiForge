// 天气结果接口
interface WeatherResult {
  aqi: string;
  vis: string;
  area: string;
  date: string;
  pcpn: string;
  real: string;
  tips: string;
  week: string;
  wind: string;
  areaid: string;
  lowest: string;
  sunset: string;
  windsc: string;
  highest: string;
  quality: string;
  sunrise: string;
  weather: string;
  humidity: string;
  moondown: string;
  moonrise: string;
  province: string;
  uv_index: string;
  windspeed: string;
  weatherimg: string;
  weathercode: string;
  alarmlist?: Array<any>;
}

interface WeatherResponse {
  code: number;
  msg: string;
  result: WeatherResult;
}

// 天气API接口
export declare const weatherApi: {
  getWeather: (city: string, type?: number) => Promise<any>;
  getRealTimeWeather: (city: string) => Promise<any>;
  get7DayWeather: (city: string) => Promise<any>;
};