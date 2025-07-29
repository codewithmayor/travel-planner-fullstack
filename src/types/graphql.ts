export const typeDefs = `
  type CitySuggestion {
    id: ID!
    name: String!
    country: String!
    admin1: String
    latitude: Float!
    longitude: Float!
  }

  type WeatherDay {
    date: String!
    temperatureMax: Float!
    temperatureMin: Float!
    precipitation: Float!
    weatherCode: Int!
  }

  type WeatherForecast {
    cityId: ID!
    daily: [WeatherDay!]!
  }

  type ActivityRanking {
    activity: String!
    score: Float!
    reason: String!
  }

  type Query {
    suggestCities(query: String!): [CitySuggestion!]!
    weather(cityId: ID!): WeatherForecast!
    activities(cityId: ID!): [ActivityRanking!]!
  }
`; 