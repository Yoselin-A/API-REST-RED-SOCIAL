import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3900/api/users";

export default function LoginForm({ onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });

      if (res.data.status === "success") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setMessage(`✅ ${res.data.message || "Inicio de sesión exitoso"}`);
        onLogin && onLogin(res.data.user, res.data.token);
      } else {
        setMessage(`❌ ${res.data.message || "Error al iniciar sesión"}`);
      }
    } catch (err) {
      setMessage(
        `❌ ${err.response?.data?.message || "Error al iniciar sesión"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado izquierdo con imagen */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/loginimg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center px-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bienvenido de nuevo
          </h1>
          <p className="text-lg text-gray-200 mb-6">
            Conecta con amigos, comparte momentos y descubre contenido increíble.
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-300">
            <span className="flex -space-x-2">
              <span className="w-6 h-6 rounded-full bg-purple-500"></span>
              <span className="w-6 h-6 rounded-full bg-indigo-500"></span>
              <span className="w-6 h-6 rounded-full bg-blue-500"></span>
            </span>
            +1.2M usuarios conectados
          </p>
        </div>
      </div>

      {/* Lado derecho con login */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-6 text-center text-white">
            Iniciar sesión
          </h2>

          {message && (
            <div
              className={`p-3 rounded mb-4 text-center ${
                message.startsWith("✅")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {message}
            </div>
          )}

          {loading && (
            <div className="text-center text-gray-300 mb-4">
              ⏳ Validando credenciales...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>

            <div className="flex items-center text-gray-300 text-sm">
              <input type="checkbox" id="remember" className="mr-2" />
              <label htmlFor="remember">Recordar contraseña</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-300 mt-6">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={onSwitch}
              className="text-blue-300 font-medium hover:underline"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
