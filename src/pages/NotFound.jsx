import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full flex flex-col items-center">
        <div className="bg-gray-700/50 p-4 rounded-full mb-6">
          <AlertTriangle className="w-16 h-16 text-rose-500" />
        </div>

        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">
          Página no encontrada
        </h2>

        <p className="text-gray-400 mb-8">
          La ruta a la que intentas acceder no existe o no tienes los permisos
          necesarios para verla.
        </p>

        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors w-full justify-center"
        >
          <Home className="w-5 h-5" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
