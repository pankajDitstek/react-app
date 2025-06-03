export type User = {
  email: string;
  password:string
};
export type Role = {
  role: 'admin' | 'customer';

}
export type Product = {
  id: number;
  name: string;
  price: number;
  categoryId: number;
};

export type Category = {
  id: number;
  name: string;
};