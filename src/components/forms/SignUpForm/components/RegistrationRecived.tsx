import { FaCircleCheck } from 'react-icons/fa6';

interface IRegistrationRecived {
  registerUserEmail: string;
}

export function RegistrationRecived({
  registerUserEmail,
}: IRegistrationRecived) {
  return (
    <div className='flex flex-col items-center gap-4 my-4'>
      <FaCircleCheck className='text-swBlue500 animate-float' size={52} />
      <h1 className='text-swBlue500 text-xl font-bold text-center'>
        Cadastro Recebido!
      </h1>
      <p className='text-center'>
        Um e-mail de confirmação foi enviado para{' '}
        <span className='text-swBlue500 font-semibold'>
          {registerUserEmail}
        </span>
        . Verifique sua caixa de entrada e confirme seu cadastro!
      </p>
    </div>
  );
}
