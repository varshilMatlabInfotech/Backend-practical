import httpStatus from 'http-status';
import cors from 'cors';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import helmet from 'helmet';
import express from 'express';
import actuator from 'express-actuator';
import passport from 'passport';
import jwtStrategy from 'config/passport';
import ApiError from 'utils/ApiError';
import { errorConverter, errorHandler } from 'middlewares/error';
import sendResponse from 'middlewares/sendResponse';
import config from 'config/config';
import { successHandler, errorHandler as morganErrorHandler } from 'config/morgan';
import friendRoute from './routes/friend/friend.routre';
import authRoutes from './routes/user/auth/auth.route';

const app = express();

app.use(actuator());

if (config.env !== 'test') {
  app.use(successHandler);
  app.use(morganErrorHandler);
}
// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// sanitize request data against XSS and NoSQL injection
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// standardized response wrapper
app.use(sendResponse);

// cors
app.use(cors());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// routes
app.use('/', friendRoute);
app.use('/', authRoutes);

// 404 handler
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// error handling
app.use(errorConverter);
app.use(errorHandler);

export default app;
