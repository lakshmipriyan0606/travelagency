import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '1h' }
  );
};

export const generateRefreshToken = (user, rememberMe = false) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: rememberMe
        ? process.env.JWT_REFRESH_EXPIRE_REMEMBER || '30d'
        : process.env.JWT_REFRESH_EXPIRE || '7d',
    }
  );
};

export const setAuthCookies = (
  res,
  accessToken,
  refreshToken = null,
  { rememberMe = false } = {}
) => {
  const isProduction = process.env.NODE_ENV === 'production';
  // `lax` in dev so SPA on :3002 can credential XHR/proxy to the API with cookies.
  // Production keeps `none` + Secure for cross-site frontends.
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };

  // Access cookie TTL must track JWT access life (~1h), not multi-day refresh TTL.
  // Remember-me only extends the refresh cookie / refresh JWT.
  const accessMaxAgeMs = 60 * 60 * 1000;
  const refreshMaxAgeMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  if (accessToken) {
    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: accessMaxAgeMs,
    });
  }

  if (refreshToken) {
    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: refreshMaxAgeMs,
    });
  }
};
