export type User = {
  email: string;
  id: number;
  lastName: string;
  name: string;
  password?: string;
  sharedWithMe: number[];
};