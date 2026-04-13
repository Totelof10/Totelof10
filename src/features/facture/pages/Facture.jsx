import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaPlusCircle, FaSearch, FaFilter, FaSortAlphaDown, FaSortAlphaUp, FaTrashAlt } from 'react-icons/fa'; // Import FaTrashAlt
import Swal from 'sweetalert2'; // Import SweetAlert2

// Importez votre instance d'API (Axios) directement
import API from '../../../services/API'; // Assurez-vous que ce chemin est correct

function FactureList() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- États pour le filtrage et le tri ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING, PAID, OVERDUE, etc.
  const [sortCriteria, setSortCriteria] = useState('dateFacture'); // 'dateFacture', 'montantTotal', 'supplierName'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' ou 'desc'

  // Refetch invoices whenever a deletion occurs to update the list
  const fetchFactures = async () => {
    setLoading(true);
    try {
      const response = await API.get('/factures/fournisseurs');
      if (response.status === 200) {
        setFactures(response.data);
      } else {
        throw new Error('Failed to fetch invoices');
      }
    } catch (err) {
      setError("Erreur lors du chargement des factures. Veuillez réessayer.");
      console.error("API Fetch Error:", err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []); // Empty dependency array means this runs once on mount

  // --- Logique de Filtrage et de Tri ---
  const filteredAndSortedFactures = useMemo(() => {
    let operableFactures = [...factures]; // Crée une copie pour ne pas modifier l'état original

    // 1. Filtrage par terme de recherche (numéro de facture ou nom du fournisseur)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      operableFactures = operableFactures.filter(facture =>
        facture.invoiceNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
        facture.supplierName.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // 2. Filtrage par statut
    if (filterStatus !== 'ALL') {
      operableFactures = operableFactures.filter(facture =>
        facture.status === filterStatus
      );
    }

    // 3. Tri
    operableFactures.sort((a, b) => {
      let valA, valB;

      switch (sortCriteria) {
        case 'dateFacture':
          valA = new Date(a.dateFacture).getTime();
          valB = new Date(b.dateFacture).getTime();
          break;
        case 'montantTotal':
          valA = a.montantTotal;
          valB = b.montantTotal;
          break;
        case 'supplierName':
          valA = a.supplierName.toLowerCase();
          valB = b.supplierName.toLowerCase();
          break;
        default:
          valA = new Date(a.dateFacture).getTime(); // Fallback
          valB = new Date(b.dateFacture).getTime(); // Fallback
          break;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return operableFactures;
  }, [factures, searchTerm, filterStatus, sortCriteria, sortOrder]);

  // Fonction pour formater les dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error("Invalid date string:", dateString, e);
      return dateString;
    }
  };

  const handleFactureClick = (factureId) => {
    navigate(`/facture/${factureId}/detail`);
  };

  const handleCreateNewFacture = () => {
    navigate('/facture/create');
  };

  // --- Fonction de suppression avec SweetAlert2 ---
  const handleDeleteFacture = async (factureId, event) => {
    event.stopPropagation(); // Empêche l'événement de clic de se propager à la carte de facture

    const result = await Swal.fire({
      title: 'Êtes-vous sûr(e) ?',
      text: "Vous ne pourrez pas revenir en arrière après cette suppression !",
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
        const response = await API.delete(`/factures/fournisseurs/${factureId}`);
        if (response.status === 200 || response.status === 204) { // 200 OK ou 204 No Content
          Swal.fire(
            'Supprimée !',
            'La facture a été supprimée avec succès.',
            'success'
          );
          // Actualise la liste des factures après suppression
          fetchFactures();
        } else {
          throw new Error('Failed to delete invoice');
        }
      } catch (err) {
        console.error("API Delete Error:", err.response ? err.response.data : err.message);
        Swal.fire(
          'Erreur !',
          'Une erreur est survenue lors de la suppression de la facture.',
          'error'
        );
      } finally {
        setLoading(false); // Cacher le spinner
      }
    }
  };


  // Déterminer le style du statut
  const getStatusClasses = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-gray-700">
        <FaSpinner className="animate-spin text-5xl text-blue-500 mb-4" />
        <p className="text-xl font-medium">Chargement des factures...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-red-50 text-red-700 p-6 rounded-lg shadow-md mx-auto max-w-lg text-center">
        <p className="text-2xl font-semibold mb-3">Oups ! Une erreur est survenue.</p>
        <p className="text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center flex-grow">
          Liste des Factures Fournisseurs
        </h1>
        <button
          onClick={handleCreateNewFacture}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center whitespace-nowrap"
        >
          <FaPlusCircle className="mr-2" /> Nouvelle Facture
        </button>
      </div>

      {/* --- Section de Filtrage et Tri --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100 max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FaFilter className="mr-2 text-gray-600" /> Options de Filtrage & Tri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche textuelle */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher par numéro ou fournisseur..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Filtre par statut */}
          <div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="PAID">Payée</option>
              <option value="OVERDUE">En retard</option>
            </select>
          </div>

          {/* Tri */}
          <div className="flex items-center space-x-2">
            <select
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
            >
              <option value="dateFacture">Trier par Date de Facture</option>
              <option value="montantTotal">Trier par Montant Total</option>
              <option value="supplierName">Trier par Fournisseur</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              title={sortOrder === 'asc' ? 'Trier par ordre décroissant' : 'Trier par ordre croissant'}
            >
              {sortOrder === 'asc' ? <FaSortAlphaUp className="text-gray-600" /> : <FaSortAlphaDown className="text-gray-600" />}
            </button>
          </div>
        </div>
      </div>
      {/* --- Fin de la Section de Filtrage et Tri --- */}

      {filteredAndSortedFactures.length === 0 ? (
        <div className="text-center text-gray-600 p-8 bg-white rounded-xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
          <p className="text-xl font-semibold mb-4">
            {searchTerm || filterStatus !== 'ALL' ? "Aucune facture ne correspond à vos critères de recherche." : "Aucune facture fournisseur à afficher pour le moment."}
          </p>
          <p className="text-base text-gray-500 mb-6">
            {searchTerm || filterStatus !== 'ALL' ? "Veuillez ajuster vos filtres ou créer une nouvelle facture." : "Commencez par ajouter de nouvelles factures pour suivre vos dépenses."}
          </p>
          <button
            onClick={handleCreateNewFacture}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center mx-auto"
          >
            <FaPlusCircle className="mr-2 text-lg" /> Créer une Facture maintenant
          </button>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {filteredAndSortedFactures.map((facture) => (
            <div
              key={facture.id}
              className="relative block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
              onClick={() => handleFactureClick(facture.id)}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-2 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-blue-700 mb-2 md:mb-0">
                  {facture.supplierName} <span className="text-gray-500 text-base font-normal">({facture.invoiceNumber})</span>
                </h2>
                <div className="flex items-center space-x-3">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase ${getStatusClasses(facture.status)}`}>
                    {facture.status}
                  </span>
                  {/* Bouton de suppression */}
                  <button
                    onClick={(event) => handleDeleteFacture(facture.id, event)}
                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                    title="Supprimer la facture"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-gray-700 text-base mb-4">
                <p>
                  <span className="font-medium text-gray-800">Date de Facture:</span>{' '}
                  {formatDate(facture.dateFacture)}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Date d'Échéance:</span>{' '}
                  {formatDate(facture.dateEcheance)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 text-right">
                <p className="text-2xl font-extrabold text-green-700">
                  Total: {facture.montantTotal.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'MGA'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FactureList;