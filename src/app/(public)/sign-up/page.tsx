'use client';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import formImgLarge from '../../../../public/illustrations/sign-up/finance-app-cuate.svg';
import SignUpForm from '@/components/forms/SignUpForm/SignUpForm';

export default function SignIn() {
  return (
    <main className='w-full max-w-screen h-screen bg-gray-100 flex flex-col justify-center items-center px-4 md:flex-row md:gap-8 md:justify-start'>
      <Image
        className='hidden md:w-[50%] lg:w-[60%] max-h-screen md:block'
        src={formImgLarge}
        alt='Pessoa analisando finanças no celular com app de gestão financeira ao fundo'
      />
      <div className='w-full max-w-[500px] bg-white px-5 py-6 rounded-2xl xl:min-w-[400px]'>
        <SignUpForm />
        <Button
          className='w-full text-center mt-2'
          variant={'link'}
          size={'sm'}
          onClick={() => alert('Faça login!')}
        >
          Já possui uma conta? Faça o login!
        </Button>
      </div>
    </main>
  );
}
