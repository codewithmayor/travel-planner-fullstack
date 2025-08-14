import React, { useState } from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from './apolloClient';
import { LocationProvider } from './contexts/LocationContext';
import { CitySearch } from './components/CitySearch';
import { WeatherDisplay } from './components/WeatherDisplay';
import { ActivityRanking } from './components/ActivityRanking';
import { CitySuggestion } from './types';
import './App.css';

function App() {
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);
  const [weatherLoaded, setWeatherLoaded] = useState(false);

  const handleCitySelect = (city: CitySuggestion) => {
    setSelectedCity(city);
    setWeatherLoaded(false); // Reset weather loaded state when city changes
  };

  const handleWeatherLoaded = (loaded: boolean) => {
    setWeatherLoaded(loaded);
  };

  return (
    <ApolloProvider client={client}>
      <LocationProvider>
        <div className="App">
          <header className="App-header">
            <h1>🌍 Travel Planner</h1>
            <p>Find the best activities based on 7-day weather forecasts</p>
          </header>

          <main className="App-main">
            <section className="search-section">
              <CitySearch onCitySelect={handleCitySelect} />
            </section>

            {selectedCity && (
              <>
                <section className="weather-section">
                  <WeatherDisplay 
                    city={selectedCity} 
                    onWeatherLoaded={handleWeatherLoaded}
                  />
                </section>

                <section className="activities-section">
                  <ActivityRanking 
                    city={selectedCity} 
                    weatherLoaded={weatherLoaded}
                  />
                </section>
              </>
            )}

            {!selectedCity && (
              <section className="welcome-section">
                <div className="welcome-content">
                  <h2>Welcome to Travel Planner!</h2>
                  <p>
                    Search for a city above to see:
                  </p>
                  <ul>
                    <li>🌤️ 7-day weather forecast</li>
                    <li>🏂 Activity recommendations (Skiing, Surfing, Sightseeing)</li>
                    <li>📊 Smart scoring based on weather conditions</li>
                    <li>🎯 Personalized rankings for your trip</li>
                    <li>📍 Distance and travel time from your location</li>
                  </ul>
                  <p>
                    <strong>How it works:</strong> Our AI analyzes temperature, precipitation, 
                    wind speed, and UV index to score activities from 1-10, helping you 
                    plan the perfect outdoor adventure or cozy indoor day.
                  </p>
                </div>
              </section>
            )}
          </main>

          <footer className="App-footer">
            <p>
              Powered by Open-Meteo weather data • Built with React, GraphQL & TypeScript
            </p>
          </footer>
        </div>
      </LocationProvider>
    </ApolloProvider>
  );
}

export default App; 