import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3900/api/users";

export default function RegisterForm({ onRegister, onSwitch }) {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    nick: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/register`, form);

      if (res.data.status === "success") {
        setMessage("✅ Registro exitoso. Ahora puedes iniciar sesión.");
        onRegister && onRegister();
      } else {
        setMessage("❌ Error al registrarse.");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Error al registrarse");
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center font-sans relative"
      style={{
        backgroundImage: "url('/loginimg.jpg')", // misma imagen que login
      }}
    >
      {/* Overlay degradado */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

      {/* Formulario */}
      <div className="relative w-full max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 lg:p-10">
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Crear cuenta
        </h1>
        <p className="text-center text-gray-300 mb-6">
          Únete a nuestra red social 
        </p>

        {message && (
          <div className="bg-gray-100 text-gray-700 p-3 rounded mb-4 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <input
            type="text"
            name="surname"
            placeholder="Apellido"
            value={form.surname}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <input
            type="text"
            name="nick"
            placeholder="Nombre de usuario"
            value={form.nick}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition shadow-lg"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-sm text-gray-300 mt-6">
          ¿Ya tienes cuenta?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-purple-300 font-medium hover:underline"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
}
