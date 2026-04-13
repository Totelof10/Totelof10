import API from '../../services/API'

// Récupérer tous les clients
export const getAllCustomers = async () => {
  const { data } = await API.get('/customers');
  return data;
};

// Récupérer un client par ID
export const getCustomerById = async (id) => {
  const { data } = await API.get(`/customers/${id}`);
  return data;
};

// Créer un client
export const createCustomer = async (customer) => {
  const { data } = await API.post('/customers', customer);
  return data;
};

// Mettre à jour un client
export const updateCustomer = async (id, customer) => {
  const { data } = await API.put(`/customers/${id}`, customer);
  return data;
};

// Supprimer un client
export const deleteCustomer = async (id) => {
  const { data } = await API.delete(`/customers/${id}`);
  return data;
}; 