import {
  awsLambdaRequestHandler,
  CreateAWSLambdaContextOptions,
} from '@trpc/server/adapters/aws-lambda';
import { echo } from './procedures/echo.js';
import { t } from './init.js';
import type { APIGatewayProxyEvent } from 'aws-lambda';

export const router = t.router;

export const appRouter = router({
  echo,
});

export const handler = awsLambdaRequestHandler({
  router: appRouter,
  createContext: (ctx: CreateAWSLambdaContextOptions<APIGatewayProxyEvent>) =>
    ctx,
  responseMeta: () => ({
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
    },
  }),
});

export type AppRouter = typeof appRouter;
