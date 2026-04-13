import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSave, FaTimes, FaCalendarAlt, FaEuroSign, FaBuilding, FaCalculator, FaSpinner } from 'react-icons/fa'; // Added FaSpinner for loading
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Importez votre instance d'API (Axios) directement
import API from '../../../services/API'; // Assurez-vous que ce chemin est correct

function CreateFacture() {
  const navigate = useNavigate();
  const location = useLocation();
  const { supplierId: initialSupplierId } = location.state || {};

  const [formData, setFormData] = useState({
    supplierId: initialSupplierId ? String(initialSupplierId) : '',
    dateEcheance: null,
    items: []
  });
  const [suppliers, setSuppliers] = useState([]);
  const [productsMap, setProductsMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // 1. Chargement initial des fournisseurs
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true); // Start loading for initial data
      try {
        const response = await API.get('/suppliers');
        if (response.status === 200) {
          setSuppliers(response.data);
        } else {
          throw new Error('Failed to fetch suppliers');
        }
      } catch (err) {
        setError("Erreur lors du chargement des fournisseurs.");
        console.error("API Fetch Error (Suppliers):", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // 2. Fonction pour charger les produits d'un fournisseur spécifique
  const fetchProductsForSupplier = useCallback(async (supplierId) => {
    if (!supplierId) {
      setFormData(prev => ({ ...prev, items: [] }));
      setProductsMap(new Map());
      return;
    }
    setError(null);
    setLoading(true); // Start loading for products
    try {
      const response = await API.get(`/products/by-supplier/${supplierId}/list`);
      const fetchedProducts = response.data;
      console.log("Response products for supplier:", fetchedProducts);

      const newProductsMap = new Map(fetchedProducts.map(p => [p.id, p]));
      setProductsMap(newProductsMap);

      const initialItems = fetchedProducts.map(product => ({
        productId: product.id.toString(),
        quantity: '',
        purchasePrice: product.purchasePrice.toString()
      }));
      setFormData(prev => ({ ...prev, items: initialItems }));

    } catch (err) {
      setError("Erreur lors du chargement des produits pour ce fournisseur.");
      console.error("API Fetch Error (Products for Supplier):", err);
      setProductsMap(new Map());
      setFormData(prev => ({ ...prev, items: [] }));
    } finally {
      setLoading(false); // End loading for products
    }
  }, []);

  // 3. Effet pour déclencher le chargement des produits quand le fournisseur change
  useEffect(() => {
    if (formData.supplierId) {
      fetchProductsForSupplier(formData.supplierId);
    } else {
      setFormData(prev => ({ ...prev, items: [] }));
      setProductsMap(new Map());
    }
  }, [formData.supplierId, fetchProductsForSupplier]);

  // 4. Calcul du total général
  const totalAmount = useMemo(() => {
    let currentTotal = 0;
    formData.items.forEach(item => {
      const quantity = parseInt(item.quantity);
      const price = parseFloat(item.purchasePrice); // Changed from purchasePricePerUnit to purchasePrice
      if (!isNaN(quantity) && quantity > 0 && !isNaN(price) && price >= 0) {
        currentTotal += quantity * price;
      }
    });
    return currentTotal;
  }, [formData.items]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitError(null);
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, dateEcheance: date }));
    setSubmitError(null);
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = formData.items.map((item, i) => {
      if (i === index) {
        if (name === "quantity") {
            const parsedValue = parseInt(value);
            return { ...item, [name]: isNaN(parsedValue) ? '' : value };
        } else if (name === "purchasePrice") { // Changed from purchasePricePerUnit to purchasePrice
            const parsedValue = parseFloat(value);
            return { ...item, [name]: isNaN(parsedValue) ? '' : value };
        }
        return { ...item, [name]: value };
      }
      return item;
    });
    setFormData(prev => ({ ...prev, items: newItems }));
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    const itemsToSend = formData.items.filter(item => {
        const quantity = parseInt(item.quantity);
        const purchasePrice = parseFloat(item.purchasePrice); // Changed from purchasePricePerUnit to purchasePrice

        return !isNaN(quantity) && quantity > 0 &&
               !isNaN(purchasePrice) && purchasePrice >= 0;
    }).map(item => ({
        productId: parseInt(item.productId),
        quantity: parseInt(item.quantity),
        purchasePricePerUnit: parseFloat(item.purchasePrice) // Ensure backend receives purchasePricePerUnit
    }));

    const payload = {
      supplierId: parseInt(formData.supplierId),
      dateEcheance: formData.dateEcheance ? formData.dateEcheance.toISOString() : null,
      items: itemsToSend
    };

    if (!payload.supplierId || payload.supplierId === 0) {
      setSubmitError("Veuillez sélectionner un fournisseur.");
      return;
    }
    if (!payload.dateEcheance) {
        setSubmitError("Veuillez sélectionner une date d'échéance.");
        return;
    }
    if (payload.items.length === 0) {
        setSubmitError("Veuillez saisir une quantité positive pour au moins un produit.");
        return;
    }

    try {
      const response = await API.post('/factures/fournisseurs', payload);
      console.log("Facture créée:", response.data);
      setSuccessMessage("Facture créée avec succès !");

      setFormData({
        supplierId: initialSupplierId ? String(initialSupplierId) : '',
        dateEcheance: null,
        items: []
      });

      navigate("/facture")

    } catch (err) {
      console.error("Erreur lors de la création de la facture:", err.response ? err.response.data : err.message);
      setSubmitError(err.response?.data?.message || err.message || "Une erreur est survenue lors de la création de la facture.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-gray-700">
        <FaSpinner className="animate-spin text-5xl text-blue-500 mb-4" />
        <p className="text-xl font-medium">Chargement des données du formulaire...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-red-50 text-red-700 p-4 rounded-lg shadow-md mx-auto max-w-lg text-center">
        <p className="text-2xl font-semibold mb-3">Oups ! Une erreur est survenue.</p>
        <p className="text-lg">{error}</p>
        <button
          onClick={() => navigate('/')} // Or a dedicated error page/retry
          className="mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-8 text-center leading-tight">
        Créer une Nouvelle Facture Fournisseur
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-xl shadow-2xl max-w-5xl mx-auto border border-gray-100">
        {submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-3 rounded-lg relative mb-6 shadow-sm" role="alert">
            <strong className="font-semibold">Erreur :</strong>
            <span className="block sm:inline ml-2"> {submitError}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-5 py-3 rounded-lg relative mb-6 shadow-sm" role="alert">
            <strong className="font-semibold">Succès !</strong>
            <span className="block sm:inline ml-2"> {successMessage}</span>
          </div>
        )}

        {/* Section Informations Générales */}
        <fieldset className="border border-gray-200 p-5 rounded-lg mb-8 bg-white shadow-sm">
          <legend className="text-lg font-semibold text-gray-700 px-3 py-1">Informations Générales</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="supplierId" className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                <FaBuilding className="mr-2 text-blue-600" /> Fournisseur:
              </label>
              <select
                id="supplierId"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition duration-150 ease-in-out"
                required
                disabled={!!initialSupplierId}
              >
                <option value="">Sélectionnez un fournisseur</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="dateEcheance" className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-600" /> Date d'échéance:
              </label>
              <DatePicker
                selected={formData.dateEcheance}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition duration-150 ease-in-out"
                placeholderText="Sélectionnez une date"
                required
              />
            </div>
          </div>
        </fieldset>

        {/* Section Articles de la Facture */}
        <fieldset className="border border-gray-200 p-5 rounded-lg mb-8 bg-white shadow-sm">
          <legend className="text-lg font-semibold text-gray-700 px-3 py-1">Articles de la Facture</legend>
          {!formData.supplierId ? (
              <p className="text-center text-gray-600 py-6 text-lg font-medium bg-gray-50 rounded-md">
                  Veuillez sélectionner un fournisseur pour voir la liste des produits.
              </p>
          ) : productsMap.size === 0 && !loading ? (
              <p className="text-center text-gray-600 py-6 text-lg font-medium bg-gray-50 rounded-md">
                  Aucun produit configuré pour ce fournisseur.
              </p>
          ) : (
            <div className="space-y-4">
              {formData.items.map((item, index) => {
                const product = productsMap.get(parseInt(item.productId));
                if (!product) return null;

                return (
                  <div key={item.productId} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-100 rounded-lg bg-white shadow-sm items-center">
                    {/* Product Name (Display only) */}
                    <div className="col-span-1 md:col-span-1">
                      <label className="block text-gray-600 text-xs font-medium mb-1">Produit:</label>
                      <p className="text-gray-900 font-semibold text-base">{product.name}</p>
                    </div>

                    {/* Purchase Price Per Unit (Pre-filled but editable) */}
                    <div className="col-span-1 md:col-span-1 relative">
                      <label htmlFor={`purchasePrice-${index}`} className="block text-gray-600 text-xs font-medium mb-1">
                        Prix Unitaire (Ar):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        id={`purchasePrice-${index}`}
                        name="purchasePrice"
                        value={item.purchasePrice}
                        onChange={(e) => handleItemChange(index, e)}
                        min="0"
                        className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-800 transition duration-150 ease-in-out text-sm"
                        required
                      />
                      <FaEuroSign className="absolute left-3 top-8 text-gray-400" />
                    </div>

                    {/* Quantity Input */}
                    <div className="col-span-1 md:col-span-1">
                      <label htmlFor={`quantity-${index}`} className="block text-gray-600 text-xs font-medium mb-1">Quantité:</label>
                      <input
                        type="number"
                        id={`quantity-${index}`}
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, e)}
                        min="0"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-800 transition duration-150 ease-in-out text-sm"
                      />
                    </div>

                    {/* Subtotal Display */}
                    <div className="col-span-1 md:col-span-1">
                      <label className="block text-gray-600 text-xs font-medium mb-1">Sous-total:</label>
                      <p className="text-gray-900 font-bold text-base">
                        {(
                          (parseInt(item.quantity) || 0) * (parseFloat(item.purchasePrice) || 0)
                        ).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </fieldset>

        {/* Section Total Général */}
        <div className="flex justify-end items-center mb-6 pr-4">
          <span className="text-2xl font-bold text-gray-800 flex items-center">
            <FaCalculator className="mr-3 text-green-600" /> Total Général:
          </span>
          <span className="text-3xl font-extrabold text-green-700 ml-4">
            {totalAmount.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR'
            })}
          </span>
        </div>

        {/* Boutons d'Action */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={() => navigate('/facture')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors flex items-center shadow-sm"
          >
            <FaTimes className="mr-2" /> Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <FaSave className="mr-2" /> Enregistrer la Facture
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateFacture;