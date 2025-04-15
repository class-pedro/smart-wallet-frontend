import api from '@/api/client/axios';
import { AxiosError } from 'axios';

interface ICreateUser {
  name: string;
  email: string;
  cellphone: string;
  document: string;
  password: string;
}

export const createUser = async (createUserPayload: ICreateUser) => {
  try {
    const { data } = await api.post('/user/create', createUserPayload);

    return data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response) throw axiosError.response.data;
    throw new Error('Erro inesperado ao criar usuário.');
  }
};
