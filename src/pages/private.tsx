import { useRouter } from 'next/router';

import { Button } from '@/components/Button';
import { withAuthentication } from '@/decorators/withAuthentication';
import { useEffect } from 'react';

import fetcher from '@/utils/fetch';

export default function PrivatePage({ user }: any) {
  const router = useRouter();

  useEffect(() => {
    fetcher.headers({
      Authorization: `Bearer ${user.token}`,
    });
  }, [user.token]);

  const tryRefreshToken = async () => {
    await fetcher.get('/api/foo');
  };

  return (
    <main className="min-h-screen flex flex-col gap-y-4 items-center justify-center">
      <div className="text-center">
        <h1>Bem vindo a página privada!</h1>
        <p>Usuário: {user.email}</p>
      </div>

      <Button onClick={() => router.push('/logout')}>Sair</Button>
      <Button onClick={tryRefreshToken}>Refresh token</Button>
    </main>
  );
}

export const getServerSideProps = withAuthentication(ctx => ({
  props: {
    user: ctx.user,
  },
}));
