import { Input } from '@/components/shared/Input/Input';
import { FaAddressCard } from 'react-icons/fa';
import { FaUserAlt, FaLock } from 'react-icons/fa';
import { MdEmail, MdLocalPhone } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { useSignUpForm } from './hooks/useSignUpForm';
import { formatCPF } from '@/utils/formatCPF';
import { formatPhone } from '@/utils/formatPhone';
import { AlertCard } from './components/AlertCard';
import { SwLoader } from '@/components/SwLoader';

export default function SignUpForm() {
  const {
    onSubmit,
    register,
    maskedCPF,
    formErrors,
    isShowForm,
    handleSubmit,
    setMaskedCPF,
    maskedCellphone,
    isShowErrorCard,
    userSignUpErrors,
    registerUserEmail,
    isShowSuccessCard,
    setMaskedCellphone,
    userSignUpIsLoading,
  } = useSignUpForm();

  return (
    <>
      {isShowForm && (
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
            errors={formErrors.name}
            errorMessage={formErrors.name?.message}
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
            errors={formErrors.document}
            errorMessage={formErrors.document?.message}
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
            errors={formErrors.email}
            errorMessage={formErrors.email?.message}
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
            errors={formErrors.password}
            errorMessage={formErrors.password?.message}
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
            errors={formErrors.cellphone}
            errorMessage={formErrors.cellphone?.message}
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
      )}
      {userSignUpIsLoading && (
        <div className='my-10'>
          <SwLoader />
        </div>
      )}
      {isShowSuccessCard && (
        <AlertCard
          type='success'
          title='Cadastro Recebido!'
          message={`
            Um e-mail de confirmação foi enviado para 
            ${registerUserEmail}
            . Verifique sua caixa de entrada e confirme seu cadastro!`}
        />
      )}
      {userSignUpErrors && (
        <AlertCard
          type='error'
          title='Erro ao cadastrar usuário'
          message={userSignUpErrors?.message ?? ''}
        />
      )}
      {(isShowForm || isShowSuccessCard) && (
        <Button
          className='w-full text-center mt-2'
          variant={'link'}
          size={'sm'}
          onClick={() => alert('Faça login!')}
        >
          {isShowForm
            ? 'Já possui uma conta? Faça o login!'
            : 'Ir para tela de login!'}
        </Button>
      )}
    </>
  );
}
