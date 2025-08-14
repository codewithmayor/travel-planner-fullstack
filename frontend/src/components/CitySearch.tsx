import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { SUGGEST_CITIES } from '../graphql/queries';
import { CitySuggestion } from '../types';

interface CitySearchProps {
  onCitySelect: (city: CitySuggestion) => void;
}

export const CitySearch: React.FC<CitySearchProps> = ({ onCitySelect }) => {
  const [query, setQuery] = useState('');
  const [searchCities, { data, loading, error }] = useLazyQuery(SUGGEST_CITIES);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim().length >= 2) {
      searchCities({ variables: { query: searchQuery } });
    } else {
      // Clear results if query is too short
      searchCities({ variables: { query: '' } });
    }
  };

  const handleCitySelect = (city: CitySuggestion) => {
    onCitySelect(city);
    setQuery('');
    // Clear the search results by calling the query with empty string
    searchCities({ variables: { query: '' } });
  };

  return (
    <div className="city-search">
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="Search for a city..."
          className="search-input"
        />
        {loading && <div className="loading-spinner">🔍</div>}
      </div>

      {error && (
        <div className="error-message">
          Error searching cities: {error.message}
        </div>
      )}

      {data?.suggestCities && data.suggestCities.length > 0 && query.length >= 2 && (
        <div className="city-suggestions">
          {data.suggestCities.map((city: CitySuggestion) => (
            <div
              key={city.id}
              className="city-suggestion"
              onClick={() => handleCitySelect(city)}
            >
              <div className="city-name">{city.name}</div>
              <div className="city-details">
                {city.admin1 && <span>{city.admin1}, </span>}
                <span>{city.country}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.suggestCities && data.suggestCities.length === 0 && query.length >= 2 && (
        <div className="no-results">No cities found for "{query}"</div>
      )}
    </div>
  );
}; 