import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaEye, FaPlus, FaTruck, FaTrash, FaCalendarAlt, FaFilter, FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa'; // Ajout de FaSortAlphaDown, FaSortAlphaUp
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import Swal from 'sweetalert2'; // Import de SweetAlert2 pour la confirmation de suppression
import CreateOrder from './CreateOrder'; // Assurez-vous que ce composant est également stylisé avec Tailwind
import Invoice from './Invoice'; // Assurez-vous que ce composant est également stylisé avec Tailwind
import API from '../../../services/API'; // Assurez-vous que ce chemin est correct
import { toast } from 'react-toastify';

Modal.setAppElement('#root'); // Important pour l'accessibilité de react-modal

function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  // États pour la modal de confirmation de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null); // Pour stocker l'ID/objet de la commande à supprimer

  // --- États pour le tri ---
  // Valeurs par défaut pour trier par date de commande (orderDate) du plus récent (desc)
  const [sortCriteria, setSortCriteria] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' ou 'desc'

  // Fonction pour formater les dates
  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  // Fonction pour recharger toutes les commandes (utilisée au montage et après suppression/création)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await API.get('/orders');
      let ordersData = [];
      if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.data && Array.isArray(response.data.content)) {
        ordersData = response.data.content;
      } else if (response.data && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      } else {
        console.warn('Structure de réponse inattendue:', response.data);
      }
      setOrders(ordersData);
      setCurrentPage(1); // Réinitialise la pagination après rechargement
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      toast.error('Erreur lors du chargement des commandes.');
      setOrders([]); // S'assure que orders est un tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []); // Dépendances vides pour un seul appel au montage

  // --- Logique de Filtrage et de Tri avec useMemo ---
  const filteredAndSortedOrders = useMemo(() => {
    let operableOrders = [...orders]; // Crée une copie pour ne pas modifier l'état original

    // 1. Filtrage par terme de recherche (numéro de commande ou nom du client)
    if (search) {
      const lowerCaseSearch = search.toLowerCase();
      operableOrders = operableOrders.filter(order =>
        order.orderNumber?.toLowerCase().includes(lowerCaseSearch) ||
        order.customerName?.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // 2. Filtrage par statut
    if (statusFilter) {
      operableOrders = operableOrders.filter(order =>
        order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // 3. Tri
    operableOrders.sort((a, b) => {
      let valA, valB;

      switch (sortCriteria) {
        case 'orderDate':
          valA = new Date(a.orderDate).getTime();
          valB = new Date(b.orderDate).getTime();
          break;
        case 'totalAmount':
          valA = a.totalAmount || 0;
          valB = b.totalAmount || 0;
          break;
        case 'customerName':
          valA = a.customerName?.toLowerCase() || '';
          valB = b.customerName?.toLowerCase() || '';
          break;
        default:
          valA = new Date(a.orderDate).getTime(); // Fallback
          valB = new Date(b.orderDate).getTime(); // Fallback
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0; // Les valeurs sont égales
    });

    return operableOrders;
  }, [orders, search, statusFilter, sortCriteria, sortOrder]); // Dépendances pour useMemo

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredAndSortedOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);

  // Fonction pour ouvrir la modal de confirmation de suppression
  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  // Fonction pour exécuter la suppression après confirmation (SweetAlert2)
  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    const result = await Swal.fire({
      title: 'Êtes-vous sûr(e) ?',
      text: `Voulez-vous vraiment supprimer la commande "${orderToDelete.orderNumber}" ? Cette action est irréversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler',
      reverseButtons: true // Met le bouton "Annuler" à gauche
    });

    if (result.isConfirmed) {
      try {
        setLoading(true); // Optionnel: Montrer un spinner pendant la suppression
        const response = await API.delete(`/orders/${orderToDelete.id}`);
        if (response.status === 200 || response.status === 204) {
          Swal.fire(
            'Supprimée !',
            'La commande a été supprimée avec succès.',
            'success'
          );
          fetchOrders(); // Recharger les données après suppression
        } else {
          throw new Error('Failed to delete order');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la commande:', error);
        Swal.fire(
          'Erreur !',
          'Une erreur est survenue lors de la suppression de la commande.',
          'error'
        );
      } finally {
        setLoading(false); // Cacher le spinner
        setIsDeleteModalOpen(false); // Fermer la modal interne même en cas d'erreur
        setOrderToDelete(null); // Nettoyer l'objet à supprimer
      }
    } else {
      setIsDeleteModalOpen(false); // Fermer la modal si l'utilisateur annule
      setOrderToDelete(null);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const clearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
    setSortCriteria('orderDate'); // Réinitialiser le critère de tri par défaut
    setSortOrder('desc'); // Réinitialiser l'ordre de tri par défaut
    setCurrentPage(1);
    fetchOrders(); // Recharger toutes les commandes
  };

  // Fonction pour filtrer par date via l'API (si votre backend supporte le filtrage côté serveur)
  const fetchOrdersByDate = async () => {
    if (startDate && endDate) {
      setLoading(true);
      try {
        const start = new Date(startDate).toISOString();
        const end = new Date(endDate + 'T23:59:59.999').toISOString(); // Inclure toute la journée de fin
        const response = await API.get(`/orders/by-date?startDate=${start}&endDate=${end}&page=0&size=100`);

        let ordersData = [];
        if (Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (response.data && Array.isArray(response.data.content)) {
          ordersData = response.data.content;
        } else if (response.data && Array.isArray(response.data.orders)) {
          ordersData = response.data.orders;
        }
        setOrders(ordersData);
        setCurrentPage(1); // Reset pagination
      } catch (error) {
        console.error('Erreur lors du filtrage par date:', error);
        toast.error('Erreur lors du filtrage par date.');
        setOrders([]); // Clear orders on error
      } finally {
        setLoading(false);
      }
    } else {
      toast.warn('Veuillez sélectionner une date de début et une date de fin pour filtrer.');
    }
  };

  // Map des statuts pour les classes Tailwind
  const statusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'delivered': return 'bg-green-100 text-green-800 border border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      case 'paid': return 'bg-green-500 text-white border border-green-600'; // Plus prononcé pour "Payé"
      case 'partially_paid': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'processing': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'returned': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'completed_return': return 'bg-gray-200 text-gray-800 border border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Options de statut pour le filtre
  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'PROCESSING', label: 'En cours de traitement' },
    { value: 'SHIPPED', label: 'Expédié' },
    { value: 'DELIVERED', label: 'Livré' },
    { value: 'CANCELLED', label: 'Annulé' },
    { value: 'RETURNED', label: 'Retourné' },
    { value: 'COMPLETED_RETURN', label: 'Retour complété' },
    { value: 'PARTIALLY_PAID', label: 'Partiellement payé' },
    { value: 'PAID', label: 'Payé' },
  ];

  return (
    // Ajoutez un padding-bottom conséquent pour ne pas que le contenu passe derrière le dock de la NavBar
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 pt-4 pb-20 md:pb-24 lg:pb-28 xl:pb-32 max-w-7xl mx-auto"> 
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Liste des bons de livraison</h2>
      
      {/* Filtres et actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6 items-end">
        {/* Recherche */}
        <div className="col-span-1 lg:col-span-2">
          <label htmlFor="search-input" className="sr-only">Rechercher</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              id="search-input"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="Rechercher par numéro ou client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        {/* Date de début */}
        <div className="col-span-1">
          <label htmlFor="start-date" className="sr-only">Date de début</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaCalendarAlt className="text-gray-400" />
            </div>
            <input
              type="date"
              id="start-date"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              aria-label="Date de début"
            />
          </div>
        </div>

        {/* Date de fin */}
        <div className="col-span-1">
          <label htmlFor="end-date" className="sr-only">Date de fin</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaCalendarAlt className="text-gray-400" />
            </div>
            <input
              type="date"
              id="end-date"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              aria-label="Date de fin"
            />
          </div>
        </div>

        {/* Filtre de statut */}
        <div className="col-span-1">
          <label htmlFor="status-filter" className="sr-only">Filtrer par statut</label>
          <select
            id="status-filter"
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton Filtrer par date */}
        <div className="col-span-1">
          <button
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={fetchOrdersByDate}
            disabled={!startDate || !endDate}
          >
            <FaFilter className="inline-block mr-2" /> Filtrer
          </button>
        </div>
        
        {/* Bouton Effacer tous les filtres */}
        <div className="col-span-1">
          <button
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
            onClick={clearFilters}
          >
            <FaFilter className="inline-block mr-2" /> Effacer
          </button>
        </div>

        {/* Contrôles de tri (Ajout optionnel) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 flex items-end space-x-2">
            <select
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={sortCriteria}
                onChange={(e) => {
                    setSortCriteria(e.target.value);
                    setCurrentPage(1); // Réinitialiser la page lors du changement de critère
                }}
                aria-label="Trier par"
            >
                <option value="orderDate">Date de commande</option>
                <option value="totalAmount">Montant total</option>
                <option value="customerName">Nom du client</option>
            </select>
            <button
                onClick={() => {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    setCurrentPage(1); // Réinitialiser la page lors du changement d'ordre
                }}
                className="p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                title={sortOrder === 'asc' ? 'Trier par ordre décroissant' : 'Trier par ordre croissant'}
                aria-label={sortOrder === 'asc' ? 'Trier par ordre décroissant' : 'Trier par ordre croissant'}
            >
                {sortOrder === 'asc' ? <FaSortAlphaUp className="text-gray-600" /> : <FaSortAlphaDown className="text-gray-600" />}
            </button>
        </div>
      </div>

      {/* Bouton Ajouter (Desktop) */}
      <button
        className="fixed right-8 bottom-8 z-40 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors hidden md:flex"
        onClick={() => setShowModal(true)}
        title="Créer une commande"
        aria-label="Créer une nouvelle commande"
      >
        <FaPlus size={24} />
      </button>

      {/* Bouton Ajouter (Mobile) */}
      <button
        className="w-full bg-blue-600 text-white py-3 rounded-md shadow-md hover:bg-blue-700 transition-colors my-4 md:hidden"
        onClick={() => setShowModal(true)}
        title="Créer une commande"
        aria-label="Créer une nouvelle commande"
      >
        <FaPlus className="inline-block mr-2" /> Nouvelle commande
      </button>

      {/* Modal Créer Commande */}
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        onAfterClose={() => fetchOrders()} // Recharger les commandes après la fermeture du modal de création
        className="fixed inset-0 flex items-center justify-center p-4 z-[1050]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[1049]"
        contentLabel="Créer une commande"
      >
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto outline-none">
          <CreateOrder onClose={() => setShowModal(false)} />
        </div>
      </Modal>

      {/* Section Tableau */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto"> {/* Permet le défilement horizontal sur petits écrans */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Commande</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (MGA)</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-3">Chargement des commandes...</p>
                    </div>
                  </td>
                </tr>
              ) : currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    <p className="text-lg">Aucune commande trouvée.</p>
                    <p className="text-sm">Ajustez vos filtres ou créez une nouvelle commande.</p>
                  </td>
                </tr>
              ) : (
                currentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.customerName || 'Client inconnu'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(order.orderDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(order.echeanceDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClass(order.status)}`}>
                        {order.status?.replace(/_/g, ' ') || 'Inconnu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.totalAmount?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'} MGA</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          title="Voir le détail"
                          className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                          onClick={() => navigate(`/order/${order.id}/detail`)}
                        >
                          <FaEye size={16} />
                        </button>
                        <button
                          title="Créer un bon de livraison"
                          className="p-2 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                          onClick={() => navigate(`/order/${order.id}/invoice`)}
                        >
                          <FaTruck size={16} />
                        </button>
                        <button
                          title="Supprimer la commande"
                          className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                          onClick={(event) => { // Empêche le clic de se propager au parent TR
                            event.stopPropagation();
                            handleDeleteClick(order);
                          }}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 0 && ( // Affiche la pagination seulement s'il y a des pages
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-md">
          <div className="text-sm text-gray-700 mb-4 md:mb-0">
            Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredAndSortedOrders.length)} sur {filteredAndSortedOrders.length} commandes
          </div>
          <nav className="flex space-x-2" aria-label="Pagination des commandes">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Précédent
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
              <button
                key={pageNumber}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pageNumber === currentPage
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
            
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant
            </button>
          </nav>
        </div>
      )}

      {/* Modal Facture (si utilisée) */}
      <Modal
        isOpen={showInvoice}
        onRequestClose={() => setShowInvoice(false)}
        className="fixed inset-0 flex items-center justify-center p-4 z-[1050]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[1049]"
        contentLabel="Facture"
      >
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto outline-none">
          <Invoice order={invoiceOrder} onClose={() => setShowInvoice(false)} />
        </div>
      </Modal>

      {/* Delete Confirmation Modal (SweetAlert2 style) */}
      {/* Cette modal React-Modal n'est plus strictement nécessaire si SweetAlert2 gère tout */}
      {/* Je la laisse pour montrer l'exemple, mais vous pourriez la retirer si Swal.fire suffit */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        contentLabel="Confirmer la suppression de la commande"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000 // Assure que la modal est au-dessus du reste
          },
          content: {
            position: 'static', // Annule le positionnement par défaut
            padding: '2rem',
            borderRadius: '0.75rem', // Correspond à 'rounded-lg' de Tailwind
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Approximation de 'shadow-xl'
            border: 'none',
            background: '#fff',
            maxWidth: '28rem', // Correspond à 'max-w-md' de Tailwind
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
          <FaTrash className="text-red-500 mb-4 text-5xl" /> {/* Icône plus grande */}
          <h4 className="text-2xl font-bold text-gray-800 mb-3">Confirmer la suppression</h4>
          <p className="text-gray-600 mb-6">
            Voulez-vous vraiment supprimer la commande&nbsp;
            <span className="font-semibold text-red-600">
              {orderToDelete?.orderNumber ? `"${orderToDelete.orderNumber}"` : 'cette commande'}
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
              onClick={confirmDeleteOrder}
            >
              Oui, supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Order;