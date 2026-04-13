import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../../services/API'; // Ensure this path is correct
import { toast } from 'react-toastify'; // Added toast for better UX than alert

// Utility function to convert amount to words (kept as is, no Tailwind involved)
function convertToWords(amount) {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  const hundreds = ['', 'cent', 'deux cents', 'trois cents', 'quatre cents', 'cinq cents', 'six cents', 'sept cents', 'huit cents', 'neuf cents'];
  const thousands = ['', 'mille', 'deux mille', 'trois mille', 'quatre mille', 'cinq mille', 'six mille', 'sept mille', 'huit mille', 'neuf mille'];

  function convertNumberToWords(num) {
    if (num === 0) return 'zéro';
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      if (num % 10 === 0) return tens[Math.floor(num / 10)];
      if (num < 70) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + units[num % 10] : '');
      if (num < 80) return 'soixante-' + teens[num - 60];
      if (num < 90) return 'quatre-vingt' + (num % 10 !== 0 ? '-' + units[num % 10] : '');
      return 'quatre-vingt-dix-' + units[num - 90];
    }
    if (num < 1000) {
      const hundredsPart = Math.floor(num / 100);
      const remainder = num % 100;
      let result = hundredsPart === 1 ? 'cent' : hundreds[hundredsPart]; // Handle 'cent' vs 'deux cents'
      if (hundredsPart > 1 && remainder === 0) result += 's'; // 'deux cents'
      if (remainder !== 0) result += ' ' + convertNumberToWords(remainder);
      return result;
    }
    if (num < 10000) { // Handles up to 9999
      const thousandsPart = Math.floor(num / 1000);
      const remainder = num % 1000;
      let result = (thousandsPart === 1 ? 'mille' : units[thousandsPart] + ' mille');
      if (remainder !== 0) {
        result += ' ' + convertNumberToWords(remainder);
      }
      return result;
    }
    // For numbers > 9999, original function returns string.
    // For a real app, you'd extend this or use a library.
    return num.toString();
  }

  const integerPart = Math.floor(amount);
  let result = convertNumberToWords(integerPart);
  
  result += ' Ariary';

  // Add centimes if applicable
  const decimalPart = Math.round((amount - integerPart) * 100);
  if (decimalPart > 0) {
    result += ' et ' + convertNumberToWords(decimalPart) + ' centimes';
  }

  return result;
}

function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await API.get(`/orders/${id}`);
        console.log('API response order for invoice:', response.data);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order for invoice:', error);
        toast.error('Erreur lors du chargement de la commande pour la facture.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-700">Chargement de la facture...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur !</strong>
          <span className="block sm:inline ml-2">Commande introuvable.</span>
        </div>
      </div>
    );
  }
  
  const handlePrint = () => {
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        toast.error('Veuillez autoriser les popups pour imprimer la facture.');
        return;
      }

      // Tailwind CSS for print
      const tailwindCSS = `
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          @page {
            size: A4;
            margin: 0.5in; /* Standard margin for printing */
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide non-print elements */
          .no-print {
            display: none !important;
          }
          /* Custom print styles to override Tailwind for specific elements if needed */
          .print-small-text {
            font-size: 10px !important;
            line-height: 1.2 !important;
          }
          .print-xsmall-text {
            font-size: 8px !important;
            line-height: 1.1 !important;
          }
          .table th, .table td {
            padding: 4px !important;
            font-size: 9px !important;
          }
          .signature-box {
            border: 1px solid #6b7280; /* Tailwind gray-500 equivalent */
            min-height: 40px;
            padding: 8px;
            border-radius: 4px;
          }
          /* Adjust A4 page width for visual consistency, though @page sets actual print size */
          .invoice-container-a4 {
              width: 210mm; /* A4 width */
              max-width: 210mm;
              box-shadow: none !important; /* No shadow on print */
              border: none !important; /* No border on print */
          }
        </style>
      `;

      const printContent = `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <title>Facture ${order.orderNumber}</title>
            <meta charset="utf-8">
            ${tailwindCSS}
          </head>
          <body class="p-6 text-gray-800 text-sm leading-tight">
            <div class="header text-center mb-8">
              <h1 class="text-2xl font-bold text-blue-600 mb-4">Bon de livraison - ${order.orderNumber}</h1>
            </div>
            
            <div class="flex justify-between mb-8">
              <div class="w-1/2 pr-4">
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <h2 class="text-lg font-semibold text-blue-600 mb-2">Tsena Rakotonirina</h2>
                  <div class="text-xs print-small-text">
                    <div><strong class="font-medium">Nom :</strong> Sanda</div>
                    <div><strong class="font-medium">Adresse :</strong> Alasora Commune</div>
                    <div><strong class="font-medium">Ville :</strong> Antananarivo 103</div>
                    <div><strong class="font-medium">Téléphone :</strong> +261 34 76 368 86</div>
                    <div><strong class="font-medium">Email :</strong> rakotonirinasanda@gmail.com</div>
                    <div><strong class="font-medium">NIF :</strong> 123 456 789 00012</div>
                    <div><strong class="font-medium">STAT :</strong> FR12345678901</div>
                  </div>
                </div>
              </div>
              <div class="w-1/2 pl-4">
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <h2 class="text-lg font-semibold text-blue-600 mb-2">Informations de livraison</h2>
                  <div class="text-xs print-small-text">
                    <div><strong class="font-medium">Bon de livraison N° :</strong> ${order.orderNumber}</div>
                    <div><strong class="font-medium">Date de livraison :</strong> ${new Date(order.orderDate).toLocaleDateString('fr-FR')}</div>
                    <div><strong class="font-medium">Échéance :</strong> ${order.echeanceDate ? new Date(order.echeanceDate).toLocaleDateString('fr-FR') : 'N/A'}</div>
                    <div><strong class="font-medium">Mode de paiement :</strong> Au comptant</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-8">
              <div class="grid grid-cols-2 gap-4 text-sm print-small-text">
                <div><strong class="font-medium">Client :</strong> ${order.customerName || 'Client inconnu'}</div>
                <div><strong class="font-medium">Date de commande :</strong> ${new Date(order.orderDate).toLocaleDateString('fr-FR')}</div>
              </div>
            </div>
            
            <div class="mb-8">
              <table class="w-full border-collapse border border-gray-300 table">
                <thead>
                  <tr class="bg-gray-100">
                    <th class="border border-gray-300 text-left font-semibold print-xsmall-text">Produit</th>
                    <th class="border border-gray-300 text-left font-semibold print-xsmall-text">Quantité</th>
                    <th class="border border-gray-300 text-left font-semibold print-xsmall-text">Prix unitaire</th>
                    <th class="border border-gray-300 text-left font-semibold print-xsmall-text">Sous-total</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.orderItems.map(item => `
                    <tr class="hover:bg-gray-50">
                      <td class="border border-gray-300 print-xsmall-text">${item.product?.name || item.productName || 'Produit inconnu'}</td>
                      <td class="border border-gray-300 print-xsmall-text">${item.quantity}</td>
                      <td class="border border-gray-300 print-xsmall-text">${(item.unitPrice || 0).toFixed(2)} MGA</td>
                      <td class="border border-gray-300 print-xsmall-text">${(item.subtotal || 0).toFixed(2)} MGA</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-8 text-sm print-small-text">
              <div class="flex justify-between mb-2">
                <strong class="font-medium">Remise :</strong> <span class="font-bold">${(order.discountAmount || 0).toFixed(2)} MGA</span>
              </div>
              <div class="flex justify-between">
                <strong class="font-medium">Total :</strong> <span class="font-bold text-blue-600">${(order.totalAmount || 0).toFixed(2)} MGA</span>
              </div>
            </div>
            
            <div class="flex justify-between mt-10">
              <div class="w-1/2 pr-4 text-center">
                <strong class="text-sm font-semibold mb-2 block print-small-text">Signature du client</strong>
                <div class="signature-box border border-gray-500 rounded p-2 min-h-[40px]"></div>
              </div>
              <div class="w-1/2 pl-4 text-center">
                <strong class="text-sm font-semibold mb-2 block print-small-text">Signature du vendeur</strong>
                <div class="signature-box border border-gray-500 rounded p-2 min-h-[40px]"></div>
              </div>
            </div>
            
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-8 text-sm print-small-text">
              <div class="mb-2">
                <strong class="font-medium">Montant en chiffres :</strong> <span class="font-bold">${(order.totalAmount || 0).toFixed(2)} MGA</span>
              </div>
              <div>
                <strong class="font-medium">Arrêté à la somme de :</strong> <span class="italic">${convertToWords(order.totalAmount || 0)}</span>
              </div>
            </div>

            <button class="no-print fixed top-4 right-4 bg-blue-600 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-700 transition-colors" onclick="window.print()">Imprimer</button>
          </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Removed the setTimeout for auto-print as it can be annoying.
      // The button in the print preview handles it.
    } catch (error) {
      console.error('Error during printing:', error);
      toast.error('Erreur lors de l\'impression. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8 px-4 md:px-0 print:p-0 print:bg-white">
      <div className="bg-white shadow-xl border border-gray-200 rounded-lg w-full max-w-2xl mx-auto p-6 md:p-8 lg:p-10 print:w-auto print:shadow-none print:border-none print:rounded-none invoice-container-a4">
        {/* Invoice Header */}
        <div className="pb-6 mb-6 border-b border-gray-200 print:border-none print:mb-4 print:pb-0">
          <h1 className="text-2xl font-extrabold text-blue-600 text-center mb-4 print:text-xl print:font-bold">
            Bon de livraison - {order.orderNumber}
          </h1>
          
          {/* Company and Delivery Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print:grid-cols-2 print:gap-4 print:mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 print:bg-white print:border-none print:p-0">
              <h2 className="text-lg font-semibold text-blue-600 mb-2 print:text-base print:font-bold print:mb-1">Tsena Rakotonirina</h2>
              <div className="text-sm text-gray-700 leading-relaxed print:text-xs print-small-text">
                <div><strong className="font-medium">Nom :</strong> Sanda</div>
                <div><strong className="font-medium">Adresse :</strong> Alasora Commune</div>
                <div><strong className="font-medium">Ville :</strong> Antananarivo 103</div>
                <div><strong className="font-medium">Téléphone :</strong> +261 34 76 368 86</div>
                <div><strong className="font-medium">Email :</strong> rakotonirinasanda@gmail.com</div>
                <div><strong className="font-medium">NIF :</strong> 123 456 789 00012</div>
                <div><strong className="font-medium">STAT :</strong> FR12345678901</div>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 print:bg-white print:border-none print:p-0">
              <h2 className="text-lg font-semibold text-blue-600 mb-2 print:text-base print:font-bold print:mb-1">Informations de livraison</h2>
              <div className="text-sm text-gray-700 leading-relaxed print:text-xs print-small-text">
                <div><strong className="font-medium">Bon de livraison N° :</strong> {order.orderNumber}</div>
                <div><strong className="font-medium">Date de livraison :</strong> {new Date(order.orderDate).toLocaleDateString('fr-FR')}</div>
                <div><strong className="font-medium">Échéance :</strong> {order.echeanceDate ? new Date(order.echeanceDate).toLocaleDateString('fr-FR') : 'N/A'}</div>
                <div><strong className="font-medium">Mode de paiement :</strong> Au comptant</div>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 print:bg-white print:border-none print:p-0 print:mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-900 print:text-xs print-small-text">
              <div><strong className="font-medium text-gray-700">Client :</strong> {order.customerName || 'Client inconnu'}</div>
              <div><strong className="font-medium text-gray-700">Date de commande :</strong> {new Date(order.orderDate).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </div>

        {/* Invoice Body - Items */}
        <div className="p-4 md:p-6 lg:p-8 print:p-0"> {/* Adjusted padding for main content body */}
          <div className="overflow-x-auto mb-6 print:mb-4">
            <table className="w-full border-collapse table-auto border border-gray-300 text-sm print:text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 print:px-2 print:py-1 print-xsmall-text">Produit</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 print:px-2 print:py-1 print-xsmall-text">Quantité</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 print:px-2 print:py-1 print-xsmall-text">Prix unitaire</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 print:px-2 print:py-1 print-xsmall-text">Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 print:hover:bg-white">
                    <td className="border border-gray-300 px-4 py-2 text-gray-800 print:px-2 print:py-1 print-xsmall-text">{item.product?.name || item.productName || 'Produit inconnu'}</td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-800 print:px-2 print:py-1 print-xsmall-text">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-800 print:px-2 print:py-1 print-xsmall-text">{(item.unitPrice || 0).toFixed(2)} MGA</td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-800 font-medium print:px-2 print:py-1 print-xsmall-text">{(item.subtotal || 0).toFixed(2)} MGA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-900 print:bg-white print:border-none print:p-0 print:mb-4 print-small-text">
            <div className="flex justify-between items-center mb-2">
              <strong className="font-medium text-gray-700">Remise :</strong> <span className="font-bold text-gray-900">{(order.discountAmount || 0).toFixed(2)} MGA</span>
            </div>
            <div className="flex justify-between items-center">
              <strong className="font-medium text-gray-700">Total :</strong> <span className="font-bold text-blue-600 text-lg">{(order.totalAmount || 0).toFixed(2)} MGA</span>
            </div>
          </div>

          {/* Signatures and Amount in Words */}
          <div className="mt-8 print:mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
              <div className="text-center">
                <strong className="text-base font-semibold block mb-2 text-gray-800 print:text-sm print-small-text">Signature du client</strong>
                <div className="border border-gray-400 rounded-md p-3 min-h-[60px] print:border print-small-text signature-box">
                  {/* Client signature area */}
                </div>
              </div>
              <div className="text-center">
                <strong className="text-base font-semibold block mb-2 text-gray-800 print:text-sm print-small-text">Signature du vendeur</strong>
                <div className="border border-gray-400 rounded-md p-3 min-h-[60px] print:border print-small-text signature-box">
                  {/* Seller signature area */}
                </div>
              </div>
            </div>
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 print:bg-white print:border-none print:p-0 print:mt-4 print-small-text">
              <div className="mb-2">
                <strong className="font-medium">Montant en chiffres :</strong> <span className="font-bold">{(order.totalAmount || 0).toFixed(2)} MGA</span>
              </div>
              <div>
                <strong className="font-medium">Arrêté à la somme de :</strong> <span className="italic">{convertToWords(order.totalAmount || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Actions (not visible on print) */}
        <div className="p-4 md:p-6 border-t border-gray-200 mt-6 flex justify-between items-center print:hidden">
          <button 
            onClick={() => navigate('/orders')} 
            className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Retour
          </button>
          <button 
            onClick={handlePrint} 
            className="px-5 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export default Invoice;