import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaPlusCircle, FaFileInvoiceDollar } from 'react-icons/fa'; // Added FaFileInvoiceDollar
import { BsTruck } from 'react-icons/bs';
import API from '../../../services/API';
import { toast } from 'react-toastify';
import Modal from 'react-modal';

function SupplierList({ searchTerm = '' }) {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      setLoading(true);
      try {
        const response = await API.get('/suppliers');
        if (response.status === 200) {
          setSuppliers(response.data);
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des fournisseurs.');
        console.error('Error fetching suppliers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  const deleteSupplier = async (id) => {
    try {
      await API.delete(`/suppliers/${id}`);
      setSuppliers(prevSuppliers => prevSuppliers.filter(sup => sup.id !== id));
      setIsDeleteModalOpen(false);
      setSelectedSupplierId(null);
      toast.success('Fournisseur supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression du fournisseur');
      console.error('Error deleting supplier:', error);
    }
  };

  // --- Nouvelle fonction pour créer une facture ---
  const handleCreateFacture = (supplierId) => {
    // Navigue vers la page de création de facture en passant l'ID du fournisseur
    // L'ID du fournisseur sera disponible dans le composant CreateFacture via useLocation().state
    navigate('/facture/create', { state: { supplierId: supplierId } });
  };
  // -------------------------------------------------

  const filteredSuppliers = suppliers.filter(sup => {
    const term = searchTerm.toLowerCase();
    return (
      sup.name?.toLowerCase().includes(term) ||
      sup.email?.toLowerCase().includes(term) ||
      sup.phone?.toLowerCase().includes(term) ||
      sup.address?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 sm:p-6">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-1 flex items-center">
            <BsTruck className="mr-2 text-2xl text-gray-700" />Fournisseurs
          </h3>
          <p className="text-sm text-gray-500">Gérez vos partenaires et fournisseurs</p>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center text-sm"
          onClick={() => navigate('/supplier/create')}
        >
          <FaPlusCircle className="mr-2" />Ajouter
        </button>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-600">Chargement des fournisseurs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                  <th scope="col" className="relative px-6 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Aucun fournisseur trouvé</td>
                  </tr>
                ) : (
                  filteredSuppliers.map(sup => (
                    <tr key={sup.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{sup.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sup.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sup.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{sup.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"> {/* Centered actions */}
                        {/* Nouvelle icône "Créer facture" */}
                        <button
                          className="text-emerald-600 hover:text-emerald-900 mr-3 p-1 rounded-full hover:bg-emerald-100 transition-colors"
                          onClick={() => handleCreateFacture(sup.id)}
                          title="Créer une facture pour ce fournisseur"
                        >
                          <FaFileInvoiceDollar className="text-lg" />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3 p-1 rounded-full hover:bg-blue-100 transition-colors"
                          onClick={() => navigate(`/supplier/${sup.id}/detail`)}
                          title="Détails"
                        >
                          <FaEye className="text-lg" />
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-900 mr-3 p-1 rounded-full hover:bg-indigo-100 transition-colors"
                          onClick={() => navigate(`/supplier/${sup.id}/edit`)}
                          title="Modifier"
                        >
                          <FaEdit className="text-lg" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors"
                          onClick={() => { setSelectedSupplierId(sup.id); setIsDeleteModalOpen(true); }}
                          title="Supprimer"
                        >
                          <FaTrash className="text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
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
            zIndex: 1000
          },
          content: {
            position: 'static',
            padding: '2rem',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: 'none',
            background: '#fff',
            maxWidth: '28rem',
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
          <FaTrash className="text-red-500 mb-4 text-5xl" />
          <h4 className="text-2xl font-bold text-gray-800 mb-3">Confirmer la suppression</h4>
          <p className="text-gray-600 mb-6">
            Voulez-vous vraiment supprimer le fournisseur&nbsp;
            <span className="font-semibold text-red-600">
              {
                suppliers.find(sup => sup.id === selectedSupplierId)?.name
                  ? `"${suppliers.find(sup => sup.id === selectedSupplierId).name}"`
                  : 'ce fournisseur'
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
              onClick={() => deleteSupplier(selectedSupplierId)}
            >
              Oui, supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SupplierList;