'use client';
import Image from 'next/image';
import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { isValidCpf } from '@/utils/isValidCpf';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/Input/Input';
import { FaAddressCard } from 'react-icons/fa';
import { FaUserAlt, FaLock } from 'react-icons/fa';
import { MdEmail, MdLocalPhone } from 'react-icons/md';
import formImgLarge from '../../../../public/illustrations/sign-up/finance-app-cuate.svg';

const userSignInFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  document: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'O CPF deve conter 11 dígitos')
    .refine((cpf) => isValidCpf(cpf), {
      message: 'CPF inválido',
    }),
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .regex(
      /[^A-Za-z0-9]/,
      'A senha deve conter pelo menos um caractere especial'
    ),
  cellphone: z
    .string()
    .regex(
      /^\(\d{2}\)\d{4,5}-\d{4}$/,
      'O número de celular deve conter 10 ou 11 dígitos'
    ),
});

function formatCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1)$2-$3');
  } else {
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1)$2-$3');
  }
}

type IUserSignInForm = z.infer<typeof userSignInFormSchema>;

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IUserSignInForm>({
    resolver: zodResolver(userSignInFormSchema),
  });
  const [maskedCPF, setMaskedCPF] = useState<string>('');
  const [maskedCellphone, setMaskedCellphone] = useState<string>('');

  const onSubmit: SubmitHandler<IUserSignInForm> = (
    payload: IUserSignInForm
  ) => {
    console.log('payload: ', payload);
  };

  return (
    <main className='w-full max-w-screen h-screen bg-gray-100 flex flex-col justify-center items-center px-4 md:flex-row md:gap-8 md:justify-start'>
      <Image
        className='hidden md:w-[50%] lg:w-[60%] max-h-screen md:block'
        src={formImgLarge}
        alt='Pessoa analisando finanças no celular com app de gestão financeira ao fundo'
      />
      <div className='w-full max-w-[500px] bg-white px-5 py-6 rounded-2xl xl:min-w-[400px]'>
        <form
          className='flex flex-col items-center gap-3'
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className='w-full'>
            <h1 className='text-2xl font-semibold'>Sign Up</h1>
          </div>
          <Input
            IconOptions={{ icon: FaUserAlt, size: 18 }}
            label='Nome'
            labelFor='name'
            inputName='name'
            inputId='name'
            inputType='name'
            inputPlaceholder='Digite seu nome'
            errors={errors.name}
            errorMessage={errors.name?.message}
            register={register}
          />
          <Input
            IconOptions={{ icon: FaAddressCard, size: 20 }}
            value={maskedCPF}
            maxLength={14}
            label='CPF'
            labelFor='document'
            inputName='document'
            inputId='document'
            inputType='document'
            inputPlaceholder='CPF (apenas números)'
            errors={errors.document}
            errorMessage={errors.document?.message}
            register={register}
            onChange={(e) => {
              setMaskedCPF(formatCPF(e.target.value));
            }}
          />
          <Input
            IconOptions={{ icon: MdEmail }}
            label='E-mail'
            labelFor='email'
            inputName='email'
            inputId='email'
            inputType='email'
            inputPlaceholder='Seu melhor e-mail'
            errors={errors.email}
            errorMessage={errors.email?.message}
            register={register}
          />
          <Input
            IconOptions={{ icon: FaLock, size: 18 }}
            label='Senha'
            labelFor='password'
            inputName='password'
            inputId='password'
            inputType='password'
            inputPlaceholder='Crie uma senha'
            errors={errors.password}
            errorMessage={errors.password?.message}
            register={register}
          />
          <Input
            IconOptions={{ icon: MdLocalPhone, size: 22 }}
            value={maskedCellphone}
            maxLength={14}
            label='Celular'
            labelFor='cellphone'
            inputName='cellphone'
            inputId='cellphone'
            inputType='tel'
            inputPlaceholder='Número de celular'
            errors={errors.cellphone}
            errorMessage={errors.cellphone?.message}
            register={register}
            onChange={(e) => {
              setMaskedCellphone(formatPhone(e.target.value));
            }}
          />
          <Button className='mt-2' variant={'default'} size={'default'} type='submit'>
            Cadastrar
          </Button>
        </form>
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
