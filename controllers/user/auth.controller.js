import httpStatus from 'http-status';
import { catchAsync } from 'utils/catchAsync';
import { authService, tokenService, userService } from 'services';

export const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.OK).send({ results: { success: true, user } });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ results: { user, tokens } });
});

// Get logged-in user's info
export const userInfo = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  res.status(httpStatus.OK).send({ results: { user } });
});

// Update logged-in user's info
export const updateUserInfo = catchAsync(async (req, res) => {
  const user = await userService.updateUser({ _id: req.user._id }, req.body);
  res.status(httpStatus.OK).send({ results: { user } });
});

export const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.status(httpStatus.OK).send({ results: { ...tokens } });
});

export const logout = catchAsync(async (req, res) => {
  await tokenService.invalidateToken(req.body);
  res.status(httpStatus.OK).send({ results: { success: true } });
});
