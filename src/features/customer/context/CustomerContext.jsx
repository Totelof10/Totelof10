import React, { createContext, useContext, useState } from 'react';

const clientsFictifs = [
  {
    id: 1,
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '0601020304',
    address: '12 rue de Paris, 75001 Paris'
  },
  {
    id: 2,
    name: 'Marie Curie',
    email: 'marie.curie@email.com',
    phone: '0605060708',
    address: '5 avenue des Sciences, 75005 Paris'
  }
];

const CustomerContext = createContext();

export const useCustomerContext = () => useContext(CustomerContext);

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState(clientsFictifs);

  const addCustomer = (customer) => {
    setCustomers(prev => [
      ...prev,
      { ...customer, id: Date.now() }
    ]);
  };

  const updateCustomer = (id, updatedCustomer) => {
    setCustomers(prev =>
      prev.map(cust => cust.id === id ? { ...cust, ...updatedCustomer } : cust)
    );
  };

  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(cust => cust.id !== id));
  };

  const getCustomerById = (id) => {
    return customers.find(cust => cust.id === Number(id));
  };

  return (
    <CustomerContext.Provider value={{ customers, addCustomer, updateCustomer, deleteCustomer, getCustomerById }}>
      {children}
    </CustomerContext.Provider>
  );
}; 