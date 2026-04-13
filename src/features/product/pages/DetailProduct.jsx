import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaBoxes, FaPlus, FaMinus } from 'react-icons/fa';
import { BsInfoCircle, BsTruck, BsEnvelope, BsPhone } from 'react-icons/bs';
import { BiDollar, BiTime } from 'react-icons/bi';
import API from '../../../services/API';
import { toast } from 'react-toastify';
import Modal from 'react-modal'; // Ensure react-modal is installed: npm install react-modal
import { API_URL } from '../../../services/API';

// Set app element for react-modal, important for accessibility
Modal.setAppElement('#root'); // Assuming your root div has id="root" in index.html

function DetailProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [stock, setStock] = useState({
    currentQuantity: 0,
    reservedQuantity: 0,
    damagedQuantity: 0,
    // availableQuantity will be calculated, not stored directly
    product: null
  });
  const [mouvements, setMouvements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);
  const [error, setError] = useState(null); // Added error state for initial fetch

  // State for stock operations form
  const [stockOperation, setStockOperation] = useState({
    type: 'add', // 'add', 'remove', 'return-damage', 'remove-damaged'
    quantity: '',
    reason: ''
  });

  // States for stock movement filters
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('');

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // --- Data Fetching Logic ---
  // Combine all fetches into a single effect or separate them logically
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productRes, stockRes, movementsRes] = await Promise.all([
          API.get(`/products/${id}`),
          API.get(`/stock/${id}`), // Ensure this endpoint exists and returns the expected stock structure
          API.get(`/stock-movements/product/${id}`)
        ]);

        setProduct(productRes.data);

        const fetchedStock = stockRes.data || { currentQuantity: 0, reservedQuantity: 0, damagedQuantity: 0, product: null };
        setStock(fetchedStock);

        setMouvements(movementsRes.data);

      } catch (err) {
        console.error('Error fetching product, stock or movements:', err);
        setError('Erreur lors du chargement des informations du produit.');
        toast.error('Erreur lors du chargement des détails du produit.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]); // Re-run when product ID changes

  // --- Handlers ---
  const handleEdit = () => {
    navigate(`/product/${id}/edit`);
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true); // Open the delete confirmation modal
  };

  const confirmDeleteProduct = async () => {
    try {
      await API.delete(`/products/${id}`);
      setIsDeleteModalOpen(false)
      toast.success('Produit supprimé avec succès.', {
        onClose: () => navigate('/product'), // Redirect to product list after deletion
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error(`Erreur lors de la suppression du produit: ${err.message || err.response?.data?.message || err}.`);
    } finally {
      setIsDeleteModalOpen(false); // Close modal regardless of success or failure
    }
  };

  const handleStockOperation = async (e) => {
    e.preventDefault();
    const quantity = parseInt(stockOperation.quantity, 10);
    const reason = stockOperation.reason;
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Veuillez entrer une quantité valide (nombre entier positif).');
      return;
    }
    setStockLoading(true);

    let endpoint = '';
    let successMessage = '';
    let errorMessage = '';
    let payload = {
      productId: id,
      quantity: quantity,
      reason: reason,
      // type will be set based on operation, for the backend to record movement type
    };

    try {
      const availableCurrentStock = (stock.currentQuantity || 0) - (stock.reservedQuantity || 0);

      switch (stockOperation.type) {
        case 'add':
          endpoint = `/stock/${id}/add?quantity=${quantity}&reason=${reason}`; // Assuming endpoint for adding stock
          successMessage = 'Stock ajouté avec succès.';
          errorMessage = 'Erreur lors de l\'ajout du stock.';
          payload.type = 'AJOUT';
          await API.put(endpoint, payload); // Using POST as it's generally better for state changes

          break;
        case 'remove':
          if (quantity > availableCurrentStock) {
            toast.error(`Impossible de retirer ${quantity} unités. Seulement ${availableCurrentStock} disponibles (hors réservé/endommagé).`);
            setStockLoading(false);
            return;
          }
          endpoint = `/stock/${id}/remove?quantity=${quantity}&reason=${reason}`; // Assuming endpoint for removing stock
          successMessage = 'Stock retiré avec succès.';
          errorMessage = 'Erreur lors du retrait du stock.';
          payload.type = 'RETRAIT';
          await API.put(endpoint, payload); // Using POST as it's generally better for state changes
          break;
        case 'return-damage':
          if (quantity > availableCurrentStock) {
            toast.error(`Impossible d'isoler ${quantity} unités. Seulement ${availableCurrentStock} disponibles pour être marquées comme endommagées.`);
            setStockLoading(false);
            return;
          }
          endpoint = `/stock/${id}/move-to-damaged?quantity=${quantity}&reason=${reason}`; // Assuming endpoint for moving to damaged
          successMessage = `${quantity} produit${quantity > 1 ? 's' : ''} isolé${quantity > 1 ? 's' : ''} comme endommagé${quantity > 1 ? 's' : ''} avec succès.`;
          errorMessage = 'Erreur lors de l\'isolation du produit endommagé.';
          payload.type = 'ENDOMMAGE';
          await API.post(endpoint, payload); // Using POST as it's generally better for state changes
          break;
        case 'remove-damaged':
          if (quantity > (stock.damagedQuantity || 0)) {
            toast.error(`Impossible de supprimer ${quantity} unités. Seulement ${stock.damagedQuantity || 0} endommagées.`);
            setStockLoading(false);
            return;
          }
          if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${quantity} produit${quantity > 1 ? 's' : ''} endommagé${quantity > 1 ? 's' : ''} ? Cette action est irréversible.`)) {
            setStockLoading(false);
            return;
          }
          endpoint = `/stock/${id}/remove-damaged?quantity=${quantity}&reason=${reason}`; // Assuming endpoint for removing damaged stock
          successMessage = `${quantity} produit${quantity > 1 ? 's' : ''} endommagé${quantity > 1 ? 's' : ''} supprimé${quantity > 1 ? 's' : ''} avec succès.`;
          errorMessage = 'Erreur lors de la suppression des produits endommagés.';
          payload.type = 'SUPPRESSION_ENDOMMAGE'; // Or whatever type your backend uses
          await API.put(endpoint, payload); // Using POST as it's generally better for state changes
          break;
        default:
          toast.error('Type d\'opération de stock non valide.');
          setStockLoading(false);
          return;
      }
      toast.success(successMessage);

      // Re-fetch all data to ensure UI is up-to-date
      const [updatedStockRes, updatedMovementsRes] = await Promise.all([
        API.get(`/stock/${id}`),
        API.get(`/stock-movements/product/${id}`)
      ]);
      setStock(updatedStockRes.data || { currentQuantity: 0, reservedQuantity: 0, damagedQuantity: 0, product: null });
      setMouvements(updatedMovementsRes.data);

      setStockOperation(prev => ({ ...prev, quantity: '', reason: '' })); // Clear form
    } catch (err) {
      console.error('Error performing stock operation:', err);
      toast.error(errorMessage || `Une erreur inattendue est survenue: ${err.response?.data?.message || err.message}`);
    } finally {
      setStockLoading(false);
    }
  };

  // --- Computed Values ---
  const getStockStatus = () => {
    if (!stock || !product) return { status: 'Inconnu', color: 'gray-500', bgColor: 'bg-gray-200' };

    const availableQuantity = Number(stock.currentQuantity) - Number(stock.reservedQuantity) - Number(stock.damagedQuantity);

    if (availableQuantity === 0) return { status: 'Rupture', color: 'red-600', bgColor: 'bg-red-100' };
    if (availableQuantity <= product.minStockQuantity) return { status: 'Faible', color: 'orange-600', bgColor: 'bg-orange-100' };
    return { status: 'Normal', color: 'green-600', bgColor: 'bg-green-100' };
  };

  const stockStatusDisplay = getStockStatus();

  // --- Filtered Movements for Table ---
  const filteredMouvements = mouvements.filter(mvt => {
    const searchMatch =
      !filterSearch ||
      (mvt.reason && mvt.reason.toLowerCase().includes(filterSearch.toLowerCase())) ||
      (mvt.type && mvt.type.toLowerCase().includes(filterSearch.toLowerCase()));

    const movementDateFormatted = mvt.movementDate ? new Date(mvt.movementDate).toISOString().split('T')[0] : '';
    const dateMatch = !filterDate || (movementDateFormatted === filterDate);

    const typeMatch = !filterType || (mvt.type && mvt.type === filterType);

    return searchMatch && dateMatch && typeMatch;
  });

  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md max-w-lg text-center">
          <h4 className="text-2xl font-bold mb-2">Erreur de chargement</h4>
          <p className="text-lg mb-4">{error || "Le produit n'a pas pu être chargé ou n'existe pas."}</p>
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <button
            className="p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 mr-4 transition-colors"
            onClick={() => navigate('/product')}
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1 flex items-center">
              <span className="text-blue-600 mr-3 text-4xl"><BsInfoCircle /></span>
              Détails du produit
            </h1>
            <p className="text-gray-600 text-lg">Informations complètes et gestion du stock</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            className="px-5 py-2 border border-blue-500 text-blue-600 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors flex items-center"
            onClick={handleEdit}
          >
            <FaEdit className="mr-2" />
            Modifier
          </button>
          <button
            className="px-5 py-2 border border-red-500 text-red-600 rounded-lg text-lg font-medium hover:bg-red-50 transition-colors flex items-center"
            onClick={handleDelete}
          >
            <FaTrash className="mr-2" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Information */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-lg rounded-lg mb-6">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <h3 className="text-xl font-semibold flex items-center">
                <BsInfoCircle className="mr-2 text-2xl" />
                Informations générales
              </h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-start">
                {/* Product Image */}
                <div className="md:w-1/3 mb-4 md:mb-0 md:mr-6">
                  <img
                    src={`${API_URL}${product.imageUrl}`}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                </div>

                {/* Product Details */}
                <div className="md:w-2/3">
                  <h2 className="text-3xl font-bold text-blue-700 mb-3">{product.name}</h2>
                  <p className="text-gray-700 text-lg mb-4">{product.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">SKU</label>
                      <p className="text-gray-900 font-bold text-lg">{product.sku}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Catégorie</label>
                      <span className="px-3 py-1 bg-gray-200 text-gray-800 text-sm font-medium rounded-full">{product.category}</span>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Statut</label>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.productStatus === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                        {product.productStatus}
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-500 mb-1">Unité</label>
                      <p className="text-gray-900 font-bold text-lg">{product.unite || 'Non spécifiée'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price and Supplier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="bg-white shadow-lg rounded-lg">
                <div className="bg-green-600 text-white p-4 rounded-t-lg">
                  <h3 className="text-xl font-semibold flex items-center">
                    <BiDollar className="mr-2 text-2xl" />
                    Informations de prix
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Prix de vente</label>
                    <p className="text-green-600 text-2xl font-bold">{product.price.toFixed(2)} MGA</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Prix d'achat</label>
                    <p className="text-blue-600 text-2xl font-bold">{product.purchasePrice.toFixed(2)} MGA</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Marge brute</label>
                    <p className="text-orange-600 text-2xl font-bold">
                      {(product.price - product.purchasePrice).toFixed(2)} MGA
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">Marge %</label>
                    <p className="text-blue-600 text-2xl font-bold">
                      {((product.price - product.purchasePrice) / product.purchasePrice * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white shadow-lg rounded-lg">
                <div className="bg-purple-600 text-white p-4 rounded-t-lg">
                  <h3 className="text-xl font-semibold flex items-center">
                    <BsTruck className="mr-2 text-2xl" />
                    Fournisseur
                  </h3>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-purple-700 mb-3">{product.supplier?.name || 'Aucun fournisseur'}</h4>
                  <p className="text-gray-700 mb-2 flex items-center">
                    <BsEnvelope className="mr-2 text-xl" />
                    {product.supplier?.email || 'Aucun email'}
                  </p>
                  {product.supplier?.phone && (
                    <p className="text-gray-700 flex items-center">
                      <BsPhone className="mr-2 text-xl" />
                      {product.supplier?.phone || 'Aucun numéro de téléphone'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Management */}
        <div>
          <div className="bg-white shadow-lg rounded-lg mb-6">
            <div className="bg-yellow-500 text-gray-900 p-4 rounded-t-lg">
              <h3 className="text-xl font-semibold flex items-center">
                <FaBoxes className="mr-2 text-2xl" />
                Gestion du stock
              </h3>
            </div>
            <div className="p-6">
              {/* Stock Status */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-semibold text-gray-800">État actuel</h4>
                  <span className={`px-4 py-2 rounded-full text-lg font-bold ${stockStatusDisplay.bgColor} text-${stockStatusDisplay.color}`}>
                    {stockStatusDisplay.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-blue-600 font-bold text-3xl">{(stock.currentQuantity || 0) + (stock.reservedQuantity || 0) + (stock.damagedQuantity || 0)}</div>
                    <small className="text-gray-600">Total</small>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-green-600 font-bold text-3xl">
                      {(stock.currentQuantity || 0)}
                    </div>
                    <small className="text-gray-600">Disponible</small>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-orange-600 font-bold text-3xl">{stock.reservedQuantity || 0}</div>
                    <small className="text-gray-600">Réservé</small>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="text-red-600 font-bold text-3xl">{stock.damagedQuantity || 0}</div>
                    <small className="text-gray-600">Endommagé</small>
                  </div>
                </div>
                {stock?.product?.name && (
                  <div className="mt-4 text-center text-gray-700">
                    <span className="font-bold">Produit en stock : </span>{stock.product.name}
                  </div>
                )}
              </div>

              {/* Stock Operations */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4">Opérations de stock</h4>
                <form onSubmit={handleStockOperation}>
                  <div className="mb-4">
                    <label className="block text-base font-semibold text-gray-700 mb-2">Type d'opération</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="radio"
                          className="hidden peer"
                          name="operationType"
                          id="addStock"
                          checked={stockOperation.type === 'add'}
                          onChange={() => setStockOperation(prev => ({ ...prev, type: 'add' }))}
                        />
                        <label
                          htmlFor="addStock"
                          className="flex items-center justify-center w-full px-4 py-2 border border-green-500 text-green-600 rounded-md text-sm font-medium cursor-pointer hover:bg-green-50 peer-checked:bg-green-100 peer-checked:border-green-700 peer-checked:text-green-800 transition-colors"
                        >
                          <FaPlus className="mr-2" />
                          Ajouter
                        </label>
                      </div>

                      <div>
                        <input
                          type="radio"
                          className="hidden peer"
                          name="operationType"
                          id="removeStock"
                          checked={stockOperation.type === 'remove'}
                          onChange={() => setStockOperation(prev => ({ ...prev, type: 'remove' }))}
                        />
                        <label
                          htmlFor="removeStock"
                          className="flex items-center justify-center w-full px-4 py-2 border border-red-500 text-red-600 rounded-md text-sm font-medium cursor-pointer hover:bg-red-50 peer-checked:bg-red-100 peer-checked:border-red-700 peer-checked:text-red-800 transition-colors"
                        >
                          <FaMinus className="mr-2" />
                          Retirer
                        </label>
                      </div>

                      <div>
                        <input
                          type="radio"
                          className="hidden peer"
                          name="operationType"
                          id="returnDamage"
                          checked={stockOperation.type === 'return-damage'}
                          onChange={() => setStockOperation(prev => ({ ...prev, type: 'return-damage' }))}
                        />
                        <label
                          htmlFor="returnDamage"
                          className="flex items-center justify-center w-full px-4 py-2 border border-orange-500 text-orange-600 rounded-md text-sm font-medium cursor-pointer hover:bg-orange-50 peer-checked:bg-orange-100 peer-checked:border-orange-700 peer-checked:text-orange-800 transition-colors"
                        >
                          <FaMinus className="mr-2" />
                          Isoler endommagé
                        </label>
                      </div>

                      <div>
                        <input
                          type="radio"
                          className="hidden peer"
                          name="operationType"
                          id="removeDamaged"
                          checked={stockOperation.type === 'remove-damaged'}
                          onChange={() => setStockOperation(prev => ({ ...prev, type: 'remove-damaged' }))}
                        />
                        <label
                          htmlFor="removeDamaged"
                          className="flex items-center justify-center w-full px-4 py-2 border border-red-500 text-red-600 rounded-md text-sm font-medium cursor-pointer hover:bg-red-50 peer-checked:bg-red-100 peer-checked:border-red-700 peer-checked:text-red-800 transition-colors"
                        >
                          <FaTrash className="mr-2" />
                          Supprimer endommagé
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-base font-semibold text-gray-700 mb-2">Quantité</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={stockOperation.quantity}
                      onChange={(e) => setStockOperation(prev => ({ ...prev, quantity: e.target.value }))}
                      min="1"
                      placeholder="Nombre d'unités"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-base font-semibold text-gray-700 mb-2">Raison (optionnel)</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      rows="3"
                      value={stockOperation.reason}
                      onChange={(e) => setStockOperation(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Ex: Livraison fournisseur, Vente, Inventaire..."
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full px-4 py-3 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center
                      ${stockOperation.type === 'add' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : stockOperation.type === 'remove' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : stockOperation.type === 'return-damage' ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500' // Default for remove-damaged
                    }`}
                    disabled={stockLoading}
                  >
                    {stockLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Traitement...
                      </>
                    ) : (
                      stockOperation.type === 'add' ? 'Ajouter le stock'
                      : stockOperation.type === 'remove' ? 'Retirer le stock'
                      : stockOperation.type === 'return-damage' ? 'Isoler comme endommagé'
                      : 'Supprimer endommagé'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Movement History with Dynamic Filters */}
      <div className="bg-white shadow-lg rounded-lg mt-6">
        <div className="bg-gray-700 text-white p-4 rounded-t-lg">
          <h3 className="text-xl font-semibold flex items-center">
            <BiTime className="mr-2 text-2xl" />
            Derniers mouvements de stock
          </h3>
        </div>
        <div className="p-6">
          {/* Dynamic Filters */}
          <div className="mb-6 pb-4 border-b border-gray-200 bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="filterSearch">Recherche</label>
                <input
                  id="filterSearch"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Raison ou type..."
                  value={filterSearch || ''}
                  onChange={e => setFilterSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="filterDate">Date</label>
                <input
                  id="filterDate"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filterDate || ''}
                  onChange={e => setFilterDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="filterType">Type</label>
                <select
                  id="filterType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                  value={filterType || ''}
                  onChange={e => setFilterType(e.target.value)}
                >
                  <option value="">Tous les types</option>
                  <option value="AJOUT">Ajout</option>
                  <option value="RETRAIT">Retrait</option>
                  <option value="ENDOMMAGE">Endommagé</option>
                  <option value="RETOUR_FOURNISSEUR">Retour fournisseur</option>
                  {/* Add other types as needed */}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors text-sm font-medium"
                  onClick={() => {
                    setFilterSearch('');
                    setFilterDate('');
                    setFilterType('');
                  }}
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg shadow-inner">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[110px]">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Quantité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raison</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMouvements.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500 py-6 text-lg">
                      Aucun mouvement enregistré
                    </td>
                  </tr>
                ) : (
                  filteredMouvements.map(mvt => (
                    <tr key={mvt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(mvt.movementDate).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold
                          ${mvt.type === 'AJOUT' ? 'bg-green-100 text-green-800' :
                            mvt.type === 'RETRAIT' ? 'bg-red-100 text-red-800' :
                            mvt.type === 'ENDOMMAGE' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}
                          `}>
                          {mvt.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold
                        ${mvt.type === 'ENDOMMAGE' ? 'text-orange-600' : mvt.quantity > 0 ? 'text-green-600' : 'text-red-600'}
                      `}>
                        {mvt.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {mvt.reason || <span className="text-gray-400">-</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        contentLabel="Confirmer la suppression"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000 // Ensure modal is on top
          },
          content: {
            position: 'static', // Override default positioning
            padding: '2rem',
            borderRadius: '0.75rem', // Tailwind 'rounded-lg'
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Tailwind 'shadow-xl' approximation
            border: 'none',
            background: '#fff',
            maxWidth: '28rem', // Tailwind 'max-w-md'
            width: '100%',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }
        }}
        ariaHideApp={false}
      >
        <div className="text-center">
          <FaTrash className="text-red-500 mb-4 text-5xl" /> {/* Larger icon */}
          <h4 className="text-2xl font-bold text-gray-800 mb-3">Confirmer la suppression</h4>
          <p className="text-gray-600 mb-6">
            Voulez-vous vraiment supprimer le produit&nbsp;
            <span className="font-semibold text-red-600">
              {
                product?.name // Directly use the 'product' state from this component
                  ? `"${product.name}"`
                  : 'ce produit' // Fallback text
              }
            </span>
            &nbsp;? Cette action est irréversible.
          </p>
          <div className="flex justify-center space-x-4 mt-6">
            <button
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Non, annuler
            </button>
            <button
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              onClick={confirmDeleteProduct}
            >
              Oui, supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DetailProduct;