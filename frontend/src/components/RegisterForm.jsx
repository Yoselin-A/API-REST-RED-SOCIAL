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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-100 to-green-300">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8">
        <h1 className="text-4xl font-extrabold text-center text-green-600 mb-6">
          Crear Cuenta ✨
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Regístrate para unirte a la red social
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
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="text"
            name="surname"
            placeholder="Apellido"
            value={form.surname}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="text"
            name="nick"
            placeholder="Nombre de usuario"
            value={form.nick}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-green-600 font-medium hover:underline"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
}