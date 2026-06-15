import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  private http = inject(HttpClient);
  private apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

  getWeather(city: string) {
    return this.http.get(
      `${this.apiUrl}?q=${city}&appid=${environment.weatherApiKey}&units=metric`
    );
  }
  
  getForecast(city: string) {
    const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';
    return this.http.get(
      `${forecastUrl}?q=${city}&appid=${environment.weatherApiKey}&units=metric&lang=fr`
    );
  }
}