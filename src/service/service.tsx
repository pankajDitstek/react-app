import api from "../interceptor/interceptor";

export const loginUser = async (userData: any) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

export const logOutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');

};
export const fetchUsers = async () => {
  const response = await api.get('auth/profile');
  return response.data;
};

export const getUserList = async () => {
  const response = await api.get('users');
  return response.data
}

export const createUser = async (currentUser: any) => {
  const response = await api.post('users/', currentUser);
  return response.data
}

export const updateUser = async (id: number, currentUser: any) => {
  const response = await api.put('users/' + id, currentUser);
  return response.data
}

export const deleteUser = async (id: number) => {
  const response = await api.delete('users/' + id)
  return response.data
}


// Get All Categories

export const categories = async () => {
  const response = await api.get('categories');
  return response.data
}

export const addcategoies = async (newcategory: any) => {
  const response = await api.post('categories', newcategory);
  return response.data
}

export const updatecategoies = async (id: number, newcategory: any) => {
  const response = await api.put('categories/' + id, newcategory);
  return response.data
}

export const deletecategories = async (id: number) => {
  const response = await api.delete('categories/' + id)
  return response.data
}


//  Get product list

export const getproducts = async () => {
  const response = await api.get('products');
  return response.data
}
//  addProduct, ,  

export const addProduct = async (createprodduct: any) => {
  const response = await api.post('products', createprodduct);
  return response.data
}
export const updateProduct = async (id: number, newproduct: any) => {
  debugger

  const response = await api.put(`categories/${id}`, newproduct);
  return response.data

}
export const deleteProduct = async (id: number) => {
  const response = await api.delete('products/' + id)
  return response.data
}
