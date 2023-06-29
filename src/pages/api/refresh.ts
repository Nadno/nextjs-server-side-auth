import { NextApiRequest, NextApiResponse } from 'next';

import SessionService from '@/server/session';
import AuthService from '@/server/auth';
import DBService from '@/server/database';

export default async function refreshHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST')
    return res.status(405).json({
      message: 'Método de requisição inválido!',
    });

  let [, refreshToken] = (req.headers.authorization ?? '').split(' ');

  if (!refreshToken || refreshToken === 'undefined') {
    ({ userRefreshToken: refreshToken = '' } = SessionService.getFrom<{
      userRefreshToken?: string;
    }>({
      req,
    }));
  }

  if (!refreshToken)
    return res.status(401).json({
      message: 'Token inválido!',
    });

  const userEmail = AuthService.decode(refreshToken).sub;
  if (!userEmail)
    return res.status(401).json({
      message: 'Token inválido!',
    });

  const isVerified = AuthService.verify(refreshToken);
  if (!isVerified) {
    await DBService.write('users', data =>
      data.users.map(user => {
        if (user.email !== userEmail) return user;

        return {
          email: user.email,
          password: user.password,
        };
      })
    );

    return res.status(401).json({
      message: 'Token inválido!',
    });
  }

  const users = await DBService.get('users');

  const foundUser = users.find(user => user.email == userEmail);

  if (!foundUser)
    return res.status(400).json({
      message: 'Usuário não cadastrado!',
    });

  const token = AuthService.sign(foundUser.email, foundUser, '5s');

  SessionService.signTo(res, {
    userToken: token,
  });

  return res.status(200).json({ token });
}
