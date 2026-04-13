import React, { useEffect, useState } from 'react'
import { FaTrash } from 'react-icons/fa' // Assuming you have react-icons installed
import { BsBoxSeam, BsSearch, BsPlusCircle, BsTruck, BsEnvelope, BsTags, BsBox, BsPencil } from 'react-icons/bs'; // Using more specific icons from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import API from '../../../services/API'
import { toast } from 'react-toastify'
import Modal from 'react-modal'
import { API_URL } from '../../../services/API';

function Product() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false) // Corrected 'consr' to 'const'
  const [selectedProductId, setSelectedProductId] = useState(null); // New state to hold the ID of the product to be deleted
  const [selectedCategory, setSelectedCategory] = useState('')
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get('/products')
        setProducts(response.data.content || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        toast.error('Erreur lors du chargement des produits.')
        setProducts([]) // Ensure products is an array even on error
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Derive categories from products
  const categories = [...new Set(products.map(product => product.category).filter(Boolean))]; // Filter out undefined/null categories

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Group products by supplier, then by category
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const supplierId = product.supplier?.id || 'no_supplier'; // Handle products without a supplier
    const category = product.category || 'Non classifié'; // Handle products without a category

    if (!acc[supplierId]) {
      acc[supplierId] = {
        supplier: product.supplier || { id: 'no_supplier', name: 'Aucun fournisseur', email: 'N/A' },
        categories: {}
      }
    }

    if (!acc[supplierId].categories[category]) {
      acc[supplierId].categories[category] = []
    }

    acc[supplierId].categories[category].push(product)
    return acc
  }, {})

  const handleDeleteProduct = (id) => { // Modified to open modal
    setSelectedProductId(id);
    setIsDeleteModalOpen(true);
  }

  const confirmDeleteProduct = async () => { // New function to handle actual deletion
    if (!selectedProductId) return;

    try {
      await API.delete(`/products/${selectedProductId}`);
      setIsDeleteModalOpen(false)
      toast.success('Produit supprimé avec succès.', {
        onClose: () => {
          // Instead of full reload, filter out the deleted product from state
          setProducts(prevProducts => prevProducts.filter(p => p.id !== selectedProductId));
          setSelectedProductId(null); // Clear selected product ID
        }
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      toast.error(`Erreur lors de la suppression du produit: ${error.message || error}.`);
    }
  }

  // Find the selected product for the modal
  const productToDelete = products.find(p => p.id === selectedProductId);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1 flex items-center">
            <BsBoxSeam className="text-blue-600 mr-3 text-4xl" />
            Catalogue des Produits
          </h1>
          <p className="text-gray-600 text-lg">Gérez votre inventaire de produits</p>
        </div>
        <button
          className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
          onClick={() => navigate("/product/create")}
        >
          <BsPlusCircle className="mr-2 text-xl" />
          Ajouter un produit
        </button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BsSearch className="text-gray-400 text-lg" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Rechercher par nom ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <select
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-start md:justify-end">
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {loading ? 'Chargement...' : `${filteredProducts.length} produit${filteredProducts.length > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* Display grouped by supplier */}
      <div className="h-[calc(100vh-220px)] overflow-y-auto pr-2"> {/* Adjusted height and added right padding for scrollbar */}
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : Object.keys(groupedProducts).length > 0 ? (
          Object.values(groupedProducts).map((supplierGroup, supplierIndex) => (
            <div key={supplierGroup.supplier?.id || `no-supplier-${supplierIndex}`} className="mb-8">
              {/* Supplier Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center p-4 bg-white rounded-lg shadow mb-4">
                <div className="flex items-center flex-grow mb-3 md:mb-0">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full text-white text-2xl mr-4 flex-shrink-0">
                    <BsTruck />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{supplierGroup.supplier?.name || 'Aucun fournisseur'}</h3>
                    <p className="text-gray-600 text-sm flex items-center">
                      <BsEnvelope className="mr-1" />
                      {supplierGroup.supplier?.email || 'Aucun email'}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {Object.values(supplierGroup.categories).flat().length} produit{Object.values(supplierGroup.categories).flat().length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Supplier's Categories */}
              {Object.entries(supplierGroup.categories).map(([category, products]) => (
                <div key={category} className="mb-6 pl-0 md:pl-6"> {/* Indent categories slightly */}
                  <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4 flex items-center">
                    <BsTags className="text-gray-500 mr-2 text-xl" />
                    {category}
                    <span className="ml-2 px-3 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">{products.length}</span>
                  </h4>

                  {/* Horizontal Product Scroll */}
                  <div className="overflow-x-auto pb-4"> {/* Added pb-4 for scrollbar */}
                    <div className="flex space-x-4 min-w-max">
                      {products.map((product) => (
                        <div key={product.id} className="min-w-[280px] max-w-[280px] flex-shrink-0">
                          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                            <div className="p-3 pb-0">
                              <div className="flex justify-between items-start">
                                <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">{product.category}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.productStatus === 'ACTIF' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                                  {product.productStatus}
                                </span>
                              </div>
                            </div>

                            {/* Product Image */}
                            <div className="relative mt-2">
                              <img
                                src={`${API_URL}${product.imageUrl}`}
                                alt={product.name}
                                className="w-full h-32 object-cover rounded-t-lg" // Adjusted rounded-t-lg for card
                              />
                              <div className="absolute top-2 right-2">
                                <span className="px-3 py-1 bg-gray-800 bg-opacity-75 text-white text-xs font-medium rounded-full">
                                  {product.sku}
                                </span>
                              </div>
                            </div>

                            <div className="p-4 flex-grow flex flex-col">
                              <h5 className="text-lg font-semibold text-gray-900 mb-1 truncate flex items-center">
                                <BsBox className="text-blue-500 mr-2 text-xl flex-shrink-0" />
                                {product.name}
                              </h5>
                              <p className="text-gray-600 text-sm mb-3 truncate flex-grow">{product.description}</p>

                              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                <div>
                                  <small className="text-gray-500 block">Stock min</small>
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                    {product.minStockQuantity} {product.unite}
                                  </span>
                                </div>
                                <div>
                                  <small className="text-gray-500 block">Prix vente</small>
                                  <strong className="text-green-600 font-bold text-sm">{product.price.toFixed(2)} MGA</strong> {/* Adjusted currency */}
                                </div>
                                <div>
                                  <small className="text-gray-500 block">Prix achat</small>
                                  <strong className="text-blue-600 font-bold text-sm">{product.purchasePrice.toFixed(2)} MGA</strong> {/* Adjusted currency */}
                                </div>
                                <div>
                                  <small className="text-gray-500 block">Marge</small>
                                  <strong className="text-yellow-600 font-bold text-sm">
                                    {((product.price - product.purchasePrice) / product.purchasePrice * 100).toFixed(0)}%
                                  </strong>
                                </div>
                              </div>
                            </div>

                            <div className="p-3 border-t border-gray-100">
                              <div className="flex gap-2">
                                <button
                                  className="flex-1 px-4 py-2 border border-blue-500 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-center"
                                  onClick={() => navigate(`/product/${product.id}/detail`)}
                                >
                                  <BsPencil className="mr-1" /> Détails
                                </button>
                                <button
                                  className="px-4 py-2 border border-red-500 text-red-600 rounded-md text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          /* No products message */
          <div className="text-center py-12">
            <BsSearch className="text-gray-400 text-8xl mb-4 mx-auto" />
            <h4 className="text-2xl font-semibold text-gray-700 mb-2">Aucun produit trouvé</h4>
            <p className="text-gray-500 text-lg">Essayez de modifier vos critères de recherche ou ajoutez de nouveaux produits.</p>
          </div>
        )}
      </div>
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
                productToDelete?.name
                  ? `"${productToDelete.name}"`
                  : 'ce produit' // Fallback text
              }
            </span>
            &nbsp;? Cette action est irréversible.
          </p>
          <div className="flex justify-center space-x-4 mt-6">
            <button
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedProductId(null); // Clear selected product ID on cancel
              }}
            >
              Non, annuler
            </button>
            <button
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              onClick={confirmDeleteProduct} // Call the new confirmDeleteProduct function
            >
              Oui, supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Product