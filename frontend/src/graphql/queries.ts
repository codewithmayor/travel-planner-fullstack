import { gql } from '@apollo/client';

export const SUGGEST_CITIES = gql`
  query SuggestCities($query: String!) {
    suggestCities(query: $query) {
      id
      name
      country
      admin1
      latitude
      longitude
    }
  }
`;

export const GET_WEATHER = gql`
  query GetWeather($cityId: ID!) {
    weather(cityId: $cityId) {
      cityId
      daily {
        date
        temperatureMax
        temperatureMin
        precipitation
        weatherCode
        windSpeed
        uvIndex
      }
    }
  }
`;

export const GET_ACTIVITIES = gql`
  query GetActivities($cityId: ID!) {
    activities(cityId: $cityId) {
      activity
      score
      reason
    }
  }
`;

export const GET_HEALTH = gql`
  query GetHealth {
    health {
      status
      timestamp
      uptime
      version
      checks {
        database {
          status
          responseTime
        }
        externalApi {
          status
          responseTime
        }
        cache {
          status
          responseTime
        }
      }
    }
  }
`; 