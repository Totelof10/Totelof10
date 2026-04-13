import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { BsPlusCircle, BsTruck } from 'react-icons/bs'; // Specific icons for header and card title
import API from '../../../services/API';
import { toast } from 'react-toastify';

function CreateSupplier() {
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // State for form submission loading

  const handleChange = (field, value) => {
    setSupplier(prev => ({ ...prev, [field]: value }));
    // Clear the error for this field when its value changes
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!supplier.name.trim()) newErrors.name = 'Le nom est obligatoire';
    if (!supplier.contactPerson.trim()) newErrors.contactPerson = 'Le contact est obligatoire';
    if (!supplier.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!/\S+@\S+\.\S+/.test(supplier.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (!supplier.phone.trim()) newErrors.phone = 'Le téléphone est obligatoire';
    if (!supplier.address.trim()) newErrors.address = 'L\'adresse est obligatoire';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    setLoading(true); // Start loading state
    try {
      const response = await API.post('/suppliers', supplier);
      if ([200, 201, 204].includes(response.status)) {
        toast.success('Fournisseur créé avec succès !', {
          autoClose: 2000,
          onClose: () => navigate('/tiers') // Navigate after toast disappears
        });
      } else {
        toast.error('Erreur lors de la création du fournisseur. Veuillez réessayer.', {
          autoClose: 2000,
        });
      }
    } catch (error) {
      const apiErrorMessage = error.response?.data?.message || 'Erreur lors de la création du fournisseur.';
      toast.error(apiErrorMessage, {
        autoClose: 2000,
      });
      console.error('Error creating supplier:', error);
    } finally {
      setLoading(false); // End loading state
    }
  };

  const handleCancel = () => {
    navigate('/tiers');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col items-center">
      {/* Header Section */}
      <div className="w-full max-w-4xl flex items-center mb-6 md:mb-8">
        <button
          className="p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 mr-4 transition-colors"
          onClick={handleCancel}
          disabled={loading} // Disable during submission
        >
          <FaArrowLeft className="text-xl" />
        </button>
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 flex items-center">
            <BsPlusCircle className="text-blue-600 mr-3 text-4xl" />
            Créer un fournisseur
          </h1>
          <p className="text-gray-600 text-lg md:text-xl">Ajoutez un nouveau partenaire à votre base fournisseurs</p>
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
                value={supplier.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Nom du fournisseur"
                required
                disabled={loading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="contactPerson">
                <FaUser className="inline-block mr-2 text-gray-500" />Contact <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="contactPerson"
                className={`w-full px-4 py-2 border ${errors.contactPerson ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                value={supplier.contactPerson}
                onChange={e => handleChange('contactPerson', e.target.value)}
                placeholder="Contact du fournisseur"
                required
                disabled={loading}
              />
              {errors.contactPerson && <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>}
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
                value={supplier.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="Email du fournisseur"
                required
                disabled={loading}
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
                value={supplier.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="Téléphone"
                required
                disabled={loading}
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
                value={supplier.address}
                onChange={e => handleChange('address', e.target.value)}
                placeholder="Adresse complète"
                rows="3"
                required
                disabled={loading}
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
              disabled={loading}
            >
              <FaTimes className="mr-2" /> Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Création...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> Créer le fournisseur
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateSupplier;