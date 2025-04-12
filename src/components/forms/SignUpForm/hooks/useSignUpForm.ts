import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IUserSignInForm,
  userSignInFormSchema,
} from '@/schemas/userSignInFormSchema';

export function useSignUpForm() {
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<IUserSignInForm>({
    resolver: zodResolver(userSignInFormSchema),
  });

  const registerUserEmail = getValues('email');
  const [maskedCPF, setMaskedCPF] = useState<string>('');
  const [maskedCellphone, setMaskedCellphone] = useState<string>('');
  const [isRegistrationRecived, setIsRegistrationRecived] =
    useState<boolean>(false);

  const onSubmit: SubmitHandler<IUserSignInForm> = (
    payload: IUserSignInForm
  ) => {
    console.log('payload: ', payload);
    setIsRegistrationRecived(true);
  };

  return {
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
  };
}
