import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { env, isProduction } from './config/env.js';
import routes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import * as studentController from './controllers/student.controller.js';
import { validate } from './middleware/validate.js';
import { uuidParamValidation } from './validators/index.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (!isProduction) {
    app.use(morgan('dev'));
  }

  app.use(apiLimiter);
  app.use(env.apiPrefix, routes);
  app.get(
    `${env.apiPrefix}/students/public/:id`,
    validate(uuidParamValidation),
    studentController.getPublicProfile,
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
