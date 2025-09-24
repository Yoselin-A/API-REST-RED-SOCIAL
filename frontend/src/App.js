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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navItems = [
    { id: "feed", label: "Inicio" },
    { id: "create", label: "Crear publicación" },
    { id: "profile", label: "Mi Perfil" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar con fondo degradado */}
      <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo Section */}
            <div className="flex items-center">
              <button
                onClick={() => setView("feed")}
                className="flex items-center space-x-4 group transition-all duration-200"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-indigo-700 font-bold text-lg">S</span>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Red Social</h1>
                  <p className="text-xs text-white/70 font-medium uppercase tracking-wide">Conectando gente</p>
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center space-x-2 bg-white/20 rounded-2xl p-2 mr-8">
                {navItems.map((item) => {
                  const isActive = view === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform ${
                        isActive
                          ? "bg-white text-indigo-700 shadow scale-105"
                          : "text-white/90 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-4">
                {/* User Section */}
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden xl:block">
                    <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                    <p className="text-xs text-white/80">{user?.email}</p>
                  </div>

                  {/* Avatar con foto de perfil */}
                  <button
                    onClick={() => setView("profile")}
                    className="relative group"
                  >
                    {user?.image ? (
                      <img
src={`http://localhost:3900/api/users/avatar/${user.image}`}
                        alt="Foto de perfil"
                        className="w-12 h-12 rounded-2xl object-cover shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 border-2 border-white/30"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 border-2 border-white/30">
                        <span className="text-white font-bold text-lg">{user?.name?.charAt(0) || '?'}</span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"></div>
                  </button>

                  {/* Botón Logout profesional */}
                  <button
                    onClick={handleLogout}
                    className="p-3 text-white/80 hover:text-red-200 hover:bg-red-500/20 rounded-xl transition-all duration-200 group"
                    title="Cerrar sesión"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H4v16h10v-2h2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className={`h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : 'w-6'}`}></div>
                <div className={`h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : 'w-4'}`}></div>
                <div className={`h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'w-5'}`}></div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-indigo-700/95 backdrop-blur-lg">
            <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
              
              {/* Mobile User Info */}
              <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-2xl">
                {user?.image ? (
                  <img
src={`http://localhost:3900/api/users/avatar/${user.image}`}
                    alt="Foto de perfil"
                    className="w-12 h-12 rounded-2xl object-cover shadow-lg border-2 border-white/30"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30">
                    <span className="text-white font-bold text-lg">{user?.name?.charAt(0) || '?'}</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{user?.name || 'User'}</p>
                  <p className="text-sm text-white/80">{user?.email}</p>
                </div>
              </div>

              {/* Mobile Nav Items */}
              <div className="space-y-2">
                {navItems.map((item) => {
                  const isActive = view === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setView(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-4 rounded-xl font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-white text-indigo-700 shadow-lg"
                          : "text-white/90 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <hr className="border-white/20" />

              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-4 text-red-200 hover:bg-red-500/20 rounded-xl transition-all duration-200 font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H4v16h10v-2h2v2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10z"/>
                </svg>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {view === "feed" && <Feed token={token} />}
        {view === "create" && <CreatePost token={token} />}
        {view === "profile" && <Profile user={user} token={token} setUser={setUser} />}
      </div>
    </div>
  );
}