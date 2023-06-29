import Link from 'next/link';
import { useRouter } from 'next/router';

import fetcher from '@/utils/fetch';

import { AccessForm } from '@/components/AccessForm';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';

export default function RegisterPage() {
  const router = useRouter();

  const handleSubmit: React.EventHandler<
    React.FormEvent<HTMLFormElement>
  > = async e => {
    e.preventDefault();

    const $form = e.currentTarget;

    const formData = new FormData($form),
      userData = {
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirm-password'),
      };

    if (userData.password !== userData.confirmPassword)
      return alert('Senha e confirmar senha não coincidem!');

    const { response, data } = await fetcher.post<{ message: string }>(
      '/api/register',
      userData
    );

    if (!response.ok) throw new Error(data.message);
    router.push('/private');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-2 bg-gray-100">
      <AccessForm title="Cadastrar" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-y-4 mb-8">
          <TextField type="email" id="email" label="E-mail" required />
          <TextField type="password" id="password" label="Senha" required />
          <TextField
            type="password"
            id="confirm-password"
            label="Confirmar senha"
            required
          />
        </div>

        <Button submit fullWidth>
          Cadastrar-se
        </Button>

        <span className="w-full inline-block text-center mt-4">
          <Link className="link" href="/login">
            Acessar
          </Link>
        </span>
      </AccessForm>
    </main>
  );
}
