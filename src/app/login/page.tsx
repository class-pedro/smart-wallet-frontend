'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Login() {
  const { signIn, isLoading: loginIsLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn({ email, password });
    router.push('/dashboard');
  }
  return (
    <main className='w-full flex justify-center items-center min-h-screen bg-gray-100 p-6'>
      {loginIsLoading ? (
        <div>
          {' '}
          <h1 className='text-xl text-gray-500 font-bold animate-spin'>
            Loading...
          </h1>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className='bg-gray-200 w-full max-w-[500px] flex flex-col items-center gap-4 mt-20 p-10 border border-gray-300 rounded'
        >
          <h1 className='text-3xl text-gray-500 font-bold'>Login</h1>
          <input
            type='email'
            placeholder='Email'
            className='text-gray-500 border border-gray-300 p-2 w-full rounded outline-0'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type='password'
            placeholder='Senha'
            className='text-gray-500 border border-gray-300 p-2 w-full rounded outline-0'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className='bg-blue-600 text-white p-2 rounded w-full cursor-pointer hover:bg-blue-700'>
            Entrar
          </button>
        </form>
      )}
    </main>
  );
}
