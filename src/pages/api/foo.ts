import AuthService from '@/server/auth';
import { NextApiRequest, NextApiResponse } from 'next';

export default function fooHandler(req: NextApiRequest, res: NextApiResponse) {
  const [, token] = (req.headers.authorization ?? '').split(' ');
  if (!token) return res.status(401).json({});
  const isVerified = AuthService.verify(token);
  if (!isVerified) return res.status(401).json({});
  
  return res.status(200).json({
    message: 'Tudo ok!',
  });
}
