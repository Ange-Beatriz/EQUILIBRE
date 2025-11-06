import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: number;
  email: string;
  name: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET || 'your-fallback-secret-key';
  const expiresIn = process.env.JWT_EXPIRE || '7d';

  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_SECRET || 'your-fallback-secret-key';
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    return null;
  }
};
