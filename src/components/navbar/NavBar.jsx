import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaUsers,
  FaShoppingCart,
  FaSignOutAlt,
  FaDollarSign,
  FaFileInvoiceDollar,
} from 'react-icons/fa';
import { logout } from '../../services/AUTH';
import { useTheme } from '../../context/ThemeContext';

const navItems = [
  { to: '/dashboard', icon: <FaTachometerAlt />, label: 'Tableau de bord' },
  { to: '/orders', icon: <FaShoppingCart />, label: 'Bon de commande' },
  { to: '/product', icon: <FaBoxOpen />, label: 'Produits' },
  { to: '/tiers', icon: <FaUsers />, label: 'Tiers' },
  { to: '/charges', icon: <FaDollarSign />, label: 'Charges' },
  { to: '/facture', icon: <FaFileInvoiceDollar />, label: 'Factures Fournisseurs' },
];

function NavBar() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleLogout = () => {
    setIsLoading(true);
    logout();
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 2000);
  };

  const handleNavClick = (onClick) => {
    if (onClick) onClick();
  };

  return (
    <>
      {/* Overlay de chargement */}
      {isLoading && (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center ${isDark ? 'bg-black bg-opacity-55' : 'bg-white bg-opacity-50'}`}>
          <div
            className={`w-12 h-12 p-2 rounded-full animate-spin-slow ${isDark ? 'bg-cyan-500' : 'bg-emerald-500'}`}
            style={{
              WebkitMask: 'conic-gradient(#0000 10%,#000),linear-gradient(#000 0 0) content-box',
              mask: 'conic-gradient(#0000 10%,#000),linear-gradient(#000 0 0) content-box',
              WebkitMaskComposite: 'source-out',
              maskComposite: 'subtract',
            }}
          ></div>
        </div>
      )}

      {/* NavBar Desktop - Dock Mac Style */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-auto max-w-full h-16 backdrop-blur-md rounded-2xl p-2 z-50 flex items-center shadow-lg transition-all duration-300 ease-in-out hover:scale-105 focus-within:scale-105 hidden md:flex ${isDark ? 'bg-slate-900/70 border border-slate-700' : 'bg-white/70 border border-blue-100'}`}
        data-theme={isDark ? 'dark' : 'light'}
        style={{ willChange: 'background-color, transform' }}
      >
        <nav className="flex items-center h-full px-4 space-x-6">
          {navItems.map((item) => (
            <Link
              to={item.to}
              className="group flex flex-col items-center justify-center text-blue-600 no-underline relative transition-all duration-200 hover:text-blue-800 transform hover:scale-110"
              key={item.to}
              title={item.label}
              onClick={() => handleNavClick(item.onClick)}
            >
              <span className="text-3xl transition-transform duration-250 ease-in-out-cubic will-change-transform group-hover:scale-125 group-focus:scale-125">
                {item.icon}
              </span>
              <span className="text-xs opacity-0 pointer-events-none absolute -top-full mt-1 px-2 py-0.5 rounded bg-blue-600 text-white whitespace-nowrap shadow-md transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100">
                {item.label}
              </span>
            </Link>
          ))}

          <button
            className="group flex flex-col items-center justify-center text-blue-600 no-underline relative transition-all duration-200 hover:text-blue-800 transform hover:scale-110"
            onClick={() => handleNavClick(handleLogout)}
            title="Se déconnecter"
          >
            <span className="text-3xl transition-transform duration-250 ease-in-out-cubic will-change-transform group-hover:scale-125 group-focus:scale-125">
              <FaSignOutAlt />
            </span>
            <span className="text-xs opacity-0 pointer-events-none absolute -top-full mt-1 px-2 py-0.5 rounded bg-blue-600 text-white whitespace-nowrap shadow-md transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100">
              Se déconnecter
            </span>
          </button>
        </nav>
      </div>

      {/* NavBar Mobile - Bottom Fixed */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 shadow-md flex justify-around items-center h-16 border-t ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center text-sm ${isDark ? 'text-sky-300 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
            onClick={() => handleNavClick(item.onClick)}
          >
            <span className="text-2xl">{item.icon}</span>
          </Link>
        ))}

        <button
          onClick={() => handleNavClick(handleLogout)}
          className={`flex flex-col items-center justify-center text-sm ${isDark ? 'text-sky-300 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
          title="Se déconnecter"
        >
          <FaSignOutAlt className="text-2xl" />
        </button>
      </div>
    </>
  );
}

export default NavBar;
