import { openMeteo } from '../datasources/openMeteo';
import validator from 'validator';
import { CitySuggestion } from '../types';

const MAX_QUERY_LENGTH = 50;

export const suggestCities = async (query: string): Promise<CitySuggestion[]> => {
  const clean = validator.trim(query);
  if (!clean || clean.length > MAX_QUERY_LENGTH) return [];
  const results = await openMeteo.geocodeCity(clean);
  // Fuzzy/prefix search (Open-Meteo does prefix, but we can filter for extra safety)
  return results.filter((c: CitySuggestion) =>
    c.name.toLowerCase().startsWith(clean.toLowerCase())
  );
}; 