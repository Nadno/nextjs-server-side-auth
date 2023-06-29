import SessionService from '@/server/session';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import nookies from 'nookies';

export default function PrivatePage() {
  return null;
}

export function getServerSideProps(
  ctx: GetServerSidePropsContext
): GetServerSidePropsResult<{}> {
  SessionService.deleteFrom(ctx, ['userToken', 'userEmail']);

  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
}
