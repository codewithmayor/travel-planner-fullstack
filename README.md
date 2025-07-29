# Travel Planner API

Welcome! This is a GraphQL API for travel nerds, built with Node.js and TypeScript. It helps you find cities, check the weather, and figure out if you should be surfing, skiing, or just hiding indoors. No frontend as per brief(even though I was tempted to rop one in), just a clean-ish, testable backend.

## Quick Start

```bash
touch .env
npm run dev
```

Your playground is at [http://localhost:4000/](http://localhost:4000/). Pop open the GraphQL explorer and go wild.

## Environment Variables

You’ll need a `.env` file. Here’s what to put in it:

```bash
OPEN_METEO_BASE_URL=https://api.open-meteo.com
PORT=4000
NODE_ENV=development
```

## What’s This Thing Do?

- **City Search:** Type a few letters, get city suggestions. Powered by Open-Meteo’s geocoding.
- **Weather:** 7-day forecasts for any city you pick.
- **Activities:** Ranks skiing, surfing, and sightseeing (indoor/outdoor) based on the weather. No more guessing if you’ll need sunscreen or snow boots.

## Example Response

Here’s what you get if you ask for activities in a hot place:

```json
{
  "activities": [
    { "activity": "Skiing", "score": 0, "reason": "0 days with cold and precipitation" },
    { "activity": "Surfing", "score": 7, "reason": "7 days with warm, low-rain weather" },
    { "activity": "OutdoorSightseeing", "score": 2, "reason": "2 days with mild, dry weather" },
    { "activity": "IndoorSightseeing", "score": 0, "reason": "0 days with poor outdoor conditions" }
  ]
}
```

## How It’s Built

```
src/
├── services/      # Business logic
├── datasources/   # Open-Meteo API wrappers
├── graphql/       # Schema and resolvers
├── security/      # Rate limiting, validation, helmet
└── test/          # Jest tests with mocking
```

Apollo Server v4, TypeScript, Jest. In-memory cache with a 5-minute TTL. No magic, just code.

## Testing

### Automated

```bash
npm test
```

You’ll get coverage stats and a warm fuzzy feeling. Tests hit city search, weather, and activity logic. Mocks keep things fast.

### Manual

Fire up the server, head to [http://localhost:4000/](http://localhost:4000/), and try these:

**City Search:**
```graphql
query GetCities($query: String!) {
  suggestCities(query: $query) {
    id
    name
    country
    latitude
    longitude
  }
}
```
Variables:
```json
{ "query": "London" }
```

**Weather:**
```graphql
query GetWeather($cityId: ID!) {
  weather(cityId: $cityId) {
    cityId
    daily {
      date
      temperatureMax
      temperatureMin
      precipitation
      weatherCode
    }
  }
}
```
Variables:
```json
{ "cityId": "2643743" }
```

**Activities:**
```graphql
query GetActivities($cityId: ID!) {
  activities(cityId: $cityId) {
    activity
    score
    reason
  }
}
```
Variables:
```json
{ "cityId": "2643743" }
```

Try weird cities, empty queries, or nonsense IDs. See what breaks. (It shouldn’t.)

## Security Stuff

- 100 requests per 15 minutes (rate limit)
- Input validation and sanitization
- GraphQL depth limiting (max 10 levels)
- Helmet for HTTP headers
- Env var validation

## How Activities Are Ranked

- **Skiing:** Below 5°C and wet
- **Surfing:** Above 18°C, not raining
- **Outdoor:** 10-28°C, dry
- **Indoor:** Miserable outside (rain, freezing, or worse)

## Trade-offs

- No persistent DB (just a cache)
- No Redis (but ready for it)
- No Docker (add it if you want)
- No UI (API only)
- Time-boxed to 2-3 hours—kept it lean

## Production Notes

- Use Redis or Memcached for cache if you scale
- Add real logging (Winston, Pino), request tracing, and Sentry for errors
- Use a secrets manager for env vars
- Add query complexity analysis and user-based rate limiting
- Plan for schema evolution and modularization
- Validate all inputs, not just env vars
- Add property-based, mutation, and load tests
- Use a WAF, audit dependencies
- Add Dockerfile, GitHub Actions, and automate checks
- Generate GraphQL docs, share a Postman/Insomnia collection
- Add a health check endpoint
- Support localization in city search
- Consider persisted queries for bandwidth/security

---

Built for a backend engineering assessment. It’s clean, testable, and ready for you to break (or extend). 