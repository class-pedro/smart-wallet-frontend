import { useMutation } from '@tanstack/react-query';
import { createUser } from '../user/createUser';

export const useSignUp = () => {
  const { mutateAsync, isPending, error, isError, isSuccess } = useMutation({
    mutationFn: createUser,
  });

  return {
    userSignUpMutate: mutateAsync,
    userSignUpIsLoading: isPending,
    userSignUpErrors: error,
    userSignUpIsError: isError,
    userSignUpIsSuccess: isSuccess,
  };
};
