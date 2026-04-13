import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../../services/API';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa'; // Ensure these are imported if used for icons
import { BiPencil } from 'react-icons/bi'; // Using a specific icon for edit header

// Reusable lists
const categories = [
  "Électronique", "Vêtements", "Maison", "Alimentaire", "Boissons", 
  "Beauté", "Sport", "Loisirs", "Automobile", "Jardinage", "Produit Laitier"
];
const units = [
  "kg", "g", "litre", "ml", "pièce", "paquet", "mètre", "cm", "m²", "unité", "bal"
];
const statusOptions = [
  { value: 'ACTIF', label: 'Actif' },
  { value: 'INACTIF', label: 'Inactif' }
];

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '',
    purchasePrice: '',
    minStockQuantity: '',
    unite: '',
    category: '',
    productStatus: '',
    imageUrl: '', // Existing image URL
    description: '',
    supplier: '' // Supplier ID
  });
  const [errorMessage, setErrorMessage] = useState(''); // Renamed to avoid conflict with `error` (boolean)
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/products/${id}`);
        const p = response.data;
        setForm({
          name: p.name || '',
          sku: p.sku || '',
          price: p.price || '',
          purchasePrice: p.purchasePrice || '',
          minStockQuantity: p.minStockQuantity || '',
          unite: p.unite || '',
          category: p.category || '',
          productStatus: p.productStatus || '',
          imageUrl: p.imageUrl || '',
          description: p.description || '',
          supplier: p.supplier?.id || '' // Ensure supplier ID is correctly extracted
        });
      } catch (err) {
        setErrorMessage("Erreur lors du chargement du produit.");
        toast.error("Erreur lors du chargement du produit.");
      } finally {
        setLoading(false);
      }
    };
    const fetchSuppliers = async () => {
      try {
        const response = await API.get('/suppliers');
        setSuppliers(response.data);
      } catch (err) {
        setSuppliers([]); // Ensure suppliers array is empty on error
        toast.error("Impossible de charger les fournisseurs.");
      }
    };
    fetchProduct();
    fetchSuppliers();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    // Clear the error for this specific field when it changes
    if (fieldErrors[name]) {
      setFieldErrors(fe => ({ ...fe, [name]: '' }));
    }
    // Also clear general error message if it's visible
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Le nom est obligatoire';
    if (!form.sku.trim()) errors.sku = 'Le SKU est obligatoire';
    
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) errors.price = 'Le prix de vente doit être supérieur à 0';
    
    const purchasePrice = parseFloat(form.purchasePrice);
    if (isNaN(purchasePrice) || purchasePrice <= 0) errors.purchasePrice = 'Le prix d\'achat doit être supérieur à 0';
    
    const minStockQuantity = parseInt(form.minStockQuantity, 10);
    if (isNaN(minStockQuantity) || minStockQuantity < 0) errors.minStockQuantity = 'La quantité minimum doit être >= 0';
    
    if (!form.category) errors.category = 'La catégorie est obligatoire';
    if (!form.supplier) errors.supplier = 'Le fournisseur est obligatoire';
    if (!form.productStatus) errors.productStatus = 'Le statut est obligatoire';
    
    // Description is optional, so no validation needed
    // imageUrl is for display, not direct input validation here
    
    return errors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous general error
    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    setLoading(true); // Set loading true for API call
    try {
      await API.put(`/products/${id}`, {
        ...form,
        price: parseFloat(form.price),
        purchasePrice: parseFloat(form.purchasePrice),
        minStockQuantity: parseInt(form.minStockQuantity, 10),
        supplier: { id: Number(form.supplier) } // Ensure supplier ID is sent as an object
      });
      toast.success('Produit modifié avec succès !');
      navigate('/product');
    } catch (err) {
      const apiErrorMessage = err.response?.data?.message || "Une erreur est survenue lors de la modification du produit.";
      setErrorMessage(apiErrorMessage);
      toast.error(apiErrorMessage);
    } finally {
      setLoading(false); // Set loading false after API call
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700">Chargement des données du produit...</p>
        </div>
      </div>
    );
  }

  // General error state (if product couldn't be loaded)
  if (errorMessage && !Object.keys(fieldErrors).length) { // Only show general error if no specific field errors (e.g. initial fetch error)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md max-w-lg text-center">
          <h4 className="text-2xl font-bold mb-2">Erreur de chargement</h4>
          <p className="text-lg mb-4">{errorMessage}</p>
          <button 
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            onClick={() => navigate('/product')}
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          className="p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 mr-4 transition-colors"
          onClick={() => navigate('/product')}
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1 flex items-center">
            <BiPencil className="text-blue-600 mr-3 text-4xl" />
            Modifier le produit
          </h1>
          <p className="text-gray-600 text-lg">Mettre à jour les informations du produit</p>
        </div>
      </div>

      {/* Product Edit Form Card */}
      <div className="flex justify-center">
        <div className="w-full lg:w-3/4 xl:w-2/3">
          <div className="bg-white shadow-lg rounded-lg">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <h3 className="text-xl font-semibold flex items-center">
                <BiPencil className="mr-2 text-2xl" />
                Informations du produit
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="name">Nom <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="name"
                    className={`w-full px-4 py-2 border ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  {fieldErrors.name && <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>}
                </div>
                {/* SKU */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="sku">SKU <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="sku"
                    className={`w-full px-4 py-2 border ${fieldErrors.sku ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    required
                  />
                  {fieldErrors.sku && <p className="text-red-500 text-sm mt-1">{fieldErrors.sku}</p>}
                </div>
                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="price">Prix de vente (MGA) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="number"
                      id="price"
                      className={`w-full pl-3 pr-10 py-2 border ${fieldErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">MGA</span>
                  </div>
                  {fieldErrors.price && <p className="text-red-500 text-sm mt-1">{fieldErrors.price}</p>}
                </div>
                {/* Purchase Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="purchasePrice">Prix d'achat (MGA) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="number"
                      id="purchasePrice"
                      className={`w-full pl-3 pr-10 py-2 border ${fieldErrors.purchasePrice ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                      name="purchasePrice"
                      value={form.purchasePrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">MGA</span>
                  </div>
                  {fieldErrors.purchasePrice && <p className="text-red-500 text-sm mt-1">{fieldErrors.purchasePrice}</p>}
                </div>
                {/* Min Stock Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="minStockQuantity">Stock minimum <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    id="minStockQuantity"
                    className={`w-full px-4 py-2 border ${fieldErrors.minStockQuantity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                    name="minStockQuantity"
                    value={form.minStockQuantity}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                  {fieldErrors.minStockQuantity && <p className="text-red-500 text-sm mt-1">{fieldErrors.minStockQuantity}</p>}
                </div>
                {/* Unit */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="unite">Unité</label>
                  <select
                    id="unite"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                    name="unite"
                    value={form.unite}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner une unité...</option>
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="category">Catégorie <span className="text-red-500">*</span></label>
                  <select
                    id="category"
                    className={`w-full px-4 py-2 border ${fieldErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white`}
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionner une catégorie...</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {fieldErrors.category && <p className="text-red-500 text-sm mt-1">{fieldErrors.category}</p>}
                </div>
                {/* Product Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="productStatus">Statut <span className="text-red-500">*</span></label>
                  <select
                    id="productStatus"
                    className={`w-full px-4 py-2 border ${fieldErrors.productStatus ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white`}
                    name="productStatus"
                    value={form.productStatus}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionner un statut...</option>
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {fieldErrors.productStatus && <p className="text-red-500 text-sm mt-1">{fieldErrors.productStatus}</p>}
                </div>
                {/* Supplier */}
                <div className="md:col-span-2"> {/* Full width on medium screens and up */}
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="supplier">Fournisseur <span className="text-red-500">*</span></label>
                  <select
                    id="supplier"
                    className={`w-full px-4 py-2 border ${fieldErrors.supplier ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white`}
                    name="supplier"
                    value={form.supplier}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionner un fournisseur...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {fieldErrors.supplier && <p className="text-red-500 text-sm mt-1">{fieldErrors.supplier}</p>}
                </div>
                {/* Image URL (disabled as it's typically set by image upload elsewhere) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="imageUrl">Image (URL)</label>
                  <input
                    type="text"
                    id="imageUrl"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="http://..."
                    disabled
                  />
                </div>
                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between space-x-3 rounded-b-lg">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-lg font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors flex items-center"
                  onClick={() => navigate('/product')}
                  disabled={loading}
                >
                  <FaTimes className="mr-2" />
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>

              {/* General error message (if any) */}
              {errorMessage && Object.keys(fieldErrors).length === 0 && ( // Show general error only if no field-specific errors
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm" role="alert">
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProduct;