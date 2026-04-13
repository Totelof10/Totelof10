import API from '../../services/API'

// ==================== ORDER API ====================

// Récupérer toutes les commandes (paginé)
export const getAllOrders = async (page = 0, size = 10, sort = 'orderDate,desc') => {
  const { data } = await API.get(`/orders?page=${page}&size=${size}&sort=${sort}`);
  return data;
};

// Récupérer une commande par ID
export const getOrderById = async (id) => {
  const { data } = await API.get(`/orders/${id}`);
  return data;
};

// Créer une commande
export const createOrder = async (order) => {
  const { data } = await API.post('/orders', order);
  return data;
};

// Supprimer une commande
export const deleteOrder = async (id) => {
  const { data } = await API.delete(`/orders/${id}`);
  return data;
};

// Mettre à jour le statut d'une commande
export const updateOrderStatus = async (id, status) => {
  const { data } = await API.put(`/orders/${id}/status?newStatus=${status}`);
  return data;
};

// Récupérer le montant net payé d'une commande
export const getOrderNetPaidAmount = async (orderId) => {
  const { data } = await API.get(`/orders/${orderId}/net-paid-amount`);
  return data;
};

// Enregistrer un paiement en espèces
export const registerCashPayment = async (orderId, amount) => {
  const { data } = await API.post(`/orders/${orderId}/pay-cash`, { amount });
  return data;
};

// Traiter les retours d'une commande
export const processOrderReturns = async (orderId, returnedItems) => {
  const { data } = await API.post(`/orders/${orderId}/process-returns`, returnedItems);
  return data;
};

// Récupérer les transactions d'une commande
export const getOrderTransactions = async (orderId) => {
  const { data } = await API.get(`/orders/${orderId}/transactions`);
  return data;
};

// Récupérer les commandes entre deux dates (paginé)
export const getOrdersBetweenDates = async (startDate, endDate, page = 0, size = 10) => {
  const { data } = await API.get(`/orders/by-date?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`);
  return data;
};

// Récupérer les commandes en retard
export const getOverdueOrders = async () => {
  const { data } = await API.get('/orders/overdue');
  return data;
};

// ==================== TRANSACTION API ====================

// Récupérer le total des remboursements pour une commande
export const getRefundTotal = async (orderId) => {
  const { data } = await API.get(`/transaction/refund-total/${orderId}`);
  return data;
};

// ==================== STOCK API ====================

// Récupérer tous les stocks
export const getAllStocks = async () => {
  const { data } = await API.get('/stock');
  return data;
};

// Récupérer un stock par ID
export const getStockById = async (id) => {
  const { data } = await API.get(`/stock/${id}`);
  return data;
};

// Récupérer le stock d'un produit spécifique
export const getStockByProductId = async (productId) => {
  const { data } = await API.get(`/stock/product/${productId}`);
  return data;
};

// Créer ou mettre à jour un stock
export const createOrUpdateStock = async (stock) => {
  const { data } = await API.post('/stock', stock);
  return data;
};

// Mettre à jour la quantité de stock
export const updateStockQuantity = async (productId, quantityChange) => {
  const { data } = await API.post(`/stock/update-quantity/${productId}?quantityChange=${quantityChange}`);
  return data;
};

// Ajouter du stock à un produit (avec raison obligatoire)
export const addStock = async (productId, quantity, reason) => {
  const { data } = await API.put(`/stock/${productId}/add?quantity=${quantity}&reason=${encodeURIComponent(reason)}`);
  return data;
};

// Retirer du stock d'un produit
export const removeStock = async (productId, quantity, reason) => {
  const { data } = await API.put(`/stock/${productId}/remove?quantity=${quantity}&reason=${encodeURIComponent(reason)}`);
  return data;
};

// Déplacer du stock vers endommagé
export const moveToDamaged = async (productId, quantity, reason) => {
  const { data } = await API.post(`/stock/${productId}/move-to-damaged?quantity=${quantity}&reason=${encodeURIComponent(reason)}`);
  return data;
};

// Retirer du stock endommagé
export const removeDamagedStock = async (productId, quantity, reason) => {
  const { data } = await API.post(`/stock/${productId}/remove-damaged?quantity=${quantity}&reason=${encodeURIComponent(reason)}`);
  return data;
};

// Retour fournisseur
export const retourFournisseur = async (productId, quantity) => {
  const { data } = await API.put(`/stock/${productId}/retour-fournisseur?quantity=${quantity}`);
  return data;
};

// Supprimer un enregistrement de stock
export const deleteStock = async (id) => {
  const { data } = await API.delete(`/stock/${id}`);
  return data;
}; 