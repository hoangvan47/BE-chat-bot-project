import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Generate JWT Access Token
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
  });
};

/**
 * Generate JWT Refresh Token
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  });
};

/**
 * Verify JWT Access Token
 */
export const verifyAccessToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify JWT Refresh Token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};
