import API from '../../services/API'

// Récupérer le chiffre d'affaires total
export const getTotalRevenue = async () => {
  const { data } = await API.get('/dashboard/total-revenue');
  return data;
};

// Récupérer le nombre total de produits vendus
export const getTotalProductsSold = async () => {
  const { data } = await API.get('/dashboard/total-products-sold');
  return data;
};

// Récupérer le CA et produits vendus entre deux dates
export const getRevenueBetween = async (startDate, endDate) => {
  const { data } = await API.get(`/dashboard/revenue-between?startDate=${startDate}&endDate=${endDate}`);
  return data;
};

// Récupérer le CA et produits vendus par mois pour une année donnée
export const getMonthlyRevenue = async (year) => {
  const { data } = await API.get(`/dashboard/monthly-revenue?year=${year}`);
  return data;
}; 