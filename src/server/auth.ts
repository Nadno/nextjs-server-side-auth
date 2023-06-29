import jwt, { JwtPayload } from 'jsonwebtoken';

const TOKEN_SECRET = process.env.SECRET_API_TOKEN as string;

const AuthService = {
  sign(subject: string, payload: object, expires: string): string {
    return jwt.sign(payload, TOKEN_SECRET, { subject, expiresIn: expires });
  },
  verify(token: string): boolean {
    try {
      jwt.verify(token, TOKEN_SECRET);
      return true;
    } catch {
      return false;
    }
  },
  decode(token: string): JwtPayload {
    return jwt.decode(token) as JwtPayload;
  },
};

export default AuthService;
