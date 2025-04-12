import { Input } from '@/components/shared/Input/Input';
import { FaAddressCard } from 'react-icons/fa';
import { FaUserAlt, FaLock } from 'react-icons/fa';
import { MdEmail, MdLocalPhone } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { useSignUpForm } from './hooks/useSignUpForm';
import { formatCPF } from '@/utils/formatCPF';
import { formatPhone } from '@/utils/formatPhone';
import { RegistrationRecived } from './components/RegistrationRecived';

export default function SignUpForm() {
  const {
    errors,
    onSubmit,
    register,
    maskedCPF,
    handleSubmit,
    setMaskedCPF,
    maskedCellphone,
    registerUserEmail,
    setMaskedCellphone,
    isRegistrationRecived,
  } = useSignUpForm();

  return (
    <>
      {!isRegistrationRecived ? (
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
              const raw = e.target.value.replace(/\D/g, '');
              setMaskedCPF(formatCPF(raw));
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
              const raw = e.target.value.replace(/\D/g, '');
              setMaskedCellphone(formatPhone(raw));
            }}
          />
          <Button
            className='mt-2'
            variant={'default'}
            size={'default'}
            type='submit'
          >
            Cadastrar
          </Button>
        </form>
      ) : (
        <RegistrationRecived registerUserEmail={registerUserEmail ?? ''} />
      )}
      <Button
        className='w-full text-center mt-2'
        variant={'link'}
        size={'sm'}
        onClick={() => alert('Faça login!')}
      >
        {!isRegistrationRecived
          ? 'Já possui uma conta? Faça o login!'
          : 'Ir para tela de login!'}
      </Button>
    </>
  );
}
