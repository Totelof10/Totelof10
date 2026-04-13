import React from 'react';
import { ToastContainer } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';

function AppToastContainer() {
  const { isDark } = useTheme();

  return (
    <ToastContainer
      position="top-right"
      autoClose={2200}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={isDark ? 'dark' : 'light'}
      toastClassName={(context) => `app-toast app-toast-${context?.type || 'default'}`}
      progressClassName="app-toast-progress"
    />
  );
}

export default AppToastContainer;
