import React, { useEffect, useState, useMemo } from 'react';
import { FaPlus, FaTrash, FaCalendarAlt, FaTag, FaDollarSign, FaSave, FaSearch, FaSyncAlt } from 'react-icons/fa'; // Added FaSearch, FaSyncAlt
import { FaMoneyBillTransfer } from 'react-icons/fa6';
import API from '../../../services/API';
import { toast } from 'react-toastify';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const ITEMS_PER_PAGE = 10; // Define how many items per page

function Charge() {
  const [charges, setCharges] = useState([]); // All charges fetched from API
  const [newCharge, setNewCharge] = useState({
    chargeDate: '',
    raison: '',
    montant: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chargeToDelete, setChargeToDelete] = useState(null);

  // Filter state for actual filtering (applied on button click)
  const [appliedStartDateFilter, setAppliedStartDateFilter] = useState('');
  const [appliedEndDateFilter, setAppliedEndDateFilter] = useState('');

  // Temporary filter state for input fields
  const [tempStartDateFilter, setTempStartDateFilter] = useState('');
  const [tempEndDateFilter, setTempEndDateFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Helper to format date for display
  const formatDateForDisplay = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date invalide';
    }
  };

  // Fetch all charges (only once on component mount)
  useEffect(() => {
    const fetchAllCharges = async () => {
      setLoading(true);
      try {
        const response = await API.get('/charges');
        if (response.status === 200) {
          setCharges(response.data); // Store ALL charges
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des charges.');
        console.error('Error fetching charges:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllCharges();
  }, []); // Empty dependency array means this runs once on mount

  // Memoized filtered charges: Re-calculate only when charges, appliedStartDateFilter, or appliedEndDateFilter change
  const filteredCharges = useMemo(() => {
    return charges.filter(charge => {
      const chargeDate = new Date(charge.chargeDate);

      let isWithinStartDate = true;
      if (appliedStartDateFilter) {
        const start = new Date(appliedStartDateFilter + 'T00:00:00'); // Set time to beginning of day
        isWithinStartDate = chargeDate >= start;
      }

      let isWithinEndDate = true;
      if (appliedEndDateFilter) {
        const end = new Date(appliedEndDateFilter + 'T23:59:59.999'); // Set time to end of day
        isWithinEndDate = chargeDate <= end;
      }

      return isWithinStartDate && isWithinEndDate;
    });
  }, [charges, appliedStartDateFilter, appliedEndDateFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCharges.length / ITEMS_PER_PAGE);
  const paginatedCharges = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCharges.slice(startIndex, endIndex);
  }, [filteredCharges, currentPage]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle input changes for new charge form
  const handleChange = (field, value) => {
    setNewCharge(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle changes for temporary filter dates
  const handleTempFilterDateChange = (field, value) => {
    if (field === 'startDate') {
      setTempStartDateFilter(value);
    } else {
      setTempEndDateFilter(value);
    }
  };

  // Apply filter button click
  const handleApplyFilter = () => {
    setAppliedStartDateFilter(tempStartDateFilter);
    setAppliedEndDateFilter(tempEndDateFilter);
    setCurrentPage(1); // Reset to first page after applying filter
  };

  // Reset filter button click
  const handleResetFilter = () => {
    setTempStartDateFilter('');
    setTempEndDateFilter('');
    setAppliedStartDateFilter('');
    setAppliedEndDateFilter('');
    setCurrentPage(1); // Reset to first page after resetting filter
  };

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};
    if (!newCharge.chargeDate.trim()) newErrors.chargeDate = 'La date est obligatoire';
    if (!newCharge.raison.trim()) newErrors.raison = 'La raison est obligatoire';
    if (!newCharge.montant.trim()) {
      newErrors.montant = 'Le montant est obligatoire';
    } else if (isNaN(parseFloat(newCharge.montant)) || parseFloat(newCharge.montant) <= 0) {
      newErrors.montant = 'Le montant doit être un nombre positif';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission for creating a new charge
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    setSubmitting(true);
    try {
      const chargeData = {
        ...newCharge,
        montant: parseFloat(newCharge.montant)
      };
      const response = await API.post('/charges', chargeData);
      if (response.status === 201) {
        setCharges(prev => [...prev, response.data]); // Add to the *original* charges array
        setNewCharge({ chargeDate: '', raison: '', montant: '' }); // Reset form
        toast.success('Charge ajoutée avec succès !');
        setCurrentPage(1); // Potentially reset page if new item affects current view
      }
    } catch (error) {
      const apiErrorMessage = error.response?.data?.message || 'Erreur lors de l\'ajout de la charge.';
      toast.error(apiErrorMessage);
      console.error('Error creating charge:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = (charge) => {
    setChargeToDelete(charge);
    setShowDeleteModal(true);
  };

  // Confirm and perform deletion
  const confirmDelete = async () => {
    if (!chargeToDelete) return;

    setDeleting(true);
    try {
      await API.delete(`/charges/${chargeToDelete.id}`);
      setCharges(prev => prev.filter(c => c.id !== chargeToDelete.id)); // Filter from the *original* charges array
      toast.success('Charge supprimée avec succès !');
      setShowDeleteModal(false);
      setChargeToDelete(null);
      setCurrentPage(1); // Reset page after deletion as current page might become empty
    } catch (error) {
      const apiErrorMessage = error.response?.data?.message || 'Erreur lors de la suppression de la charge.';
      toast.error(apiErrorMessage);
      console.error('Error deleting charge:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col items-center">
      {/* Header Section */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6 md:mb-8">
        <div className="flex items-center">
          <FaMoneyBillTransfer className="text-blue-600 mr-3 text-4xl" />
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">Gestion des Charges</h1>
            <p className="text-gray-600 text-lg md:text-xl">Ajouter, visualiser et gérer les dépenses de l'entreprise</p>
          </div>
        </div>
      </div>

      {/* Add New Charge Form */}
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
          <FaPlus className="text-green-500 mr-3" /> Ajouter une nouvelle charge
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="chargeDate">
              <FaCalendarAlt className="inline-block mr-2 text-gray-500" /> Date de la charge <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="chargeDate"
              className={`w-full px-4 py-2 border ${errors.chargeDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
              value={newCharge.chargeDate}
              onChange={e => handleChange('chargeDate', e.target.value)}
              required
              disabled={submitting}
            />
            {errors.chargeDate && <p className="text-red-500 text-sm mt-1">{errors.chargeDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="raison">
              <FaTag className="inline-block mr-2 text-gray-500" /> Raison <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="raison"
              className={`w-full px-4 py-2 border ${errors.raison ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
              value={newCharge.raison}
              onChange={e => handleChange('raison', e.target.value)}
              placeholder="Ex: Loyer, Electricité, Salaires"
              required
              disabled={submitting}
            />
            {errors.raison && <p className="text-red-500 text-sm mt-1">{errors.raison}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="montant">
              <FaDollarSign className="inline-block mr-2 text-gray-500" /> Montant <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="montant"
              step="0.01"
              className={`w-full px-4 py-2 border ${errors.montant ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
              value={newCharge.montant}
              onChange={e => handleChange('montant', e.target.value)}
              placeholder="Ex: 1500.00"
              required
              disabled={submitting}
            />
            {errors.montant && <p className="text-red-500 text-sm mt-1">{errors.montant}</p>}
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Ajout...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> Ajouter la charge
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Date Filtering Section */}
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
          <FaCalendarAlt className="text-purple-500 mr-3" /> Filtrer les charges par date
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="tempStartDateFilter">
              Date de début
            </label>
            <input
              type="date"
              id="tempStartDateFilter"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={tempStartDateFilter}
              onChange={e => handleTempFilterDateChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="tempEndDateFilter">
              Date de fin
            </label>
            <input
              type="date"
              id="tempEndDateFilter"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={tempEndDateFilter}
              onChange={e => handleTempFilterDateChange('endDate', e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleApplyFilter}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <FaSearch className="mr-2" /> Appliquer le filtre
          </button>
          <button
            onClick={handleResetFilter}
            className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors flex items-center"
          >
            <FaSyncAlt className="mr-2" /> Réinitialiser le filtre
          </button>
        </div>
      </div>

      {/* Charges List Table */}
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
          <FaMoneyBillTransfer className="text-blue-500 mr-3" /> Charges Enregistrées
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-4 text-gray-700">Chargement des charges...</p>
          </div>
        ) : filteredCharges.length === 0 ? ( // Use filteredCharges for length check
          <div className="text-center py-10 text-gray-600">
            {appliedStartDateFilter || appliedEndDateFilter ?
              "Aucune charge trouvée pour les dates sélectionnées." :
              "Aucune charge enregistrée pour le moment."
            }
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raison
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCharges.map((charge) => ( // Render paginatedCharges
                  <tr key={charge.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateForDisplay(charge.chargeDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {charge.raison}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {charge.montant} Ar
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(charge)}
                        disabled={deleting}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 rounded-md ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </nav>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        contentLabel="Confirmer la suppression de la charge"
        className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50"
        overlayClassName="fixed inset-0 bg-gray-600 bg-opacity-50 z-40"
        ariaHideApp={false}
      >
        <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-auto">
          <div className="text-center">
            <FaTrash className="text-red-500 mb-4 text-5xl mx-auto" />
            <h4 className="text-2xl font-bold text-gray-800 mb-3">Confirmer la suppression</h4>
            <p className="text-gray-600 mb-6">
              Voulez-vous vraiment supprimer la charge pour "{chargeToDelete?.raison}" datant du {chargeToDelete ? formatDateForDisplay(chargeToDelete.chargeDate) : 'N/A'}? Cette action est irréversible.
            </p>
            <div className="flex justify-center space-x-4 mt-6">
              <button
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Non, annuler
              </button>
              <button
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Suppression...
                  </>
                ) : (
                  <>Oui, supprimer</>
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Charge;