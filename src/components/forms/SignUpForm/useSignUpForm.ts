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

  return {
    errors,
    onSubmit,
    register,
    maskedCPF,
    handleSubmit,
    setMaskedCPF,
    maskedCellphone,
    setMaskedCellphone,
  };
}
