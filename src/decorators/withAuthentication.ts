import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';

import SessionService from '@/server/session';
import AuthService from '@/server/auth';
import fetcher from '@/utils/fetch';

export type User = {
  email: string;
  token: string;
};

type GetServerSidePropsWrapper<Props extends object = {}> = (
  context: GetServerSidePropsContext
) => Promise<GetServerSidePropsResult<Props>>;

export type GetServerSidePropsWithAuth<Props extends object = {}> = (
  context: GetServerSidePropsContext & {
    user: User;
  }
) => GetServerSidePropsResult<Props>;

export type SessionData = {
  userToken: string;
  userEmail: string;
  userRefreshToken: string;
};

export const withAuthentication = <Props extends object = {}>(
  getServerSideProps: GetServerSidePropsWithAuth<Props>
): GetServerSidePropsWrapper<Props> => {
  return async ctx => {
    const { userToken, userRefreshToken, userEmail } =
        SessionService.getFrom<SessionData>(ctx),
      user = {
        email: userEmail,
        token: userToken,
      };

    const isAuthenticated = AuthService.verify(userToken);
    if (!isAuthenticated) {
      const { data, response } = await fetcher.post<{ token: string }>(
        'http://localhost:3000/api/refresh',
        null,
        {
          headers: {
            Authorization: `Bearer ${userRefreshToken}`,
          },
        }
      );

      if (!data.token || response.status !== 200)
        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        };

      user.token = data.token;
    }

    return getServerSideProps({
      ...ctx,
      user,
    });
  };
};
