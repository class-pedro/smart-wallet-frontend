export type User = {
  name?: string;
  email?: string;
  password?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AccessToken = {
  access_token?: string;
};

export type UserSessionToken = {
  name?: string;
  email?: string;
  accessToken?: string;
  expiration?: number;
};
