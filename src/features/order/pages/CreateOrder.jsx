import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import API from '../../../services/API'; // Ensure this path is correct
import { toast } from 'react-toastify'; // Added toast for better UX than alert

function CreateOrder({ onClose }) {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState([
    { productId: '', quantity: 1 }
  ]);
  const [discountAmount, setDiscountAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await API.get('/customers');
        setCustomers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
        toast.error('Erreur lors de la récupération des clients.');
        setCustomers([]);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get('/products');
        // Assuming products are directly in response.data or response.data.content
        const productsData = Array.isArray(response.data.content) ? response.data.content : (Array.isArray(response.data) ? response.data : []);
        setProducts(productsData);
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        toast.error('Erreur lors de la récupération des produits.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleItemChange = (idx, field, value) => {
    setOrderItems(items =>
      items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    );
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = idx => {
    setOrderItems(items => items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Validation
    if (!customerId) {
      toast.error('Veuillez sélectionner un client.');
      return;
    }

    const validItems = orderItems.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Veuillez ajouter au moins un article à la commande.');
      return;
    }

    // Prepare payload
    const orderPayload = {
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      customer: {
        id: Number(customerId)
      },
      orderItems: validItems.map(item => ({
        product: {
          id: Number(item.productId)
        },
        quantity: Number(item.quantity)
      })),
      discountAmount: Number(discountAmount) || 0
    };

    try {
      const response = await API.post('/orders', orderPayload);

      if (response.data) {
        toast.success(`Commande ${response.data.orderNumber || 'créée'} avec succès !`);

        if (onClose) {
          onClose();
        } else {
          navigate('/orders');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      toast.error(error?.response?.data?.message || 'Erreur lors de la création de la commande. Vérifiez les données saisies.');
    }
  };

  const total = orderItems.reduce((sum, item) => {
    const product = (products || []).find(p => p.id === Number(item.productId));
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const totalWithDiscount = total - (Number(discountAmount) || 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white shadow-lg border border-gray-200 rounded-xl p-4 md:p-8 lg:p-10"> {/* Reduced mobile padding slightly */}
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center mb-6 md:mb-8"> {/* Adjusted margin-bottom */}
            <button
              onClick={onClose || (() => navigate('/orders'))}
              className="flex items-center justify-center p-2 md:p-3 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors mb-4 md:mb-0 w-10 h-10 md:w-12 md:h-12 flex-shrink-0" /* Smaller button on mobile */
              aria-label="Retour"
            >
              <FaArrowLeft size={18} md:size={20} /> {/* Smaller icon on mobile */}
            </button>
            <h1 className="text-xl md:text-3xl font-extrabold text-gray-800 text-center md:text-left flex-grow ml-0 md:ml-4"> {/* Adjusted text size and margin for mobile */}
              Créer une nouvelle commande
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Customer Selection */}
            <div className="mb-5 md:mb-6"> {/* Adjusted margin-bottom */}
              <label htmlFor="customer-select" className="block text-gray-700 text-base md:text-lg font-semibold mb-2 md:mb-3">Client :</label> {/* Adjusted text size and margin */}
              <select
                id="customer-select"
                className="block w-full py-2.5 px-3 md:py-3 md:px-4 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm md:text-base" /* Adjusted padding and text size */
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                required
              >
                <option value="">Sélectionner un client</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="mb-5 md:mb-6"> {/* Adjusted margin-bottom */}
              <label htmlFor="due-date" className="block text-gray-700 text-base md:text-lg font-semibold mb-2 md:mb-3">Date d'échéance :</label> {/* Adjusted text size and margin */}
              <input
                type="datetime-local"
                id="due-date"
                className="block w-full py-2.5 px-3 md:py-3 md:px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm md:text-base" /* Adjusted padding and text size */
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)} // Sets min to current datetime
                placeholder="Sélectionner une date d'échéance"
              />
              <p className="mt-1.5 text-xs md:mt-2 md:text-sm text-gray-500"> {/* Adjusted text size and margin */}
                Si aucune date n'est sélectionnée, l'échéance sera fixée à 14 jours à partir d'aujourd'hui.
              </p>
            </div>

            {/* Order Items */}
            <div className="mb-6 md:mb-8"> {/* Adjusted margin-bottom */}
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4"> {/* Adjusted text size and margin */}
                Articles
                {loading ? ' (Chargement...)' : ` (${products.length} produits disponibles)`}
              </h3>
              <div className="border border-gray-200 rounded-lg p-2 md:p-5 max-h-80 md:max-h-96 overflow-y-auto shadow-sm"> {/* Reduced mobile padding, adjusted max-height */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-2 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th> {/* Adjusted padding */}
                        <th scope="col" className="px-2 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qté</th> {/* Shortened for mobile */}
                        <th scope="col" className="px-2 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th> {/* Shortened for mobile */}
                        <th scope="col" className="px-2 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th> {/* Shortened for mobile */}
                        <th scope="col" className="px-2 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> {/* Adjusted padding */}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orderItems.map((item, idx) => {
                        const product = (products || []).find(p => p.id === Number(item.productId));
                        const unitPrice = product ? product.price : 0;
                        const subtotal = unitPrice * item.quantity;
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="py-1.5 px-2 md:py-2 md:px-4 whitespace-nowrap"> {/* Adjusted padding */}
                              <select
                                className="block w-full text-xs md:text-sm py-1 px-1.5 md:py-1.5 md:px-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /* Adjusted padding and text size */
                                value={item.productId}
                                onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                                required
                                disabled={loading}
                              >
                                <option value="">
                                  {loading ? 'Chargement...' : 'Sélectionner...'} {/* Shortened for mobile */}
                                </option>
                                {(products || []).map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-1.5 px-2 md:py-2 md:px-4 whitespace-nowrap"> {/* Adjusted padding */}
                              <input
                                type="number"
                                className="block w-full text-xs md:text-sm py-1 px-1.5 md:py-1.5 md:px-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" /* Adjusted padding and text size */
                                min="1"
                                value={item.quantity}
                                onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                                required
                              />
                            </td>
                            <td className="py-1.5 px-2 md:py-2 md:px-4 whitespace-nowrap text-center text-xs md:text-sm font-semibold text-gray-700"> {/* Adjusted padding and text size */}
                              {unitPrice ? unitPrice.toFixed(2) + ' MGA' : '-'}
                            </td>
                            <td className="py-1.5 px-2 md:py-2 md:px-4 whitespace-nowrap text-center text-xs md:text-sm font-bold text-blue-600"> {/* Adjusted padding and text size */}
                              {unitPrice ? (subtotal).toFixed(2) + ' MGA' : '-'}
                            </td>
                            <td className="py-1.5 px-2 md:py-2 md:px-4 whitespace-nowrap text-center"> {/* Adjusted padding */}
                              {orderItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-red-600 hover:text-red-800 text-xs md:font-medium py-1 px-1.5 md:py-1 md:px-2 rounded-md transition-colors" /* Adjusted padding and text size */
                                  aria-label="Supprimer l'article"
                                >
                                  Suppr. {/* Shortened for mobile */}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="mt-3 md:mt-4 inline-flex items-center px-4 py-2 md:px-6 md:py-3 border border-transparent text-sm md:text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors" /* Adjusted padding and text size */
              >
                + Ajouter un article
              </button>
            </div>

            {/* Discount Amount */}
            <div className="mb-5 md:mb-6"> {/* Adjusted margin-bottom */}
              <label htmlFor="discount-amount" className="block text-gray-700 text-base md:text-lg font-semibold mb-2 md:mb-3">Remise (MGA) :</label> {/* Adjusted text size and margin */}
              <input
                type="number"
                id="discount-amount"
                className="block w-full py-2.5 px-3 md:py-3 md:px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm md:text-base" /* Adjusted padding and text size */
                min="0"
                step="0.01"
                value={discountAmount}
                onChange={e => setDiscountAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Order Summary */}
            <div className="mb-6 md:mb-8 p-4 md:p-5 bg-blue-50 rounded-lg border border-blue-200 shadow-sm text-blue-900"> {/* Adjusted padding */}
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Récapitulatif de la commande</h3> {/* Adjusted text size and margin */}
              <div className="space-y-2 md:space-y-3"> {/* Adjusted spacing */}
                <div className="flex justify-between items-center text-base md:text-lg"> {/* Adjusted text size */}
                  <span className="font-medium text-gray-700">Total :</span>
                  <strong className="font-bold text-gray-900">{total.toFixed(2)} MGA</strong>
                </div>
                <div className="flex justify-between items-center text-base md:text-lg"> {/* Adjusted text size */}
                  <span className="font-medium text-gray-700">Remise :</span>
                  <strong className="font-bold text-red-600">- {(Number(discountAmount) || 0).toFixed(2)} MGA</strong>
                </div>
                <div className="border-t border-gray-300 pt-2.5 md:pt-3 flex justify-between items-center text-lg md:text-xl font-bold"> {/* Adjusted padding and text size */}
                  <span className="text-gray-800">Total à payer :</span>
                  <strong className="text-blue-600">
                    {totalWithDiscount > 0 ? totalWithDiscount.toFixed(2) : '0.00'} MGA
                  </strong>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 md:px-10 md:py-4 text-lg md:text-xl font-semibold rounded-lg shadow-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors" /* Adjusted padding and text size */
              >
                Créer la commande
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateOrder;                                    