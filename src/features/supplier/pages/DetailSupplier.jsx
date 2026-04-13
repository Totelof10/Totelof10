import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import { BsTruck } from 'react-icons/bs'; // Specific icon for supplier header
import API from '../../../services/API';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

function DetailSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/suppliers/${id}`);
        if (response.status === 200) {
          setSupplier(response.data);
        } else {
          setSupplier(null); // Explicitly set to null if not found or other status
          toast.error('Fournisseur introuvable.');
        }
      } catch (error) {
        setSupplier(null);
        toast.error('Erreur lors du chargement des détails du fournisseur.');
        console.error('Error fetching supplier details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSupplier();
  }, [id]);

  const handleDelete = (supplierId) => {
    setSelectedSupplierId(supplierId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/suppliers/${selectedSupplierId}`);
      setShowDeleteModal(false);
      toast.success('Fournisseur supprimé avec succès', { autoClose: 1200 });
      navigate('/tiers'); // Navigate to the Tiers list after successful deletion
    } catch (error) {
      toast.error('Erreur lors de la suppression du fournisseur');
      console.error('Error deleting supplier:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700">Chargement des détails du fournisseur...</p>
        </div>
      </div>
    );
  }

  // Supplier not found state
  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md max-w-md text-center">
          <h4 className="text-2xl font-bold mb-2">Fournisseur introuvable</h4>
          <p className="text-lg mb-4">Désolé, le fournisseur que vous recherchez n'existe pas ou a été supprimé.</p>
          <button
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            onClick={() => navigate('/tiers')}
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col items-center">
      {/* Header Section */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6 md:mb-8">
        <div className="flex items-center">
          <button
            className="p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 mr-4 transition-colors"
            onClick={() => navigate('/tiers')}
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 flex items-center">
              <BsTruck className="text-blue-s00 mr-3 text-4xl" /> {/* Adjusted icon color */}
              Détail du fournisseur
            </h1>
            <p className="text-gray-600 text-lg md:text-xl">Informations complètes sur le partenaire</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center text-base"
            onClick={() => navigate(`/supplier/${supplier.id}/edit`)}
          >
            <FaEdit className="mr-2" /> Modifier
          </button>
          <button
            className="px-5 py-2 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center text-base"
            onClick={() => handleDelete(supplier.id)}
          >
            <FaTrash className="mr-2" /> Supprimer
          </button>
        </div>
      </div>

      {/* Supplier Detail Card */}
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-lg overflow-hidden flex flex-col">
        {/* Card Header */}
        <div className="bg-blue-600 text-white p-5 flex items-center rounded-t-lg">
          <FaUser className="mr-4 text-4xl" />
          <div>
            <h2 className="text-3xl font-extrabold">{supplier.name}</h2>
            <p className="text-blue-100 text-sm">Fournisseur</p>
          </div>
        </div>

        {/* Card Body with Information Grid */}
        <div className="bg-gray-50 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="bg-white rounded-lg p-4 shadow-sm flex items-center transition-transform hover:scale-105 duration-200">
            <FaEnvelope className="mr-4 text-blue-500 text-3xl" />
            <div>
              <p className="font-bold text-gray-800 text-lg">Email</p>
              <p className="text-gray-600 break-words">{supplier.email}</p>
            </div>
          </div>
          {/* Phone */}
          <div className="bg-white rounded-lg p-4 shadow-sm flex items-center transition-transform hover:scale-105 duration-200">
            <FaPhone className="mr-4 text-green-500 text-3xl" />
            <div>
              <p className="font-bold text-gray-800 text-lg">Téléphone</p>
              <p className="text-gray-600">{supplier.phone}</p>
            </div>
          </div>
          {/* Contact Person */}
          <div className="bg-white rounded-lg p-4 shadow-sm flex items-center transition-transform hover:scale-105 duration-200">
            <FaUser className="mr-4 text-orange-500 text-3xl" />
            <div>
              <p className="font-bold text-gray-800 text-lg">Personne de Contact</p>
              <p className="text-gray-600">{supplier.contactPerson}</p>
            </div>
          </div>
          {/* Address */}
          <div className="bg-white rounded-lg p-4 shadow-sm flex items-center transition-transform hover:scale-105 duration-200">
            <FaMapMarkerAlt className="mr-4 text-red-500 text-3xl" />
            <div>
              <p className="font-bold text-gray-800 text-lg">Adresse</p>
              <p className="text-gray-600 break-words">{supplier.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
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
          <FaTrash className="text-red-500 mb-4 text-5xl" />
          <h4 className="text-2xl font-bold text-gray-800 mb-3">Confirmer la suppression</h4>
          <p className="text-gray-600 mb-6">
            Voulez-vous vraiment supprimer ce fournisseur ? Cette action est irréversible.
          </p>
          <div className="flex justify-center space-x-4 mt-6">
            <button
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
              onClick={() => setShowDeleteModal(false)}
            >
              Non, annuler
            </button>
            <button
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              onClick={confirmDelete}
            >
              Oui, supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DetailSupplier;