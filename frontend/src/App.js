import React, { useState } from "react";
import axios from "axios"; 
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Feed from "./components/Feed";
import Profile from "./components/Profile";
import CreatePost from "./components/CreatePost";

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [showRegister, setShowRegister] = useState(false);
  const [view, setView] = useState("feed");

  const handleLogin = async (userData, jwt) => {
  try {
    const res = await axios.get("http://localhost:3900/api/users/profile", {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("token", jwt);

    setUser(res.data.user);
    setToken(jwt);
  } catch (err) {
    console.error("Error al obtener perfil después del login:", err);
  }
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  if (!user || !token) {
    return showRegister ? (
      <RegisterForm
        onRegister={() => setShowRegister(false)}
        onSwitch={() => setShowRegister(false)}
      />
    ) : (
      <LoginForm onLogin={handleLogin} onSwitch={() => setShowRegister(true)} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar Pro */}
      <nav className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-50">
        <h1
          className="text-xl font-bold text-blue-600 cursor-pointer"
          onClick={() => setView("feed")}
        >
          🌐 Red Social
        </h1>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setView("feed")}
            className={`hover:text-blue-600 ${view === "feed" ? "font-bold text-blue-600" : "text-gray-700"}`}
          >
            📰 Feed
          </button>
          <button
            onClick={() => setView("create")}
            className={`hover:text-blue-600 ${view === "create" ? "font-bold text-blue-600" : "text-gray-700"}`}
          >
            ➕ Crear publicación
          </button>
          <button
            onClick={() => setView("profile")}
            className={`hover:text-blue-600 ${view === "profile" ? "font-bold text-blue-600" : "text-gray-700"}`}
          >
            👤 Mi Perfil
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Vistas */}
      {view === "feed" && <Feed token={token} />}
      {view === "create" && <CreatePost token={token} />}
      {view === "profile" && <Profile user={user} token={token} setUser={setUser} />}
    </div>
  );
}