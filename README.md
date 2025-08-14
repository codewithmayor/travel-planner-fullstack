# Travel Planner - Full-Stack Application

A complete travel planning application that tells you whether to surf, ski, or hide indoors based on 7-day weather forecasts. Built with Node.js, TypeScript, GraphQL, and React.

## What This Does

Type in a city name, get weather data, and see activity rankings. The app uses Open-Meteo's weather APIs to score activities based on temperature and precipitation patterns. **Bonus:** Share your location to see how far cities are from you and get travel time estimates.

## Quick Start

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm run install:ui

# Run everything
npm run dev:ui
```

Your playground:
- **Backend**: [http://localhost:4000/]
- **Frontend**: [http://localhost:3000/]

## Development Commands

### Combined (Recommended)
```bash
npm run dev:ui  # Starts both servers
```

### Separate (For debugging)
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend  
npm run ui
```

**Note on .env File**

For this take-home, it's just boring config: a public API URL, a port, and the environment. No secrets, no keys, nothing you could use to hack my bank account.

In real projects, I wouldn't do this. Even a newbie dev knows never to commit real secrets or API keys, and to use .gitignore and a secrets manager. But for this demo, it's harmless and makes setup easier.

## Architecture Overview & Technical Choices

### **Backend Architecture**
- **Apollo Server v4**: Modern GraphQL server with built-in validation and error handling
- **TypeScript**: Full type safety across the entire backend
- **Service Layer Pattern**: Clean separation between business logic and data access
- **DataLoader Integration**: Batching and caching to prevent N+1 query problems
- **Modular Structure**: Services, datasources, and resolvers are clearly separated

### **Frontend Architecture**
- **React 18**: Modern React with hooks and functional components
- **Apollo Client**: GraphQL client with caching and error handling
- **TypeScript**: Shared types between frontend and backend
- **Component Composition**: Reusable, testable components with clear responsibilities
- **Location Context**: React context for managing user location state

### **Data Flow**
```
User Input → GraphQL Query → Resolver → Service → DataSource → External API
                ↓
            Response → Frontend → Activity Ranking → UI Display
                ↓
            Location Context → Distance Calculation → Travel Time Estimates
```

### **Why These Choices?**
- **GraphQL**: Single endpoint, flexible queries, built-in documentation
- **TypeScript**: Catches errors at compile time, better developer experience
- **Service Layer**: Easy to test business logic in isolation
- **DataLoader**: Solves common GraphQL performance issues
- **React + Apollo**: Industry standard for GraphQL frontends
- **Location Context**: Clean state management for location-aware features

## Testing

### Backend Tests
The backend uses Jest with comprehensive coverage of services, datasources, and GraphQL resolvers.

```bash
npm test                    # Run all backend tests with coverage
npm test -- --verbose      # Run with detailed output
npm test -- --testPathPatterns="activityService"  # Run specific test files
```

**What's Tested:**
- **Services**: Business logic for weather scoring, city search, and health checks
- **Datasources**: Open-Meteo API integration with caching and error handling
- **GraphQL Resolvers**: API endpoint functionality and error responses
- **Integration**: End-to-end GraphQL query handling

### Frontend Tests
The frontend uses Jest with React Testing Library for component and utility testing.

```bash
cd frontend
npm test                    # Run all frontend tests
npm test -- --watch        # Run in watch mode
npm test -- --testPathPatterns="locationUtils"  # Run specific test files
```

**What's Tested:**
- **Utilities**: Location calculations, distance formatting, and geolocation handling (22 tests)
- **Location Services**: Geolocation API integration, permission handling, and error scenarios

**What's NOT Tested (Frontend Testing Gaps):**
- **Components**: React component rendering and user interactions
- **GraphQL Integration**: Apollo Client queries and error handling
- **User Experience**: Form inputs, loading states, and error displays

### Test Coverage
Both test suites aim for high coverage:
- **Backend**: ~70% statements, branches, functions, and lines
- **Frontend**: ~60% statements, branches, functions, and lines

The tests focus on core business logic, API integrations, and user-facing functionality. They're designed to catch regressions quickly and ensure the app works as expected across different scenarios.

### Manual Testing

#### Backend (GraphQL Playground)
Head to [http://localhost:4000/]

**City Search:**
```graphql
query GetCities($query: String!) {
  suggestCities(query: $query) {
    id name country latitude longitude
  }
}
```
Variables: `{ "query": "London" }`

**Weather:**
```graphql
query GetWeather($cityId: ID!) {
  weather(cityId: $cityId) {
    cityId
    daily {
      date temperatureMax temperatureMin precipitation weatherCode windSpeed uvIndex
    }
  }
}
```
Variables: `{ "cityId": "2643743" }`

**Activities:**
```graphql
query GetActivities($cityId: ID!) {
  activities(cityId: $cityId) {
    activity score reason
  }
}
```
Variables: `{ "cityId": "2643743" }`

**Health Check:**
```graphql
query GetHealth {
  health {
    status timestamp uptime version
    checks {
      database { status }
      externalApi { status responseTime }
      cache { status }
    }
  }
}
```

#### Frontend
Visit [http://localhost:3000/] and:
1. Search for a city
2. View weather forecast
3. See activity rankings
4. Test error handling (try invalid city names)
5. **Test location features**: Click "Share your location" to see distance calculations estimates

## Activity Scoring Logic

### **Simple 1-10 Scoring System**
The app uses a clear, intuitive scoring system that's easy to understand:

#### **How It Works**
- **Score Range**: 1-10 (where 10 is perfect conditions)
- **Calculation**: Based on multiple weather factors per day
- **Max Points**: Each day can contribute up to 4 points
- **Final Score**: Converted to a 1-10 scale for clarity

#### **Skiing**
- **Temperature**: Optimal range -15°C to 2°C
- **Precipitation**: Snow (weather codes 70-79) gets 2 points
- **Wind**: Low wind (<20 km/h) gets 1 point
- **Scoring**: Up to 4 points per day, converted to 1-10 scale

#### **Surfing**
- **Temperature**: 18-35°C range
- **Rain**: Low precipitation (<2mm) gets 2 points
- **Wind**: Moderate wind (<25 km/h) gets 1 point
- **UV Safety**: UV index <8 gets 1 point (prevents sunburn)
- **Scoring**: Up to 4 points per day, converted to 1-10 scale

#### **Outdoor Sightseeing**
- **Temperature**: 10-28°C range
- **Rain**: Low precipitation (<2mm) gets 2 points
- **Wind**: Light breeze (5-15 km/h) gets 1 point
- **UV**: Moderate UV (3-7) gets 1 point
- **Scoring**: Up to 4 points per day, converted to 1-10 scale

#### **Indoor Sightseeing**
- **Bad Weather**: Heavy rain (>3mm), extreme cold (<0°C)
- **Storms**: Weather codes >60 (thunderstorms, etc.)
- **High Wind**: Wind speed >30 km/h
- **Scoring**: 2 points per day for poor conditions, converted to 1-10 scale

### **What the Scores Mean**
- **7-10**: Excellent conditions for this activity
- **4-6**: Good conditions
- **1-3**: Poor conditions
- **0**: Not recommended

### **Score Color Coding**
The app uses visual color coding to make scores easy to understand at a glance:

- **Green (7-10)**: High score - excellent to very good conditions
- **Yellow/Orange (4-6)**: Medium score - moderate conditions
- **Red (1-3)**: Low score - poor to very poor conditions

This color system helps the user quickly identify which activities have favorable weather without reading the numbers.

### **How Recommendations Are Ranked**
The app automatically ranks activities from best to worst based on weather conditions:

- **#1 Recommendation**: Highest score - best weather conditions for that activity
- **#2 Recommendation**: Second highest score - very good conditions
- **#3 Recommendation**: Third highest score - moderate conditions
- **#4 Recommendation**: Lowest score - poorest conditions

**Example Ranking:**
1. **Surfing (10/10)**: Perfect surfing weather - warm, low rain, light wind
2. **Outdoor Sightseeing (9/10)**: Excellent for walking tours and outdoor activities
3. **Indoor Sightseeing (1/10)**: Poor outdoor conditions - good time for museums
4. **Skiing (0/10)**: No suitable skiing conditions - too warm, no snow

The ranking helps you quickly identify which activities will be most enjoyable during your visit, so you can plan your itinerary accordingly.

## Location Awareness Features

### **Smart Distance Calculation**
- **Haversine Formula**: Accurate distance calculation between your location and any city
- **Travel Time Estimates**: Smart estimates based on distance (drive vs flight)
- **Persistent Storage**: Your location is saved locally so you don't need to re-share
- **Privacy First**: All location data stays on your device, never sent to servers

### **How It Works**
1. **Share Location**: Click "Share your location" when prompted
2. **Browser Permission**: Allow location access when your browser asks
3. **Distance Display**: See "~2,100 km from your location (3-4 hour flight)"
4. **Smart Estimates**: Automatically determines if it's a drive or flight

### **Travel Time Estimates**
- **< 50 km**: "25 min drive"
- **50-200 km**: "1-2 hour drive"
- **200-1000 km**: "3-5 hour drive"
- **> 1000 km**: "2-3 hour flight"

### **What You'll See**
- **Before Location**: "📍 Share your location to see distance from London"
- **After Location**: "📍 ~2,100 km from your location (3-4 hour flight)"
- **Error Handling**: Clear guidance if location access fails

## Features

### **Enhanced Business Rules & Scoring**
- **Multi-factor Weather Analysis**: Temperature, precipitation, wind speed, UV index
- **Weather Code Intelligence**: Distinguishes snow vs rain for skiing
- **Simple 1-10 Scale**: Easy to understand scoring system
- **Activity-Specific Logic**: Tailored scoring for each activity type
- **Real-time Weather Data**: 7-day forecasts with hourly precision

### **Location Intelligence**
- **Geolocation Integration**: Uses browser's native location API
- **Distance Calculations**: Accurate city-to-city distance estimates
- **Travel Planning**: Rough travel time estimates for trip planning
- **Context Awareness**: Understand travel logistics alongside weather quality

### **DataLoader Integration**
- Batching for city/weather lookups
- Reduces N+1 query problems
- Ready for database integration

### **Health Monitoring**
- Real-time system health checks
- External API connectivity monitoring
- Performance metrics and uptime

### **Enhanced Architecture**
- Clean separation of concerns
- Scalable patterns
- Production-ready error handling

### **Full-Stack Implementation**
- Modern React UI/UX
- Responsive design
- Smooth interactions and loading states
- Location-aware components

## Security Stuff

- Rate limiting: 100 requests per 15 minutes
- Input validation and sanitization
- GraphQL depth limiting (max 10 levels)
- Helmet for HTTP headers
- Environment variable validation
- **Location Privacy**: All location data stays local, never transmitted

## Trade-offs & Omissions

**Backend - What's missing (and why):**
- **Database**: Using in-memory cache (time-boxed, focused on architecture)
- **Redis**: In-memory TTL cache (ready for Redis swap)
- **Docker**: Manual setup (focus on application logic)
- **Advanced monitoring**: Basic health checks (production foundation laid)
- **Geographic bonuses**: Could add elevation, coastal proximity, mountain data
- **Seasonal adjustments**: Could factor in historical weather patterns

**Frontend - What's missing (and why):**
- **Error boundaries**: No React error boundaries (focused on core functionality)
- **Loading states**: Basic loading indicators (could be more sophisticated)
- **Offline support**: No PWA features (prioritized core weather functionality)
- **Bundle optimization**: No code splitting or lazy loading (focused on architecture)
- **Accessibility**: Basic a11y (could add ARIA labels, keyboard navigation)

**Location Features - What's missing (and why):**
- **Reverse geocoding**: Could show "You're in London" instead of just coordinates
- **Multiple locations**: Could save favorite locations for comparison
- **Route planning**: Could integrate with mapping APIs for actual routes
- **Public transport**: Could include train/bus time estimates

**Shortcuts taken:**
- **Backend**: In-memory caching instead of Redis, basic error handling instead of comprehensive logging
- **Frontend**: Simple loading states instead of skeleton screens, no error boundaries, no performance monitoring
- **Location**: Basic distance calculation instead of full mapping integration, simple travel time estimates

**How to fix:**
- **Backend**: Swap cache implementation for Redis, add Winston/Pino logging, implement user authentication
- **Frontend**: Add React error boundaries, implement skeleton loading states, add PWA capabilities, implement frontend testing with React Testing Library
- **Location**: Integrate with Google Maps API for accurate routes, add reverse geocoding, implement location history

## AI Usage

**How AI assisted:**
- Project scaffolding and basic component structure
- Debugging TypeScript configuration issues
- Suggesting architectural patterns (DataLoader, health monitoring)
- Markdown file documentation formatting
- Location utility functions and error handling patterns
- Comprehensive testing strategy and Jest configuration setup
- Test mocking strategies for external APIs and browser APIs
- Test data generation and edge case coverage

**Judgment applied:**
- Only implemented AI suggestions that aligned with best practices based on experience and generally accepted standards
- Manually reviewed and modified all AI-generated code
- Used AI as a tool, not a replacement for engineering judgment
- Ensured suggestions fit architectural goals
- Customized location features to match the app's specific needs
- Tested all AI-generated test code to ensure proper mocking and assertions
- Validated test coverage by running comprehensive test suites and fixing failing tests
- Iteratively refined test data and expectations to match actual application behavior
- Ensured tests catch real regressions rather than just passing with incorrect logic

## Production Readiness

**Backend Ready for:**
- Redis caching
- Database integration
- Containerization
- CI/CD pipelines
- Advanced monitoring

**Frontend Ready for:**
- **Build optimization**: React Scripts with production build optimization
- **CDN deployment**: Static assets ready for CDN hosting
- **Responsive design**: Mobile-first CSS with glassmorphism UI
- **TypeScript**: Full type safety across all components
- **GraphQL integration**: Apollo Client with error handling
- **Component architecture**: Modular, reusable React components
- **Location services**: Production-ready geolocation with proper error handling

**Location Features Ready for:**
- **HTTPS deployment**: Will work seamlessly in production with proper SSL
- **Mobile optimization**: Responsive design for mobile location sharing
- **Privacy compliance**: GDPR-ready with local-only location storage
- **Performance**: Efficient distance calculations and caching

**Needs for production:**
- **Backend**: Persistent storage, comprehensive logging, load balancing, security hardening, performance optimization
- **Frontend**: Error boundaries, loading states, offline support, bundle analysis, performance monitoring, user analytics
- **Location**: HTTPS deployment, mobile testing, location permission handling
- **DevOps**: CI/CD pipelines, containerization, monitoring, alerting

---

Overall, I think it's clean-ish, testable, and ready for you to break (or extend). I believe the location awareness adds real value for travelers without complicating the core weather-based recommendations. Thank you for the opportunity!
