import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Lock } from "lucide-react";
import { ROLES } from "../../config/constants";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

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
      <Card className="p-8 w-full max-w-md shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-600 rounded-full">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">
          Acceso al Sistema
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Ingresa tu PIN"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="text-center text-2xl tracking-widest"
            placeholder="••••"
            maxLength={4}
            autoFocus
          />

          {error && (
            <div className="text-rose-400 text-center text-sm bg-rose-900/20 p-2 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            size="lg"
          >
            Ingresar
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Viewer: 1234 | Worker: 5678 | Admin: 9999</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
