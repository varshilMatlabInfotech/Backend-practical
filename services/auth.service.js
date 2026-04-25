import httpStatus from 'http-status';
import ApiError from 'utils/ApiError';
import { userService, tokenService } from 'services';
import { EnumTypeOfToken } from 'models/enum.model';
import bcrypt from 'bcryptjs';

// Login with email and password
export const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect email or password');
  }
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect email or password');
  }
  return user;
};

// Refresh auth tokens using a valid refresh token
export const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, EnumTypeOfToken.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Token');
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};
