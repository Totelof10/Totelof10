import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { BsPeople } from 'react-icons/bs'; // Specific icon for customers
import API from '../../../services/API';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

function CustomerList({ searchTerm = '' }) {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await API.get('/customers');
        if (response.status === 200) {
          setCustomers(response.data);
        }
      } catch (error) {
        toast.error('Erreur lors du chargement des clients.');
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(cust => {
    const term = searchTerm.toLowerCase();
    return (
      cust.name?.toLowerCase().includes(term) ||
      cust.email?.toLowerCase().includes(term) ||
      cust.phone?.toLowerCase().includes(term) ||
      cust.address?.toLowerCase().includes(term) ||
      cust.contactPerson?.toLowerCase().includes(term)
    );
  });

  const deleteCustomer = async (id) => {
    try {
      await API.delete(`/customers/${id}`);
      // Optimistic update: filter out the deleted customer directly
      setCustomers(prevCustomers => prevCustomers.filter(cust => cust.id !== id));
      setIsDeleteModalOpen(false);
      setSelectedCustomerId(null);
      toast.success('Client supprimé avec succès');
      // No window.location.reload() for better UX
    } catch (error) {
      toast.error('Erreur lors de la suppression du client');
      console.error('Error deleting customer:', error);
    }
  };

  return (
    <div className="p-4 sm:p-6"> {/* Consistent padding */}
      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-1 flex items-center">
            <BsPeople className="mr-2 text-2xl text-gray-700" />Clients
          </h3>
          <p className="text-sm text-gray-500">Gérez vos clients et contacts</p>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center text-sm"
          onClick={() => navigate('/customer/create')}
        >
          <FaUserPlus className="mr-2" />Ajouter
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200"> {/* Added border */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-3 text-gray-600">Chargement des clients...</p>
          </div>
        ) : (
          <div className="overflow-x-auto"> {/* Ensures horizontal scroll on small screens */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span> {/* For accessibility */}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Aucun client trouvé</td>
                  </tr>
                ) : (
                  filteredCustomers.map(cust => (
                    <tr key={cust.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{cust.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cust.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cust.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cust.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cust.contactPerson}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3 p-1 rounded-full hover:bg-blue-100 transition-colors"
                          onClick={() => navigate(`/customer/${cust.id}/detail`)}
                          title="Détails"
                        >
                          <FaEye className="text-lg" />
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-900 mr-3 p-1 rounded-full hover:bg-indigo-100 transition-colors"
                          onClick={() => navigate(`/customer/${cust.id}/edit`)}
                          title="Modifier"
                        >
                          <FaEdit className="text-lg" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors"
                          onClick={() => { setSelectedCustomerId(cust.id); setIsDeleteModalOpen(true); }}
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
            Voulez-vous vraiment supprimer ce client&nbsp;
            <span className="font-semibold text-red-600">
              {filteredCustomers.find(cust => cust.id === selectedCustomerId)?.name ? `"${filteredCustomers.find(cust => cust.id === selectedCustomerId).name}"` : 'ce client'}
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
              onClick={() => deleteCustomer(selectedCustomerId)}
            >
              Oui, supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CustomerList;