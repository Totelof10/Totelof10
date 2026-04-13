import API from '../../services/API'

// Récupérer tous les produits
export const getAllProducts = async () => {
  const { data } = await API.get('/products');
  return data;
};

// Récupérer un produit par ID
export const getProductById = async (id) => {
  const { data } = await API.get(`/products/${id}`);
  return data;
};

// Créer un produit
export const createProduct = async (product) => {
  const { data } = await API.post('/products', product);
  return data;
};

// Mettre à jour un produit
export const updateProduct = async (id, product) => {
  const { data } = await API.put(`/products/${id}`, product);
  return data;
};

// Supprimer un produit
export const deleteProduct = async (id) => {
  const { data } = await API.delete(`/products/${id}`);
  return data;
}; 