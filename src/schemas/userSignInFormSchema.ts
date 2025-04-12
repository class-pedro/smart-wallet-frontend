import { z } from 'zod';
import { isValidCpf } from '@/utils/isValidCpf';

export const userSignInFormSchema = z.object({
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
      /^(\(\d{2}\)\d{4,5}-\d{4}|\d{10,11})$/,
      'O número de celular deve conter 10 ou 11 dígitos'
    ),
});

export type IUserSignInForm = z.infer<typeof userSignInFormSchema>;
