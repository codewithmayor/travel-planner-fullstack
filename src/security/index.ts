import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import depthLimit from 'graphql-depth-limit';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';

export const applyHelmet = helmet;

export const applyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export const depthLimitRule = depthLimit(10);

export const getApolloPlugins = () => [
  process.env.NODE_ENV === 'production'
    ? ApolloServerPluginLandingPageDisabled()
    : undefined,
].filter(Boolean); 