import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { BiPlusCircle, BiTag, BiImage, BiDollar, BiCart } from 'react-icons/bi'; // Added specific Bi icons
import { BsBoxSeam, BsBoxes, BsCardText, BsRulers, BsTags, BsToggleOn, BsTruck, BsUpcScan} from 'react-icons/bs';
import API from '../../../services/API';
import { toast } from 'react-toastify';

// Predefined categories
const categories = [
  "Électronique", "Vêtements", "Maison", "Alimentaire", "Boissons", 
  "Beauté", "Sport", "Loisirs", "AutomoBile", "Jardinage", "Produit Laitier"
];

// Measurement units
const units = [
  "kg", "g", "litre", "ml", "pièce", "paquet", "mètre", "cm", "m²", "unité", "bal"
];

function CreateProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await API.get('/suppliers');
        setSuppliers(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des fournisseurs:', error);
        toast.error('Impossible de charger les fournisseurs.');
      }
    };
    fetchSuppliers();
  }, []);

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    sku: '',
    imageFile: null, // Used for file input
    imageUrl: '',    // Will be set after upload
    price: '',
    purchasePrice: '',
    minStockQuantity: '',
    unite: '',
    category: '',
    productStatus: 'ACTIF', // Default to 'ACTIF' for new products
    supplier: ''
  });

  const handleInputChange = (field, value) => {
    setProductData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!productData.name.trim()) {
      newErrors.name = 'Le nom du produit est obligatoire';
    }

    if (!productData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    }

    if (!productData.sku.trim()) {
      newErrors.sku = 'Le SKU est obligatoire';
    }
    
    // Validate imageFile if it's required for new products, or handle optionality
    // For now, assuming image is optional, if no file, imageUrl remains empty or handles existing URL logic.
    
    const price = parseFloat(productData.price);
    if (isNaN(price) || price <= 0) {
      newErrors.price = 'Le prix de vente doit être supérieur à 0';
    }

    const purchasePrice = parseFloat(productData.purchasePrice);
    if (isNaN(purchasePrice) || purchasePrice <= 0) {
      newErrors.purchasePrice = 'Le prix d\'achat doit être supérieur à 0';
    }

    const minStockQuantity = parseInt(productData.minStockQuantity);
    if (isNaN(minStockQuantity) || minStockQuantity < 0) {
      newErrors.minStockQuantity = 'La quantité minimum doit être >= 0';
    }

    if (!productData.category) {
      newErrors.category = 'La catégorie est obligatoire';
    }

    if (!productData.supplier) {
      newErrors.supplier = 'Le fournisseur est obligatoire';
    }
    
    if (!productData.productStatus) {
      newErrors.productStatus = 'Le statut du produit est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }
    setLoading(true);
    try {
      let uploadedImageUrl = '';
      if (productData.imageFile) {
        const formData = new FormData();
        formData.append('file', productData.imageFile);
        const imageRes = await API.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedImageUrl = imageRes.data;
      }
  
      const productDataToSend = {
        ...productData,
        price: parseFloat(productData.price),
        purchasePrice: parseFloat(productData.purchasePrice),
        minStockQuantity: parseInt(productData.minStockQuantity),
        supplier: { id: productData.supplier }, // Convert supplier ID to object
        imageUrl: uploadedImageUrl // Use the uploaded URL or remain empty if no file was selected
      };

      // Remove the local 'imageFile' property before sending to API
      delete productDataToSend.imageFile;
      
      await API.post('/products', productDataToSend);
  
      toast.success('Produit créé avec succès !');
      navigate('/product');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de la création du produit.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/product');
  };

  const calculateGrossMargin = () => {
    const price = parseFloat(productData.price);
    const purchasePrice = parseFloat(productData.purchasePrice);
    if (isNaN(price) || isNaN(purchasePrice) || purchasePrice === 0) return 'N/A';
    return (price - purchasePrice).toFixed(2);
  };

  const calculateMarginPercentage = () => {
    const price = parseFloat(productData.price);
    const purchasePrice = parseFloat(productData.purchasePrice);
    if (isNaN(price) || isNaN(purchasePrice) || purchasePrice === 0) return 'N/A';
    return (((price - purchasePrice) / purchasePrice) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          className="p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 mr-4 transition-colors"
          onClick={handleCancel}
          disabled={loading}
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1 flex items-center">
            <BiPlusCircle className="text-blue-600 mr-3 text-4xl" />
            Créer un nouveau produit
          </h1>
          <p className="text-gray-600 text-lg">Ajoutez un nouveau produit à votre catalogue</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex justify-center">
        <div className="w-full lg:w-3/4 xl:w-2/3">
          <div className="bg-white shadow-lg rounded-lg">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <h3 className="text-xl font-semibold flex items-center">
                <BsBoxSeam className="mr-2 text-2xl" />
                Informations du produit
              </h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="name">
                      <BiTag className="inline-block mr-1 text-lg" />
                      Nom du produit <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                      value={productData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: Smartphone Galaxy S21"
                      required
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="sku">
                      <BsUpcScan className="inline-block mr-1 text-lg" />
                      Code SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="sku"
                      className={`w-full px-4 py-2 border ${errors.sku ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                      value={productData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      placeholder="Ex: SKU001"
                      required
                    />
                    {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="imageFile">
                      <BiImage className="inline-block mr-1 text-lg" />
                      Image (optionnel)
                    </label>
                    <input
                      type="file"
                      id="imageFile"
                      className={`w-full px-4 py-2 border ${errors.imageUrl ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                      onChange={(e) => handleInputChange('imageFile', e.target.files[0])}
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="description">
                      <BsCardText className="inline-block mr-1 text-lg" />
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      className={`w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                      rows="3"
                      value={productData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Description détaillée du produit..."
                      required
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="category">
                      <BsTags className="inline-block mr-1 text-lg" />
                      Catégorie <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      className={`w-full px-4 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white`}
                      value={productData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      required
                    >
                      <option value="">Sélectionner une catégorie...</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                  </div>

                  {/* Unit of Measure */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="unite">
                      <BsRulers className="inline-block mr-1 text-lg" />
                      Unité de mesure
                    </label>
                    <select
                      id="unite"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={productData.unite}
                      onChange={(e) => handleInputChange('unite', e.target.value)}
                    >
                      <option value="">Sélectionner une unité...</option>
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>

                  {/* Selling Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="price">
                      <BiDollar className="inline-block mr-1 text-lg" />
                      Prix de vente (MGA) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        id="price"
                        className={`w-full pl-3 pr-10 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                        value={productData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                        required
                      />
                      <span className="aBiolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">MGA</span>
                    </div>
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                  </div>

                  {/* Purchase Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="purchasePrice">
                      <BiCart className="inline-block mr-1 text-lg" />
                      Prix d'achat (MGA) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        id="purchasePrice"
                        className={`w-full pl-3 pr-10 py-2 border ${errors.purchasePrice ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                        value={productData.purchasePrice}
                        onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                        placeholder="0.00"
                        required
                      />
                      <span className="aBiolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">MGA</span>
                    </div>
                    {errors.purchasePrice && <p className="text-red-500 text-sm mt-1">{errors.purchasePrice}</p>}
                  </div>

                  {/* Minimum Stock Quantity */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="minStockQuantity">
                      <BsBoxes className="inline-block mr-1 text-lg" />
                      Stock minimum <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      id="minStockQuantity"
                      className={`w-full px-4 py-2 border ${errors.minStockQuantity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                      value={productData.minStockQuantity}
                      onChange={(e) => handleInputChange('minStockQuantity', e.target.value)}
                      placeholder="0"
                      required
                    />
                    {errors.minStockQuantity && <p className="text-red-500 text-sm mt-1">{errors.minStockQuantity}</p>}
                  </div>

                  {/* Product Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="productStatus">
                      <BsToggleOn className="inline-block mr-1 text-lg" />
                      Statut du produit <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="productStatus"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={productData.productStatus}
                      onChange={(e) => handleInputChange('productStatus', e.target.value)}
                      required
                    >
                      <option value="">Sélectionner un statut...</option>
                      <option value="ACTIF">Actif</option>
                      <option value="INACTIF">Inactif</option>
                    </select>
                    {errors.productStatus && <p className="text-red-500 text-sm mt-1">{errors.productStatus}</p>}
                  </div>

                  {/* Supplier */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="supplier">
                      <BsTruck className="inline-block mr-1 text-lg" />
                      Fournisseur <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="supplier"
                      className={`w-full px-4 py-2 border ${errors.supplier ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white`}
                      value={productData.supplier}
                      onChange={(e) => handleInputChange('supplier', e.target.value)}
                      required
                    >
                      <option value="">Sélectionner un fournisseur...</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} ({supplier.email})
                        </option>
                      ))}
                    </select>
                    {errors.supplier && <p className="text-red-500 text-sm mt-1">{errors.supplier}</p>}
                  </div>
                </div>

                {/* Margin Calculation */}
                {(productData.price && productData.purchasePrice && parseFloat(productData.purchasePrice) > 0) && (
                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 text-center gap-4">
                      <div>
                        <strong className="text-gray-700 block text-lg mb-1">Marge brute:</strong>
                        <span className="text-green-600 text-2xl font-bold">
                          {calculateGrossMargin()} MGA
                        </span>
                      </div>
                      <div>
                        <strong className="text-gray-700 block text-lg mb-1">Marge en %:</strong>
                        <span className="text-blue-600 text-2xl font-bold">
                          {calculateMarginPercentage()}%
                        </span>
                      </div>
                      <div>
                        <strong className="text-gray-700 block text-lg mb-1">Prix de vente:</strong>
                        <span className="text-green-600 text-2xl font-bold">
                          {parseFloat(productData.price).toFixed(2)} MGA
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-lg font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors flex items-center"
                  onClick={handleCancel}
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
                      Création...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Créer le produit
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateProduct;