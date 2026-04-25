import passport from 'passport';
import httpStatus from 'http-status';
import ApiError from 'utils/ApiError';
import { TokenExpiredError } from 'jsonwebtoken';

const verifyCallback = (req, resolve, reject, role) => async (err, user, info) => {
  if (err || info || !user) {
    if (info instanceof TokenExpiredError) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Token Expired'));
    }
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;
  if (role && req.user.role !== role) {
    return reject(
      new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to access this route')
    );
  }
  resolve();
};

const auth = (role) => async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, role))(
        req,
        res,
        next
      );
    });
    next();
  } catch (err) {
    next(err);
  }
};
module.exports = auth;
