import API from '../../services/API'

// Récupérer tous les fournisseurs
export const getAllSuppliers = async () => {
  const { data } = await API.get('/suppliers');
  return data;
};

// Récupérer un fournisseur par ID
export const getSupplierById = async (id) => {
  const { data } = await API.get(`/suppliers/${id}`);
  return data;
};

// Créer un fournisseur
export const createSupplier = async (supplier) => {
  const { data } = await API.post('/suppliers', supplier);
  return data;
};

// Mettre à jour un fournisseur
export const updateSupplier = async (id, supplier) => {
  const { data } = await API.put(`/suppliers/${id}`, supplier);
  return data;
};

// Supprimer un fournisseur
export const deleteSupplier = async (id) => {
  const { data } = await API.delete(`/suppliers/${id}`);
  return data;
}; 