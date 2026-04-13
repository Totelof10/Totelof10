import React, { createContext, useContext, useState } from 'react';

// Données fictives de produits selon la structure API
const produitsFictifs = [
  {
    id: 1,
    name: 'Produit A',
    description: 'Description du produit A',
    sku: 'SKU001',
    price: 25.00,
    purchasePrice: 15.00,
    minStockQuantity: 10,
    unite: 'kg',
    category: 'Alimentaire',
    productStatus: 'ACTIF',
    supplier: {
      id: 1,
      name: 'Fournisseur A',
      email: 'fournisseur@email.com',
    },
  },
  {
    id: 2,
    name: 'Produit B',
    description: 'Description du produit B',
    sku: 'SKU002',
    price: 35.00,
    purchasePrice: 20.00,
    minStockQuantity: 5,
    unite: 'pièce',
    category: 'Électronique',
    productStatus: 'ACTIF',
    supplier: {
      id: 2,
      name: 'Fournisseur B',
      email: 'fournisseur2@email.com',
    },
  },
  {
    id: 3,
    name: 'Produit C',
    description: 'Description du produit C',
    sku: 'SKU003',
    price: 30.00,
    purchasePrice: 18.00,
    minStockQuantity: 8,
    unite: 'litre',
    category: 'Boissons',
    productStatus: 'INACTIF',
    supplier: {
      id: 1,
      name: 'Fournisseur A',
      email: 'fournisseur@email.com',
    },
  },
];

const ProductContext = createContext();

export const useProductContext = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(produitsFictifs);

  // CRUD
  const addProduct = (product) => {
    setProducts((prev) => [
      ...prev,
      {
        ...product,
        id: Date.now(),
        supplier: product.supplier || { id: 0, name: '', email: '' },
      },
    ]);
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts((prev) =>
      prev.map((prod) =>
        prod.id === id
          ? { ...prod, ...updatedProduct, supplier: updatedProduct.supplier || prod.supplier }
          : prod
      )
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
  };

  const getProductById = (id) => {
    return products.find((prod) => prod.id === Number(id));
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
