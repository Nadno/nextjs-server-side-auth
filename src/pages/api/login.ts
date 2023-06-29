import { NextApiRequest, NextApiResponse } from 'next';

import SessionService from '@/server/session';
import AuthService from '@/server/auth';
import DBService, { DBUserData } from '@/server/database';

export const createUserSession = async (user: DBUserData) => {
  const token = AuthService.sign(user.email, user, '5s'),
    refreshToken = AuthService.sign(user.email, {}, '30s');

  await DBService.write('users', data =>
    data.users.map(_user => {
      if (_user.email !== user.email) return _user;
      return {
        ...user,
        refreshToken,
      };
    })
  );

  return {
    email: user.email,
    token,
    refreshToken,
  };
};

export default async function loginHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST')
    return res.status(405).json({
      message: 'Método de requisição inválido!',
    });

  if (req.body == null)
    return res.status(400).json({
      message: 'Nenhum dado fornecido!',
    });

  const data: DBUserData = req.body;
  const users = await DBService.get('users');

  const foundUser = users.find(
    user => user.email == data.email && user.password === data.password
  );

  if (!foundUser)
    return res.status(400).json({
      message: 'Usuário não cadastrado!',
    });

  const userSession = await createUserSession(foundUser);

  SessionService.signTo(res, {
    userToken: userSession.token,
    userRefreshToken: userSession.refreshToken,
    userEmail: userSession.email,
  });

  return res.status(200).json(userSession);
}
