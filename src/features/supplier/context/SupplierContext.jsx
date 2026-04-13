import React, { createContext, useContext, useState } from 'react';

const fournisseursFictifs = [
  {
    id: 1,
    name: 'Fournisseur A',
    email: 'fournisseur@email.com',
    phone: '0123456789',
    address: '123 Rue du Commerce, 75001 Paris'
  },
  {
    id: 2,
    name: 'Fournisseur B',
    email: 'fournisseur2@email.com',
    phone: '0987654321',
    address: "456 Avenue de l'Industrie, 69000 Lyon"
  }
];

const SupplierContext = createContext();

export const useSupplierContext = () => useContext(SupplierContext);

export const SupplierProvider = ({ children }) => {
  const [suppliers, setSuppliers] = useState(fournisseursFictifs);

  const addSupplier = (supplier) => {
    setSuppliers(prev => [
      ...prev,
      { ...supplier, id: Date.now() }
    ]);
  };

  const updateSupplier = (id, updatedSupplier) => {
    setSuppliers(prev =>
      prev.map(sup => sup.id === id ? { ...sup, ...updatedSupplier } : sup)
    );
  };

  const deleteSupplier = (id) => {
    setSuppliers(prev => prev.filter(sup => sup.id !== id));
  };

  const getSupplierById = (id) => {
    return suppliers.find(sup => sup.id === Number(id));
  };

  return (
    <SupplierContext.Provider value={{ suppliers, addSupplier, updateSupplier, deleteSupplier, getSupplierById }}>
      {children}
    </SupplierContext.Provider>
  );
}; 