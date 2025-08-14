import { getWeatherForecast } from './weatherService';

export interface HealthCheck {
  status: string;
  responseTime?: number;
}

export interface HealthChecks {
  database: HealthCheck;
  externalApi: HealthCheck;
  cache: HealthCheck;
}

export interface Health {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  checks: HealthChecks;
}

export const getHealth = async (): Promise<Health> => {
  const startTime = Date.now();
  
  // Check external API connectivity
  let externalApiStatus = 'healthy';
  let externalApiResponseTime = 0;
  
  try {
    const apiStart = Date.now();
    // Test with a known city ID (London)
    await getWeatherForecast('2643743');
    externalApiResponseTime = Date.now() - apiStart;
  } catch (error) {
    externalApiStatus = 'unhealthy';
  }

  // Check cache (in-memory for now)
  const cacheStatus = 'healthy'; // Always healthy for in-memory cache
  
  // Check database (simulated for now)
  const databaseStatus = 'healthy'; // Simulated as healthy
  
  const overallStatus = externalApiStatus === 'healthy' && 
                       cacheStatus === 'healthy' && 
                       databaseStatus === 'healthy' 
                       ? 'healthy' : 'degraded';

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: {
        status: databaseStatus,
        responseTime: 0
      },
      externalApi: {
        status: externalApiStatus,
        responseTime: externalApiResponseTime
      },
      cache: {
        status: cacheStatus,
        responseTime: 0
      }
    }
  };
}; 