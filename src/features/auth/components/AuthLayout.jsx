import React, { useMemo } from 'react';
import { FaMoon, FaSun, FaShieldAlt, FaChartLine, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';

function AuthLayout({
  title,
  subtitle,
  sideTitle,
  sideText,
  children,
  footer,
  reverse = false
}) {
  const { theme, toggleTheme } = useTheme();

  const shellClass = useMemo(() => {
    return `auth-shell ${theme} ${reverse ? 'reverse' : ''}`;
  }, [theme, reverse]);

  return (
    <motion.div
      className={shellClass}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
    >
      <aside className="auth-aside">
        <div className="auth-brand">TSENA</div>
        <h1>{sideTitle}</h1>
        <p>{sideText}</p>
        <div className="auth-feature-list">
          <div>
            <FaShieldAlt />
            <span>Authentification securisee</span>
          </div>
          <div>
            <FaChartLine />
            <span>Suivi des ventes en temps reel</span>
          </div>
          <div>
            <FaUsers />
            <span>Gestion client centralisee</span>
          </div>
        </div>
      </aside>

      <section className="auth-panel">
        <div className="auth-card">
          <h2>{title}</h2>
          <p>{subtitle}</p>
          {children}
          {footer && <div className="auth-card-footer">{footer}</div>}
        </div>
      </section>
    </motion.div>
  );
}

export default AuthLayout;
