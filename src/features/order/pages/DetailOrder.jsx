import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import API from '../../../services/API'; // Ensure this path is correct
import { toast } from 'react-toastify';
import ModalDialogue from './ModalDialogue'; // Ensure this component is also styled with Tailwind
import NotFoundPage from '../../../components/NotFoundPage';

const STATUSES = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'PROCESSING', label: 'En cours de traitement' },
  { value: 'SHIPPED', label: 'Expédié' },
  { value: 'DELIVERED', label: 'Livré' },
  { value: 'CANCELLED', label: 'Annulé' },
  { value: 'RETURNED', label: 'Retourné' },
  { value: 'COMPLETED_RETURN', label: 'Retour complété' },
  { value: 'PARTIALLY_PAID', label: 'Partiellement payé' },
  { value: 'PAID', label: 'Payé' },
];

const RETURN_STATUSES = [
  { value: 'CONFORME', label: 'Conforme' },
  { value: 'ENDOMMAGE', label: 'Endommagé' },
];

// Utility function for transaction type badge classes (Tailwind)
const transactionTypeBadge = (type) => {
  switch (type) {
    case 'PAYMENT': return 'bg-green-500 text-white';
    case 'REFUND': return 'bg-yellow-500 text-gray-800';
    case 'ADJUSTMENT': return 'bg-blue-500 text-white';
    case 'CONFORME': return 'bg-purple-500 text-white';
    case 'ENDOMMAGE': return 'bg-red-500 text-white';
    default: return 'bg-gray-400 text-white';
  }
};

const transactionTypeLabel = (type) => {
  switch (type) {
    case 'PAYMENT': return 'Paiement';
    case 'REFUND': return 'Remboursement';
    case 'ADJUSTMENT': return 'Ajustement';
    case 'CONFORME': return 'Retour conforme';
    case 'ENDOMMAGE': return 'Retour endommagé'
    default: return type || '-';
  }
};

// Utility function for transaction row background color (Tailwind)
const transactionRowClass = (tx) => {
  switch (tx.type) {
    case 'PAYMENT': return tx.paymentStatus === 'COMPLETED' ? 'bg-green-50' : 'bg-gray-50';
    case 'REFUND': return 'bg-yellow-50';
    case 'ADJUSTMENT': return 'bg-blue-50';
    case 'RETURN': return 'bg-purple-50';
    default: return 'bg-gray-50';
  }
};

function DetailOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [refundTotal, setRefundTotal] = useState(null)
  const [status, setStatus] = useState('PENDING');
  const [cashAmount, setCashAmount] = useState('');
  const [returns, setReturns] = useState([]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [modal, setModal] = useState({ show: false, type: '', loading: false });
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/orders/${id}`);
        console.log('API response full order:', response.data);
        console.log('Transactions in response:', response.data.transactions);
        console.log('Order total:', response.data.totalAmount);
        setOrder(response.data);
        setTransactions(response.data.transactions || []);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Erreur lors de la récupération de la commande.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    const fetchRefundTotal = async () => {
      try {
        const response = await API.get(`/transaction/refund-total/${id}`);
        setRefundTotal(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération du total des remboursements :', error);
        setRefundTotal(0);
      }
    };

    if (id) {
      fetchRefundTotal();
    }
  }, [id]);

  useEffect(() => {
    // This useEffect is redundant if transactions are already fetched with the order.
    // Keep it only if you have a separate endpoint for transactions that needs to be called.
    // Otherwise, rely on transactions coming with the order object.
    const fetchTransactions = async () => {
      try {
        const response = await API.get(`/orders/${id}/transactions`);
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    if (!order) { // Only fetch separately if order wasn't fully loaded initially
       fetchTransactions();
    }
  }, [id, order]);


  useEffect(() => {
    if (order && order.orderItems) {
      setStatus(order.status);
      setReturns(order.orderItems.map(item => ({
        orderItemId: item.id,
        quantity: 0,
        status: '',
        alreadyReturned: item.returnedQuantity || 0,
        totalOrdered: item.quantity || 0
      })));
    }
  }, [order]);

  useEffect(() => {
    const fetchNetPaidAmount = async () => {
      if (order) {
        try {
          const response = await API.get(`/orders/${order.id}/net-paid-amount`);
          const netPaid = response.data;
          setRemainingAmount(Math.max(0, order.totalAmount - netPaid)); // Remaining = Total - Net Paid
        } catch (error) {
          console.error('Error fetching net paid amount:', error);
          // Fallback: calculate from transactions if API call fails
          if (transactions && transactions.length > 0) {
            const totalPaid = transactions.reduce((sum, tx) => {
              return sum + (tx.type === 'PAYMENT' && tx.paymentStatus === 'COMPLETED' ? tx.amount : 0);
            }, 0);
            setRemainingAmount(Math.max(0, order.totalAmount - totalPaid));
          } else {
            setRemainingAmount(order.totalAmount || 0); // If no transactions, remaining is total order amount
          }
        }
      }
    };
    
    fetchNetPaidAmount();
  }, [order, transactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-700">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    // If order is null after loading, it means it wasn't found or an error occurred.
    // A direct navigation might be too abrupt; consider rendering NotFoundPage directly or a more graceful error.
    return <NotFoundPage />; // Or navigate('/not-found');
  }

  const openModal = (type, action) => {
    setPendingAction(() => action);
    setModal({ show: true, type, loading: false });
  };
  const closeModal = () => {
    setModal({ show: false, type: '', loading: false });
    setPendingAction(null);
    setCashAmount(''); // Clear cash amount on modal close
  };

  const handleStatusUpdate = async () => {
    openModal('status', async () => {
      setModal(m => ({ ...m, loading: true }));
      try {
        await API.put(`/orders/${order.id}/status?newStatus=${status}`);
        const response = await API.get(`/orders/${id}`); // Re-fetch for updated data
        setOrder(response.data);
        setTransactions(response.data.transactions || []);
        toast.success('Statut mis à jour avec succès');
      } catch (error) {
        console.error('Error updating status:', error);
        toast.error('Erreur lors de la mise à jour du statut.');
      } finally {
        closeModal();
      }
    });
  };

  const handleReturnChange = (idx, field, value) => {
    setReturns(currentReturns => {
      if (idx < 0 || idx >= currentReturns.length) return currentReturns;
      return currentReturns.map((r, i) => {
        if (i === idx) {
          const updatedReturn = { ...r, [field]: field === 'quantity' ? Number(value) : value };
          // Ensure quantity doesn't exceed remaining
          if (field === 'quantity' && updatedReturn.quantity > (updatedReturn.totalOrdered - updatedReturn.alreadyReturned)) {
            updatedReturn.quantity = (updatedReturn.totalOrdered - updatedReturn.alreadyReturned);
          }
          return updatedReturn;
        }
        return r;
      });
    });
  };

  const handleProcessReturns = async () => {
    openModal('returns', async () => {
      setModal(m => ({ ...m, loading: true }));
      try {
        const validReturns = returns.filter(r =>
          r.quantity > 0 &&
          r.status &&
          r.quantity <= (r.totalOrdered - r.alreadyReturned)
        ).map(r => ({
          orderItemId: r.orderItemId,
          quantity: r.quantity,
          status: r.status
        }));

        if (validReturns.length === 0) {
          toast.warn('Aucun retour valide à traiter.');
          closeModal();
          return;
        }

        await API.post(`/orders/${order.id}/process-returns`, validReturns);
        const response = await API.get(`/orders/${id}`); // Re-fetch for updated data
        setOrder(response.data);
        setTransactions(response.data.transactions || []);
        toast.success('Retours traités avec succès.');
      } catch (error) {
        console.error('Error processing returns:', error);
        toast.error(error?.response?.data?.message || 'Erreur lors du traitement des retours.');
      } finally {
        closeModal();
      }
    });
  };

  const handlePayCash = async () => {
    openModal('pay', async () => {
      setModal(m => ({ ...m, loading: true }));
      const amountToPay = parseFloat(cashAmount);
      if (isNaN(amountToPay) || amountToPay <= 0) {
        toast.warn('Veuillez saisir un montant valide.');
        closeModal();
        return;
      }
      
      try {
        await API.post(`/orders/${order.id}/pay-cash`, {
          amount: amountToPay
        });
        setCashAmount('');
        const orderResponse = await API.get(`/orders/${id}`); // Re-fetch for updated data
        setOrder(orderResponse.data);
        setTransactions(orderResponse.data.transactions || []);
        toast.success('Paiement en espèces enregistré avec succès.');
      } catch (error) {
        console.error('Error recording payment:', error);
        toast.error('Erreur lors de l\'enregistrement du paiement.');
      } finally {
        closeModal();
      }
    });
  };

  const handleReturn = () => {
    navigate('/orders');
  };

  const handleModalConfirm = async () => {
    if (pendingAction) {
      await pendingAction();
    }
  };

  const modalConfig = {
    status: {
      title: 'Confirmation du changement de statut',
      message: `Voulez-vous vraiment changer le statut de la commande en « ${STATUSES.find(s => s.value === status)?.label || status} » ?`,
      confirmText: 'Oui, changer le statut',
    },
    returns: {
      title: 'Confirmation du traitement des retours',
      message: 'Voulez-vous vraiment traiter les retours sélectionnés pour cette commande ?',
      confirmText: 'Oui, traiter les retours',
    },
    pay: {
      title: 'Confirmation du paiement',
      message: `Confirmer le paiement en espèces de ${parseFloat(cashAmount || 0).toFixed(2)} MGA ?`,
      confirmText: 'Oui, enregistrer le paiement',
    },
  };

  const isReturnDisabled = order?.orderItems?.every(item => item.quantity - (item.returnedQuantity || 0) <= 0) || status === 'COMPLETED_RETURN';

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8 pb-20 md:pb-24">
      {/* Confirmation Modal */}
      <ModalDialogue
        show={modal.show}
        title={modalConfig[modal.type]?.title || 'Confirmer l\'action'}
        message={modalConfig[modal.type]?.message || 'Voulez-vous confirmer cette action ?'}
        onConfirm={handleModalConfirm}
        onCancel={closeModal}
        confirmText={modalConfig[modal.type]?.confirmText || 'Confirmer'}
        loading={modal.loading}
      />

      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        {/* Main Section: Order Details */}
        <div className="flex-1 min-w-0">
          <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center mb-6">
              <button
                onClick={handleReturn}
                className="flex items-center justify-center p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors mr-4"
                aria-label="Retour à la liste des commandes"
              >
                <FaArrowLeft size={18} />
              </button>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800">
                Détail de la commande <span className="text-blue-600">{order.orderNumber}</span>
              </h1>
            </div>

            {/* Order Summary */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200 text-blue-900">
              <h3 className="text-lg font-semibold mb-3">Résumé de la commande</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <strong className="font-medium text-gray-700">Client :</strong> {order.customerName || 'N/A'}
                </div>
                <div>
                  <strong className="font-medium text-gray-700">Date :</strong> {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                </div>
                <div>
                  <strong className="font-medium text-gray-700">Statut :</strong>{' '}
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${transactionTypeBadge(order.status)}`}>
                    {STATUSES.find(s => s.value === status)?.label || 'Inconnu'}
                  </span>
                </div>
                <div>
                  <strong className="font-medium text-gray-700">Total :</strong>{' '}
                  <span className="font-bold">{order.totalAmount?.toFixed(2)} MGA</span>
                </div>
                <div>
                  <strong className="font-medium text-gray-700">Remise :</strong>{' '}
                  <span className="font-bold text-red-600">-{order.discountAmount?.toFixed(2)} MGA</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Articles de la commande</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix unitaire</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sous-total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.orderItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.unitPrice?.toFixed(2)} MGA</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.subtotal?.toFixed(2)} MGA</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Update Status */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Mettre à jour le statut</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status-select" className="sr-only">Sélectionner le statut</label>
                  <select
                    id="status-select"
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                  >
                    {STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={handleStatusUpdate}
                    disabled={status === 'PAID' || status === 'COMPLETED_RETURN'}
                  >
                    Mettre à jour
                  </button>
                </div>
              </div>
            </div>

            {/* Cash Payment */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Paiement en espèces</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cash-amount" className="sr-only">Montant</label>
                  <input
                    type="number"
                    id="cash-amount"
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    min="0"
                    step="0.01" // Allow decimal for currency
                    value={cashAmount}
                    onChange={e => setCashAmount(e.target.value)}
                    placeholder="Montant (MGA)"
                  />
                </div>
                <div>
                  <button
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={handlePayCash}
                    disabled={
                      !cashAmount ||
                      parseFloat(cashAmount) <= 0 ||
                      status === 'PAID' || // Consider if you want to allow overpayment or additional payments
                      status === 'COMPLETED_RETURN' ||
                      (order.totalAmount - remainingAmount) <= 0 // Disable if nothing left to pay
                    }
                  >
                    Enregistrer le paiement
                  </button>
                </div>
              </div>
            </div>

            {/* Process Returns */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Traiter un retour</h3>
              {isReturnDisabled ? (
                <div className="bg-blue-100 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0v2H7a1 1 0 110-2h2V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                  <span>Tous les articles ont déjà été retournés ou la commande est dans un état final. Aucun retour supplémentaire n'est possible.</span>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); handleProcessReturns(); }}>
                  <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm mb-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commandée</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Déjà retournée</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restant</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qté à retourner</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut du retour</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.orderItems.map((item, idx) => {
                          const r = returns[idx] || {};
                          const remainingForReturn = (item.quantity || 0) - (item.returnedQuantity || 0);
                          return (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.quantity}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.returnedQuantity || 0}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-700">{remainingForReturn}</td>
                              <td className="px-2 py-2">
                                <input
                                  type="number"
                                  className="block w-full py-1.5 px-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                  min="0"
                                  max={remainingForReturn}
                                  value={r.quantity || ''}
                                  onChange={e => handleReturnChange(idx, 'quantity', e.target.value)}
                                  disabled={remainingForReturn === 0}
                                />
                              </td>
                              <td className="px-2 py-2">
                                <select
                                  className="block w-full py-1.5 px-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                  value={r.status || ''}
                                  onChange={e => handleReturnChange(idx, 'status', e.target.value)}
                                  disabled={remainingForReturn === 0}
                                >
                                  <option value="">Choisir...</option>
                                  {RETURN_STATUSES.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={returns.filter(r => r.quantity > 0 && r.status && r.quantity <= (r.totalOrdered - r.alreadyReturned)).length === 0}
                  >
                    Valider les retours
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Section: Transactions */}
        <div className="w-full lg:w-1/3 flex-shrink-0">
          <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Transactions</h2>
            </div>

            {/* Remaining Amount */}
            <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-lg mb-6">
              <h4 className="text-lg font-semibold mb-2">Montant restant à payer</h4>
              <p className="text-3xl font-extrabold text-blue-600 mb-2">
                {order.totalAmount - remainingAmount} MGA
              </p>
              <p className="text-xs text-blue-700">
                Total commande: {order.totalAmount + refundTotal} MGA
              </p>
              <p className="text-xs text-red-700">
                Valeur des retours: {refundTotal} MGA           
              </p>
            </div>

            {/* Transaction History */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Historique des transactions</h4>
              {transactions.length === 0 ? (
                <div className="text-gray-500 text-center py-6 border border-dashed border-gray-300 rounded-md">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
                  <p className="mt-2 text-sm">Aucune transaction enregistrée</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map(tx => (
                        <tr key={tx.id} className={`${transactionRowClass(tx)} hover:bg-gray-100 transition-colors`}>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">{new Date(tx.transactionDate).toLocaleDateString('fr-FR')}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{tx.amount?.toFixed(2)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${transactionTypeBadge(tx.type)}`}>
                              {transactionTypeLabel(tx.type)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Résumé financier</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total commande</p>
                  <p className="font-bold text-gray-900">{order.totalAmount?.toFixed(2)} MGA</p>
                </div>
                <div>
                  <p className="text-gray-600">Déjà payé</p>
                  <p className="font-bold text-green-600">{remainingAmount.toFixed(2)} MGA</p>
                </div>
                <div>
                  <p className="text-gray-600">Remise</p>
                  <p className="font-bold text-red-600">-{order.discountAmount?.toFixed(2)} MGA</p>
                </div>
                <div>
                  <p className="text-gray-600">Restant</p>
                  <p className="font-bold text-blue-600">{(order.totalAmount - remainingAmount)?.toFixed(2)} MGA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailOrder;