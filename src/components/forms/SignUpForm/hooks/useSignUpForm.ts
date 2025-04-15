import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IUserSignInForm,
  userSignInFormSchema,
} from '@/schemas/userSignInFormSchema';
import { useSignUp } from '@/api/endpoints/hooks/useSignUp';
import { onlyDigits } from '@/utils/onlyDigits';

export function useSignUpForm() {
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<IUserSignInForm>({
    resolver: zodResolver(userSignInFormSchema),
  });

  const {
    userSignUpMutate,
    userSignUpErrors,
    userSignUpIsError,
    userSignUpIsLoading,
    userSignUpIsSuccess,
  } = useSignUp();

  const isShowForm =
    !userSignUpIsSuccess && !userSignUpIsLoading && !userSignUpIsError;
  const isShowSuccessCard =
    userSignUpIsSuccess && !userSignUpIsLoading && !userSignUpIsError;
  const registerUserEmail = getValues('email');
  const [maskedCPF, setMaskedCPF] = useState<string>('');
  const [maskedCellphone, setMaskedCellphone] = useState<string>('');

  const onSubmit: SubmitHandler<IUserSignInForm> = async (
    payload: IUserSignInForm
  ) => {
    const { document, cellphone } = payload;
    const formattedPayload = {
      ...payload,
      document: onlyDigits(document),
      cellphone: onlyDigits(cellphone),
    };

    const req = await userSignUpMutate(formattedPayload);

    console.log('res', req);
  };

  return {
    onSubmit,
    register,
    maskedCPF,
    formErrors,
    isShowForm,
    handleSubmit,
    setMaskedCPF,
    maskedCellphone,
    userSignUpErrors,
    registerUserEmail,
    isShowSuccessCard,
    setMaskedCellphone,
    userSignUpIsLoading,
  };
}
