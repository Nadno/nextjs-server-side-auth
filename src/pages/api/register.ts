import { NextApiRequest, NextApiResponse } from 'next';

import SessionService from '@/server/session';

import DBService, { DBUserData } from '@/server/database';

import { createUserSession } from './login';

export default async function registerHandler(
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

  const { email, password }: DBUserData = req.body;
  const users = await DBService.get('users');

  const foundUser = users.find(user => user.email == email);

  if (foundUser)
    return res.status(400).json({
      message: 'Usuário já cadastrado!',
    });

  const newUser = { email, password };

  await DBService.write('users', () => [...users, newUser]);

  const userSession = await createUserSession(newUser);

  SessionService.signTo(res, {
    userToken: userSession.token,
    userRefreshToken: userSession.refreshToken,
    userEmail: userSession.email,
  });

  return res.status(200).json(userSession);
}
