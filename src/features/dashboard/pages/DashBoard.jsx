import React, { useState, useEffect, useRef } from 'react';
import { FaChartLine, FaComments, FaEuroSign, FaShoppingCart, FaTimes, FaCalendarDay, FaBell, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import API from '../../../services/API'; // Assurez-vous que ce chemin est correct
import Modal from 'react-modal'; // Assurez-vous d'avoir 'react-modal' installé
import { useNavigate } from 'react-router-dom';

// Inclure le composant ChatbotFloating directement ici
function ChatbotFloating() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // Historique des messages { sender: 'user'|'ai', text: '...' }
  const [inputMessage, setInputMessage] = useState(''); // Message actuellement tapé par l'utilisateur
  const [loading, setLoading] = useState(false); // Indique si une réponse de l'IA est en cours

  const messagesEndRef = useRef(null); // Pour faire défiler les messages vers le bas

  // Fonction pour faire défiler vers le bas des messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Chaque fois que les messages sont mis à jour, faites défiler vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page si c'est dans un <form>

    if (inputMessage.trim() === '' || loading) {
      return; // Ne rien envoyer si le message est vide ou si l'IA est déjà en train de répondre
    }

    const userMessage = inputMessage.trim();
    
    // 1. Ajouter le message de l'utilisateur à l'historique
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: userMessage }]);
    setInputMessage(''); // Effacer le champ de saisie
    setLoading(true); // Activer l'indicateur de chargement

    try {
      // 2. Envoyer la question à votre backend Spring Boot
      const response = await fetch('http://backend:8080/graphql', { // Assurez-vous que l'URL est correcte
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Ajoutez ici les headers d'authentification si nécessaire (ex: 'Authorization': 'Bearer votre_token')
        },
        // Construire la requête GraphQL pour appeler askGemini
        body: JSON.stringify({
          query: `query { askGemini(question: "${userMessage.replace(/"/g, '\\"')}") }`
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      // 3. Extraire la réponse de Gemini
      const aiResponse = data.data.askGemini || "Désolé, je n'ai pas pu obtenir de réponse.";

      // 4. Ajouter la réponse de l'IA à l'historique
      setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: aiResponse }]);

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message à l\'IA:', error);
      setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: "Désolé, une erreur est survenue lors de la communication avec l'IA." }]);
    } finally {
      setLoading(false); // Désactiver l'indicateur de chargement
    }
  };

  return (
    <>
      <button
        className={`fixed bottom-8 right-8 z-[1050] w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${open ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
        onClick={() => setOpen(true)}
        title="Assistant IA"
        aria-label="Ouvrir l'assistant IA"
      >
        <FaComments size={24} />
      </button>

      {open && (
        <div
          className="fixed bottom-8 right-8 z-[1060] w-96 max-w-[90vw] h-[60vh] min-h-[300px] bg-white rounded-lg shadow-xl flex flex-col" // Ajout d'une hauteur fixe
          style={{ transformOrigin: 'bottom right' }}
          // data-aos="zoom-in" data-aos-duration="300" // Incluez AOS si vous l'utilisez
        >
          <div className="flex items-center justify-between p-4 bg-gray-800 text-white rounded-t-lg">
            <span className="flex items-center text-lg font-semibold">
              <FaComments className="mr-2" /> Assistant IA
            </span>
            <button
              className="p-2 text-white hover:text-gray-300 transition-colors"
              onClick={() => setOpen(false)}
              aria-label="Fermer l'assistant IA"
            >
              <FaTimes />
            </button>
          </div>

          {/* Zone d'affichage des messages */}
          <div className="flex-1 p-4 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                Bonjour ! Comment puis-je vous aider aujourd'hui ?
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 p-2 rounded-lg max-w-[80%] ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white ml-auto rounded-br-none'
                      : 'bg-gray-200 text-gray-800 mr-auto rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              ))
            )}
            <div ref={messagesEndRef} /> {/* Pour le défilement automatique */}
          </div>

          {/* Zone de saisie */}
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex items-center">
            <textarea
              className="flex-1 resize-none border rounded-lg p-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="1" // Hauteur initiale d'une ligne
              placeholder="Tapez votre message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { // Envoi par Entrée, Saut de ligne par Shift+Entrée
                  sendMessage(e);
                }
              }}
              disabled={loading}
            ></textarea>
            <button
              type="submit"
              className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || inputMessage.trim() === ''}
              aria-label="Envoyer le message"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

Modal.setAppElement('#root'); // Important pour l'accessibilité de react-modal, assurez-vous que votre root HTML a l'id 'root'

function DashBoard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProductsSold, setTotalProductsSold] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [echeances, setEcheances] = useState(0);
  const [echeanceOrders, setEcheanceOrders] = useState([]);
  const [showEcheanceModal, setShowEcheanceModal] = useState(false);
  const [totalCharges, setTotalCharges] = useState(0); // Nouvel état pour le total des charges
  // const [monthlyCharges, setMonthlyCharges] = useState([]); // Supprimé: n'est plus utilisé directement

  const navigate = useNavigate();
  // Récupère l'année et le mois courant au format 'YYYY-MM'
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

  // Filtre les données du graphique pour ne garder que celles du mois courant

  const [caBeneficeData, setCaBeneficeData] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().slice(0, 10), // 7 jours avant aujourd'hui
    end: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    const fetchCaBenefice = async () => {
      try {
        const res = await API.get(`/dashboard/ca-benefice-par-jour?startDate=${dateRange.start}&endDate=${dateRange.end}`);
        console.log("Les données du useEffect de caBenefice :",res.data);
        setCaBeneficeData(res.data);
      } catch (err) {
        setCaBeneficeData([]);
        console.error("Erreur lors du chargement du CA/bénéfice par jour :", err);
      }
    };
    fetchCaBenefice();
  }, [dateRange]);

  const [totalBenefice, setTotalBenefice] = useState(0);

  useEffect(() => {
    const fetchTotalBenefice = async () => {
      try {
        const res = await API.get('/dashboard/total-benefice');
        setTotalBenefice(res.data);
      } catch (err) {
        setTotalBenefice(0);
        console.error("Erreur lors du chargement du bénéfice total :", err);
      }
    };
    fetchTotalBenefice();
  }, []);

  // Fetch overdue orders (échéances)
  useEffect(() => {
    const countEcheances = async () => {
      try {
        const response = await API.get("/orders/overdue"); // Correction de l'URL
        setEcheances(response.data.length);
        setEcheanceOrders(response.data);
        console.log("Données des commandes en échéance:", response.data); // Log pour le débogage
      } catch (error) {
        console.error("Erreur lors de la récupération des échéances", error);
        // Optionally set an error state for échéances specifically
      }
    };
    countEcheances();
  }, []);

  // Fetch dashboard indicators and charges
  useEffect(() => {
    const fetchDashboardAndCharges = async () => {
      setLoading(true);
      setError('');
      try {
        const [revenueRes, soldRes, monthlyRevenueRes, chargeToto] = await Promise.all([
          API.get('/dashboard/total-revenue'), // S'assurer que l'URL est correcte si votre API utilise /api/dashboard
          API.get('/dashboard/total-products-sold'), // S'assurer que l'URL est correcte
          API.get(`/dashboard/monthly-revenue?year=${selectedYear}`), // S'assurer que l'URL est correcte
          API.get(`/charges/total-by-year?year=${selectedYear}`) // Correction de l'URL et du nom de l'endpoint
        ]);

        setTotalRevenue(revenueRes.data);
        setTotalProductsSold(soldRes.data);
        setTotalCharges(parseFloat(chargeToto.data)); // Mettre à jour le total des charges annuelles, convertir en nombre

        const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const monthlyRevenueData = Object.entries(monthlyRevenueRes.data).map(([key, val]) => {
          const moisIdx = parseInt(key.split('-')[1], 10) - 1;
          return {
            mois: moisLabels[moisIdx] || key,
            ca: val.revenue,
            ventes: val.productsSold,
            benefice: val.benefice
          };
        });
        // setMonthlyData(monthlyRevenueData); // Cette ligne sera remplacée par la fusion

        // Fetch monthly charges and merge with monthlyRevenueData
        const monthlyChargesRes = await API.get(`/charges/monthly-summary?year=${selectedYear}`); // Correction de l'URL
        //window. = monthlyChargesRes
        const mergedMonthlyData = monthlyRevenueData.map(monthData => {
          const monthKey = (moisLabels.indexOf(monthData.mois) + 1).toString().padStart(2, '0');
          // Assurez-vous que monthlyChargesRes.data[`${selectedYear}-${monthKey}`] est un nombre
          const chargeForMonth = parseFloat(monthlyChargesRes.data[`${selectedYear}-${monthKey}`]?.charges || 0); // Accéder à la propriété 'charges' et convertir
          return {
            ...monthData,
            charges: chargeForMonth,
            benefice: monthData.benefice, // Utilise la vraie valeur du backend
            gains: monthData.benefice - chargeForMonth // Si tu veux afficher "gains" (bénéfice - charges)
          };
        });
        setMonthlyData(mergedMonthlyData); // Mettre à jour monthlyData avec les charges et les bénéfices

      } catch (err) {
        console.error("Erreur détaillée lors du chargement du dashboard ou des charges:", err);
        setError("Erreur lors du chargement des indicateurs du dashboard et des charges. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardAndCharges();
  }, [selectedYear]);

  const voirDetails = async (orderId) => {
    try {
      if (!orderId) {
        console.error("ID de commande manquant ou invalide pour voir les d\u00E9tails:", orderId);
        // G\u00E9rer l'erreur, par exemple afficher un toast ou un message \u00E0 l'utilisateur
        return;
      }
      const response = await API.get(`/orders/${orderId}`); // Correction de l'URL
      navigate(`/order/${orderId}/detail`, { state: { order: response.data } });
    } catch (error) {
      console.error("Erreur lors de la r\u00E9cup\u00E9ration des d\u00E9tails de la commande", error);
      // G\u00E9rer l'erreur de navigation/affichage si l'ordre n'est pas trouv\u00E9
    }
  };

  const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const currentMonthLabel = moisLabels[new Date().getMonth()];
  const moisActuel = monthlyData.find(m => m.mois === currentMonthLabel) || { ca: 0, ventes: 0, charges: 0, benefice: 0, mois: currentMonthLabel }; // Mis à jour pour 'benefice'
  const beneficeMois = caBeneficeData
    .filter(d => d.date.startsWith(currentMonthKey))
    .reduce((sum, d) => sum + (parseFloat(d.benefice) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 pt-20 md:pt-4 pl-4 md:pl-24 lg:pl-28"> {/* Adjusted padding for NavBar */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <FaChartLine className="mr-3 text-blue-600" /> Tableau de bord
        </h2>
        <p className="text-gray-600 text-lg">Vue d'ensemble de votre activité, ventes et conseils IA</p>
      </div>

      {/* Sélecteur d'année */}
      <div className="mb-6 flex items-center">
        <label htmlFor="year-select" className="text-gray-700 font-semibold mr-3">Année :</label>
        <div className="relative">
          <select
            id="year-select"
            className="block appearance-none w-auto bg-white border border-gray-300 text-gray-800 py-2 px-4 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value, 10))}
          >
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center my-10">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="mt-4 text-lg text-gray-600">Chargement des indicateurs...</div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur !</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      ) : (
        <>
          {/* Section graphique + résumé */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Graphique à gauche */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-blue-600 text-white text-lg font-semibold flex items-center">
                <FaChartLine className="mr-2" /> Évolution du chiffre d'affaires, charges et bénéfices mensuels
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={340}>
                  <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="mois" axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" orientation="left" stroke="#2563eb" axisLine={false} tickLine={false} label={{ value: "Montant (MGA)", angle: -90, position: 'insideLeft', offset: 10 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" axisLine={false} tickLine={false} label={{ value: "Quantité", angle: 90, position: 'insideRight', offset: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="ca" stroke="#2563eb" name="Chiffre d'affaires (MGA)" strokeWidth={3} activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="ventes" stroke="#10b981" name="Ventes (nb)" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line yAxisId="left" type="monotone" dataKey="charges" stroke="#ef4444" name="Charges (MGA)" strokeWidth={2} activeDot={{ r: 8 }} /> {/* Ligne des charges */}
                    <Line yAxisId="left" type="monotone" dataKey="benefice" stroke="#84cc16" name="Bénéfice (MGA)" strokeWidth={2} activeDot={{ r: 8 }} /> {/* Ligne des bénéfices */}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex items-center mb-4">
                  <FaChartLine className="mr-2 text-blue-600" />
                  <span className="text-lg font-semibold text-gray-800">Chiffre d'affaires & bénéfice par jour</span>
                  <div className="ml-auto flex items-center space-x-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <span className="mx-1">au</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
                      className="border rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={caBeneficeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="chiffreAffaire" stroke="#2563eb" name="Chiffre d'affaires" strokeWidth={2} />
                    <Line type="monotone" dataKey="benefice" stroke="#10b981" name="Bénéfice" strokeWidth={2} />
                    <Line type="monotone" dataKey="charge" stroke="#ef4444" name="Charges" strokeWidth={2} />                   </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Résumés à droite, superposés */}
            <div className="grid grid-cols-1 gap-6">
              {/* Card notifications d'échéances */}
              <div className="bg-amber-100 rounded-lg shadow-md border border-yellow-200">
                <div className="p-4 flex items-center">
                  <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0">
                    <FaBell size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-xl text-red-700">{echeances} échéances à venir</div>
                    <div className="text-gray-600 text-sm">{echeances} factures arrivent à échéance cette semaine !</div>
                    <button
                      className="mt-3 px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors duration-200 text-sm font-semibold"
                      onClick={() => setShowEcheanceModal(true)}
                    >
                      Voir les détails
                    </button>
                  </div>
                </div>
              </div>
              {/* Tuiles d'indicateurs */}
              <DashboardCard
                icon={<FaShoppingCart size={24} />}
                value={totalProductsSold}
                label="Produits vendus (année)"
                bgColor="bg-blue-600"
              />
              <DashboardCard
                icon={<FaEuroSign size={24} />}
                value={`${totalRevenue.toLocaleString('fr-FR')} MGA`}
                label="Chiffre d'affaires (total)"
                bgColor="bg-green-600"
              />
               <DashboardCard
                icon={<FaEuroSign size={24} />}
                value={`${totalCharges.toLocaleString('fr-FR')} MGA`}
                label="Charges (année)"
                bgColor="bg-red-600" // Couleur rouge pour les charges
              />
              <DashboardCard
                icon={<FaChartLine size={24} />}
                value={`${moisActuel.ca.toLocaleString('fr-FR')} MGA`}
                label={`CA du mois (${moisActuel.mois})`}
                bgColor="bg-sky-600"
              />
              <DashboardCard
                icon={<FaEuroSign size={24} />}
                value={`${beneficeMois.toLocaleString('fr-FR')} MGA`}
                label={`Revenue du mois (${currentMonthLabel})`}
                bgColor="bg-orange-700"
              />
              <DashboardCard
                icon={<FaEuroSign size={24} />}
                value={`${moisActuel.charges.toLocaleString('fr-FR')} MGA`}
                label={`Charges du mois (${moisActuel.mois})`}
                bgColor="bg-pink-600" // Couleur rose pour les charges du mois
              />
              <DashboardCard
                icon={<FaEuroSign size={24} />}
                value={`${(beneficeMois - moisActuel.charges).toFixed(2)} MGA`}
                label={`Bénéfice (${currentMonthLabel})`}
                bgColor="bg-green-700"
              />
            </div>
          </div>
        </>
      )}

      {/* Chatbot IA flottant */}
      <ChatbotFloating />

      {/* Modal d'échéances */}
      <Modal
        isOpen={showEcheanceModal}
        onRequestClose={() => setShowEcheanceModal(false)}
        className="fixed inset-0 flex items-center justify-center p-4 z-[9999]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
      >
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-5 border-b pb-3">
            <h5 className="text-xl font-bold text-red-600 flex items-center">
              <FaBell className="mr-2" /> Échéances à venir
            </h5>
            <button
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setShowEcheanceModal(false)}
              aria-label="Fermer la fenêtre modale"
            >
              <FaTimes />
            </button>
          </div>
          {echeanceOrders.length === 0 ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Parfait !</strong>
              <span className="block sm:inline ml-2">Aucune facture en retard ou à échéance !</span>
            </div>
          ) : (
            <ul className="space-y-4">
              {echeanceOrders.map(order => (
                <li key={order.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50 rounded-md border border-gray-200 shadow-sm">
                  <div className="mb-2 md:mb-0">
                    <p className="font-semibold text-gray-800">Commande: <span className="font-normal">{order.orderNumber}</span></p>
                    <p className="text-gray-600">Client: <span className="font-normal">{order.customerName || 'N/A'}</span></p>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-3 md:mb-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <FaCalendarDay className="mr-1" /> Échéance: {order.echeanceDate ? new Date(order.echeanceDate).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <FaEuroSign className="mr-1" /> Montant: {order.totalAmount?.toLocaleString('fr-FR')} MGA
                    </span>
                  </div>
                  <button
                    className='px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200 mt-3 md:mt-0'
                    onClick={() => {
                      console.log("Tentative de voir les d\u00E9tails pour l'ID de commande:", order.id); // Log pour le d\u00E9bogage
                      if (order.id) { // V\u00E9rifiez que order.id n'est pas null ou undefined
                        voirDetails(order.id);
                      } else {
                        console.error("ID de commande manquant pour cette commande:", order);
                        // Vous pouvez ajouter ici un toast ou un message d'erreur \u00E0 l'utilisateur
                      }
                    }}
                  >
                    Détails
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default DashBoard;

// Composant pour les tuiles de Dashboard réutilisables
function DashboardCard({ icon, value, label, bgColor }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 flex items-center">
        <div className={`${bgColor} text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <div className="font-bold text-2xl text-gray-800">{value}</div>
          <div className="text-gray-600 text-sm">{label}</div>
        </div>
      </div>
    </div>
  );
}