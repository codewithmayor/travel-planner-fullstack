import express from 'express';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from '../types/graphql';
import { resolvers } from './resolvers';
import dotenv from 'dotenv';
import { z } from 'zod';
import { applyHelmet, applyRateLimit, depthLimitRule } from '../security';
import dns from 'node:dns';

// Load and validate env
dotenv.config();
dns.setDefaultResultOrder('ipv4first');
const envSchema = z.object({
  OPEN_METEO_BASE_URL: z.string().url().default('https://api.open-meteo.com'),
  PORT: z.string().regex(/^\d+$/).default('4000'),
  NODE_ENV: z.string().default('development'),
});
envSchema.parse(process.env);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimitRule],
  formatError: (err) => {
    if (process.env.NODE_ENV === 'production') {
      return { message: err.message };
    }
    return err;
  },
});

(async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: parseInt(process.env.PORT || '4000', 10) },
  });
  console.log(`🚀 Server ready at ${url}`);
})(); 