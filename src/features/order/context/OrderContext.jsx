import React, { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

// Données de test pour les commandes
const initialOrdersData = [
  {
    id: 1,
    orderNumber: "ORD-123456",
    orderDate: "2024-01-15T10:30:00",
    status: "RETURNED",
    totalAmount: 40.00,
    discountAmount: 10.00,
    customer: {
      id: 1,
      name: "Jean Dupont",
      email: "jean.dupont@email.com"
    },
    orderItems: [
      {
        id: 1,
        quantity: 2,
        unitPrice: 25.00,
        subtotal: 50.00,
        productId: 1,
        productName: "Produit A"
      }
    ]
  },
  {
    id: 2,
    orderNumber: "ORD-123457",
    orderDate: "2024-01-20T14:15:00",
    status: "DELIVERED",
    totalAmount: 120.00,
    discountAmount: 0.00,
    customer: {
      id: 2,
      name: "Marie Curie",
      email: "marie.curie@email.com"
    },
    orderItems: [
      {
        id: 2,
        quantity: 3,
        unitPrice: 40.00,
        subtotal: 120.00,
        productId: 2,
        productName: "Produit B"
      }
    ]
  },
  {
    id: 3,
    orderNumber: "ORD-123458",
    orderDate: "2024-02-01T09:45:00",
    status: "PENDING",
    totalAmount: 75.00,
    discountAmount: 5.00,
    customer: {
      id: 3,
      name: "Pierre Martin",
      email: "pierre.martin@email.com"
    },
    orderItems: [
      {
        id: 3,
        quantity: 5,
        unitPrice: 15.00,
        subtotal: 75.00,
        productId: 3,
        productName: "Produit C"
      }
    ]
  },
  {
    id: 4,
    orderNumber: "ORD-123459",
    orderDate: "2024-02-10T16:30:00",
    status: "PAID",
    totalAmount: 200.00,
    discountAmount: 20.00,
    customer: {
      id: 4,
      name: "Sophie Bernard",
      email: "sophie.bernard@email.com"
    },
    orderItems: [
      {
        id: 4,
        quantity: 2,
        unitPrice: 100.00,
        subtotal: 200.00,
        productId: 4,
        productName: "Produit D"
      }
    ]
  },
  {
    id: 5,
    orderNumber: "ORD-123460",
    orderDate: "2024-02-15T11:20:00",
    status: "PROCESSING",
    totalAmount: 90.00,
    discountAmount: 0.00,
    customer: {
      id: 5,
      name: "Lucas Dubois",
      email: "lucas.dubois@email.com"
    },
    orderItems: [
      {
        id: 5,
        quantity: 6,
        unitPrice: 15.00,
        subtotal: 90.00,
        productId: 3,
        productName: "Produit C"
      }
    ]
  }
];

// Données de test pour les transactions
const initialTransactionsData = [
  {
    id: 1,
    amount: 20.00,
    paymentMethod: "CASH",
    paymentStatus: "COMPLETED",
    paymentDate: "2024-01-15T14:30:00",
    orderId: 1
  },
  {
    id: 2,
    amount: 20.00,
    paymentMethod: "CASH",
    paymentStatus: "COMPLETED",
    paymentDate: "2024-01-16T10:00:00",
    orderId: 1
  },
  {
    id: 3,
    amount: 10.00,
    paymentMethod: "CASH",
    paymentStatus: "COMPLETED",
    paymentDate: "2024-01-16T10:00:00",
    orderId: 1
  }
];

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(initialOrdersData);
  const [transactions, setTransactions] = useState(initialTransactionsData);
  const [loading, setLoading] = useState(false);

  // Fonctions pour gérer les commandes
  const addOrder = (newOrder) => {
    const orderWithId = {
      ...newOrder,
      id: Math.max(...orders.map(o => o.id)) + 1,
      orderNumber: `ORD-${String(Date.now()).slice(-6)}`,
      orderDate: new Date().toISOString(),
      status: 'PENDING'
    };
    setOrders(prev => [...prev, orderWithId]);
    return orderWithId;
  };

  const updateOrder = (id, updates) => {
    setOrders(prev => prev.map(order => 
      order.id === id ? { ...order, ...updates } : order
    ));
  };

  const deleteOrder = (id) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  const getOrderById = (id) => {
    return orders.find(order => order.id === parseInt(id));
  };

  // Fonctions pour gérer les transactions
  const addTransaction = (newTransaction) => {
    const transactionWithId = {
      ...newTransaction,
      id: Math.max(...transactions.map(t => t.id)) + 1,
      paymentDate: new Date().toISOString()
    };
    setTransactions(prev => [...prev, transactionWithId]);
    return transactionWithId;
  };

  const getTransactionsByOrderId = (orderId) => {
    return transactions.filter(tx => tx.orderId === parseInt(orderId));
  };

  // Fonctions pour gérer les retours
  const processReturns = (orderId, returns) => {
    console.log('Traitement des retours pour la commande', orderId, returns);
    // Ici on pourrait mettre à jour le statut de la commande
    updateOrder(orderId, { status: 'RETURNED' });
  };

  const value = {
    orders,
    transactions,
    loading,
    addOrder,
    updateOrder,
    deleteOrder,
    getOrderById,
    addTransaction,
    getTransactionsByOrderId,
    processReturns
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders doit être utilisé dans un OrderProvider');
  }
  return context;
}; 