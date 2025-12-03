'use client';

import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { logout } = useAuth();
  return (
    <main className='min-h-screen bg-gray-100 p-6'>
      <header className='mb-6 flex justify-between items-center gap-2'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-800'>Dashboard</h1>
          <p className='text-gray-500'>Bem-vindo ao painel!</p>
        </div>
        <button
          className='min-w-20 bg-red-400 text-white font-medium p-2 rounded cursor-pointer hover:bg-red-500 hover:shadow-md'
          onClick={logout}
        >
          Sair
        </button>
      </header>

      <section className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <div className='bg-white p-4 rounded shadow'>
          <h2 className='text-sm text-gray-500'>Usuários</h2>
          <p className='text-3xl font-bold mt-2 text-gray-500'>124</p>
        </div>

        <div className='bg-white p-4 rounded shadow'>
          <h2 className='text-sm text-gray-500'>Pedidos</h2>
          <p className='text-3xl font-bold mt-2 text-gray-500'>76</p>
        </div>

        <div className='bg-white p-4 rounded shadow'>
          <h2 className='text-sm text-gray-500'>Faturamento</h2>
          <p className='text-3xl font-bold mt-2 text-gray-500'>R$ 12.430</p>
        </div>
      </section>

      <section className='bg-white p-4 rounded shadow'>
        <h2 className='text-lg font-semibold text-gray-700 mb-4'>
          Atividades Recentes
        </h2>

        <ul className='space-y-3'>
          <li className='p-3 bg-gray-50 text-gray-500 rounded border border-gray-200'>
            Novo pedido criado por João Henrique
          </li>
          <li className='p-3 bg-gray-50 text-gray-500 rounded border border-gray-200'>
            Usuário Maria Clara atualizou o perfil
          </li>
          <li className='p-3 bg-gray-50 text-gray-500 rounded border border-gray-200'>
            Novo usuário cadastrado: Lucas Nunes
          </li>
        </ul>
      </section>
    </main>
  );
}
