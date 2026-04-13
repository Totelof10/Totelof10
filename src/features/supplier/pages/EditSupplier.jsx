import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { BsPencil, BsTruck } from 'react-icons/bs'; // Specific icons for header and card title
import API from '../../../services/API';
import { toast } from 'react-toastify';

function EditSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Removed useSupplierContext as it was not explicitly used in the original component's logic flow
  // const { updateSupplier } = useSupplierContext(); 
  const [supplier, setSupplier] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true); // Initial loading for fetching supplier data
  const [submitting, setSubmitting] = useState(false); // Separate loading state for form submission

  useEffect(() => {
    const fetchSupplier = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/suppliers/${id}`);
        if (response.status === 200) {
          setSupplier(response.data);
        } else {
          setSupplier(null); // Explicitly set to null if not found
          toast.error('Fournisseur introuvable.');
        }
      } catch (error) {
        setSupplier(null);
        toast.error('Erreur lors du chargement des informations du fournisseur.');
        console.error('Error fetching supplier:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSupplier();
  }, [id]);

  // Handle changes in form fields
  const handleChange = (field, value) => {
    setSupplier(prev => ({ ...prev, [field]: value }));
    // Clear the error for this field when its value changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form fields
  const validate = () => {
    const newErrors = {};
    if (!supplier.name?.trim()) newErrors.name = 'Le nom est obligatoire';
    if (!supplier.email?.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/\S+@\S+\.\S+/.test(supplier.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (!supplier.phone?.trim()) newErrors.phone = 'Le téléphone est obligatoire';
    if (!supplier.address?.trim()) newErrors.address = 'L\'adresse est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    setSubmitting(true); // Start submitting state
    try {
      const response = await API.put(`/suppliers/${id}`, supplier);
      if (response.status === 200) {
        // If updateSupplier from context was needed, it would go here:
        // updateSupplier(response.data); 
        toast.success('Fournisseur modifié avec succès !');
        navigate('/tiers'); // Navigate back to the tiers list
      }
    } catch (error) {
      const apiErrorMessage = error.response?.data?.message || 'Erreur lors de la modification du fournisseur.';
      toast.error(apiErrorMessage);
      console.error('Error updating supplier:', error);
    } finally {
      setSubmitting(false); // End submitting state
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    navigate('/tiers');
  };

  // Loading state while fetching supplier data
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700">Chargement des informations du fournisseur...</p>
        </div>
      </div>
    );
  }

  // Supplier not found state after loading
  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md max-w-md text-center">
          <h4 className="text-2xl font-bold mb-2">Fournisseur introuvable</h4>
          <p className="text-lg mb-4">Désolé, le fournisseur que vous tentez de modifier n'existe pas ou a été supprimé.</p>
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
      <div className="w-full max-w-4xl flex items-center mb-6 md:mb-8">
        <button
          className="p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 mr-4 transition-colors"
          onClick={handleCancel}
          disabled={submitting} // Disable during submission
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 flex items-center">
            <BsPencil className="text-blue-600 mr-3 text-4xl" />
            Modifier le fournisseur
          </h1>
          <p className="text-gray-600 text-lg md:text-xl">Modifiez les informations du fournisseur</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center">
          <BsTruck className="mr-2 text-xl" />
          <h2 className="text-xl font-semibold">Informations du fournisseur</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="name">
                <FaUser className="inline-block mr-2 text-gray-500" />Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                className={`w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                value={supplier.name || ''} // Ensure controlled component even if null
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Nom du fournisseur"
                required
                disabled={submitting}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                <FaEnvelope className="inline-block mr-2 text-gray-500" />Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                value={supplier.email || ''}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="Email du fournisseur"
                required
                disabled={submitting}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="phone">
                <FaPhone className="inline-block mr-2 text-gray-500" />Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                className={`w-full px-4 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                value={supplier.phone || ''}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="Téléphone"
                required
                disabled={submitting}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Address */}
            <div className="md:col-span-2"> {/* Full width on medium screens and up */}
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="address">
                <FaMapMarkerAlt className="inline-block mr-2 text-gray-500" />Adresse <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                className={`w-full px-4 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                value={supplier.address || ''}
                onChange={e => handleChange('address', e.target.value)}
                placeholder="Adresse complète"
                rows="3"
                required
                disabled={submitting}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-gray-50 p-6 flex justify-end space-x-3 rounded-b-lg border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg text-lg font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors flex items-center"
              onClick={handleCancel}
              disabled={submitting}
            >
              <FaTimes className="mr-2" /> Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Modification...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSupplier;