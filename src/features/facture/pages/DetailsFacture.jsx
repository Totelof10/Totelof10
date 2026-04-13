import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBuilding, FaCalendarAlt, FaEuroSign, FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaSpinner, FaFileInvoiceDollar, FaPrint } from 'react-icons/fa';
import Swal from 'sweetalert2'; // Pour les alertes de confirmation stylisées
import API from '../../../services/API'; // Assurez-vous que ce chemin est correct

function DetailsFacture() {
  const { id } = useParams(); // Récupère l'ID de la facture depuis l'URL
  const navigate = useNavigate();

  const [facture, setFacture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFactureDetails = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/factures/fournisseurs/${id}`); // Endpoint pour récupérer une facture par ID
        if (response.status === 200) {
            console.log(response.data)
          setFacture(response.data);
        } else {
          throw new Error('Failed to fetch invoice details.');
        }
      } catch (err) {
        setError("Erreur lors du chargement des détails de la facture. ID invalide ou facture introuvable.");
        console.error("API Fetch Error (Facture Details):", err.response ? err.response.data : err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFactureDetails();
    } else {
      setError("Aucun ID de facture fourni.");
      setLoading(false);
    }
  }, [id]); // Déclenche le rechargement si l'ID change

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Les dates de votre backend sont des LocalDateTime, assurez-vous qu'elles sont gérées correctement.
      // Si c'est un format ISO 8601 (ex: "2024-03-15T10:00:00"), `new Date()` le gère bien.
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Invalid date string:", dateString, e);
      return dateString;
    }
  };

  const handleMarkAsPaid = async () => {
    Swal.fire({
      title: 'Confirmer le paiement ?',
      text: "Voulez-vous vraiment marquer cette facture comme payée ?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, marquer comme payée !',
      cancelButtonText: 'Annuler'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Endpoint pour marquer une facture comme payée (ex: PATCH /factures/{id}/pay)
          const response = await API.post(`/factures/fournisseurs/${id}/pay?montantPaiement=${facture.montantTotal}`);
          if (response.status === 200) {
            setFacture(prevFacture => ({ ...prevFacture, status: 'PAID' })); // Met à jour le statut localement
            Swal.fire(
              'Payée !',
              'La facture a été marquée comme payée.',
              'success'
            );
          } else {
            throw new Error('Failed to mark invoice as paid.');
          }
        } catch (err) {
          Swal.fire(
            'Erreur !',
            err.response?.data?.message || 'Impossible de marquer la facture comme payée.',
            'error'
          );
          console.error("API Error (Mark as Paid):", err.response ? err.response.data : err.message);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-gray-700">
        <FaSpinner className="animate-spin text-5xl text-blue-500 mb-4" />
        <p className="text-xl font-medium">Chargement des détails de la facture...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-red-50 text-red-700 p-6 rounded-lg shadow-md mx-auto max-w-lg text-center">
        <FaExclamationCircle className="text-6xl mb-4" />
        <p className="text-2xl font-semibold mb-3">Erreur de chargement !</p>
        <p className="text-lg">{error}</p>
        <button
          onClick={() => navigate('/factures-fournisseurs')}
          className="mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Retour à la liste des factures
        </button>
      </div>
    );
  }

  if (!facture) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-gray-700">
        <FaExclamationCircle className="text-5xl text-gray-400 mb-4" />
        <p className="text-xl font-medium">Facture introuvable.</p>
        <button
          onClick={() => navigate('/factures-fournisseurs')}
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  // Déterminer le style du statut
  const getStatusClasses = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': // Si vous avez un statut "En Retard"
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:px-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-8 text-center leading-tight">
        Détails de la Facture Fournisseur
      </h1>

      <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl max-w-4xl mx-auto border border-gray-100">
        {/* En-tête de la facture */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-blue-700 mb-1 flex items-center">
              <FaFileInvoiceDollar className="mr-3 text-blue-600" /> Facture #{facture.invoiceNumber}
            </h2>
            <p className="text-lg text-gray-600 flex items-center">
              <FaBuilding className="mr-2 text-gray-500" /> Fournisseur: <span className="font-semibold ml-1">{facture.supplierName}</span>
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-base font-semibold tracking-wide uppercase mt-4 md:mt-0 ${getStatusClasses(facture.status)}`}>
            {facture.status}
          </span>
        </div>

        {/* Informations générales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-gray-700">
          <p className="flex items-center">
            <FaCalendarAlt className="mr-2 text-purple-500" />
            <span className="font-medium mr-1">Date de Facture:</span> {formatDate(facture.dateFacture)}
          </p>
          <p className="flex items-center">
            <FaCalendarAlt className="mr-2 text-red-500" />
            <span className="font-medium mr-1">Date d'Échéance:</span> {formatDate(facture.dateEcheance)}
          </p>
        </div>

        {/* Tableau des articles */}
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 border-gray-200">Articles de la Facture</h3>
        {facture.items && facture.items.length > 0 ? (
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full bg-white rounded-lg shadow-sm overflow-hidden">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Produit</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Quantité</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Prix Unitaire</th>
                  <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {facture.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-800 font-medium">{item.productName}</td>
                    <td className="py-3 px-4 text-gray-700">{item.quantity}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {item.purchasePricePerUnit.toLocaleString('fr-FR', { style: 'currency', currency: 'MGA' })}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-800 font-semibold">
                      {item.subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'MGA' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-600 py-4 bg-gray-50 rounded-md">Aucun article pour cette facture.</p>
        )}

        {/* Total et actions */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <p className="text-2xl font-extrabold text-green-700 flex items-center">
            <FaEuroSign className="mr-2 text-green-600" />
            Montant Total: {facture.montantTotal.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'MGA'
            })}
          </p>
          <div className="flex space-x-3">
            {facture.status !== 'PAID' && (
              <button
                onClick={handleMarkAsPaid}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
              >
                <FaCheckCircle className="mr-2" /> Marquer comme payée
              </button>
            )}
            <button
              onClick={() => navigate('/facture')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
            >
              <FaTimesCircle className="mr-2" /> Retour
            </button>
            {/* Vous pouvez ajouter un bouton d'impression ici */}
            {/* <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center">
              <FaPrint className="mr-2" /> Imprimer
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailsFacture;