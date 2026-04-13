import React, { useState } from 'react';
import SupplierList from '../supplier/pages/SupplierList'; // Assuming path from Tiers to SupplierList
import CustomerList from '../customer/pages/CustomerList'; // Assuming path from Tiers to CustomerList
import { BsPeople, BsSearch } from 'react-icons/bs'; // Using specific Bi icons for consistency

function Tiers() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gray-100 p-6 sm:p-8 md:p-10 lg:p-12"> {/* Responsive padding */}
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 flex items-center">
          <BsPeople className="text-blue-600 mr-3 text-4xl" />
          Tiers
        </h1>
        <p className="text-gray-600 text-lg md:text-xl">Gérez vos fournisseurs et clients depuis une seule page</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto">
        <div className="relative flex items-center shadow-sm">
          <span className="absolute left-0 pl-4 text-gray-400">
            <BsSearch className="text-xl" />
          </span>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="Rechercher un client ou un fournisseur (nom, email, téléphone, adresse...)"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Supplier and Customer Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> {/* Responsive grid layout */}
        {/* Suppliers Card */}
        <div>
          <div className="bg-white shadow-lg rounded-lg h-full overflow-hidden">
            <div className="bg-teal-600 text-white p-4 rounded-t-lg flex items-center">
              <BsPeople className="mr-2 text-2xl" /> {/* Replaced BiTruck with BsPeople for generic "Tiers" page */}
              <h2 className="text-xl font-semibold mb-0">Fournisseurs</h2>
            </div>
            <div className="p-0"> {/* p-0 for SupplierList to manage its own padding */}
              <SupplierList searchTerm={searchTerm} />
            </div>
          </div>
        </div>
        
        {/* Customers Card */}
        <div>
          <div className="bg-white shadow-lg rounded-lg h-full overflow-hidden">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center">
              <BsPeople className="mr-2 text-2xl" />
              <h2 className="text-xl font-semibold mb-0">Clients</h2>
            </div>
            <div className="p-0"> {/* p-0 for CustomerList to manage its own padding */}
              <CustomerList searchTerm={searchTerm} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tiers;