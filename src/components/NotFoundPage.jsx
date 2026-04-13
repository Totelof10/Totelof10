import React from 'react';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-6xl font-extrabold text-indigo-600 mb-4 animate-bounce">
          404
        </h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Page non trouvée
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Désolé, la page que vous recherchez n'existe pas.
        </p>
        <a
          href="/dashboard" // Remplacez par le chemin de votre page d'accueil si nécessaire
          className="inline-block bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}

export default NotFoundPage;