import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Lock } from "lucide-react";
import { ROLES } from "../constants";

const Login = () => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const role = login(pin);
    if (role) {
      if (role === ROLES.WORKER) {
        navigate("/debts");
      } else {
        navigate("/dashboard");
      }
    } else {
      setError("PIN Inválido");
      setPin("");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-700">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-600 rounded-full">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">
          Lan Center Manager
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Ingresa tu PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-center text-2xl tracking-widest focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="••••"
              maxLength={4}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-rose-400 text-center text-sm bg-rose-900/20 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded transition-colors cursor-pointer"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
