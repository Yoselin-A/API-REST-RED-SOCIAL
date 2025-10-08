import React, { useState, useEffect } from "react";
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

  // Search users states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [cachedUsers, setCachedUsers] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());

  // Nuevo estado para cambiar tema
  const [theme, setTheme] = useState("dark"); // valores: "dark" o "light"
  // estado para controlar el logo (mostrar fallback si la imagen falla)
  const [logoError, setLogoError] = useState(false);

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

  // cargar a quién sigo al iniciar la app para usar en la búsqueda
  useEffect(() => {
    const fetchFollowing = async () => {
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:3900/api/follows/following", { headers: { Authorization: `Bearer ${token}` } });
        const ids = new Set((res.data.following || []).map((f) => (f.followed && f.followed._id) || f.followed));
        setFollowingIds(ids);
      } catch (err) {
        console.warn('No se pudo cargar lista de seguidos:', err.message || err);
      }
    };
    fetchFollowing();
  }, [token]);

  // Buscar usuarios (carga cache si es necesario)
  const fetchUsersForSearch = async () => {
    if (!token) return;
    if (cachedUsers.length > 0) return cachedUsers;
    try {
      const res = await axios.get("http://localhost:3900/api/users/list?limit=100", { headers: { Authorization: `Bearer ${token}` } });
      const users = res.data.users || [];
      setCachedUsers(users);
      return users;
    } catch (err) {
      console.error('Error cargando usuarios para búsqueda:', err);
      throw err;
    }
  };

  const handleSearchChange = async (value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    try {
      const users = await fetchUsersForSearch();
      const q = value.toLowerCase();
      const filtered = users.filter((u) => {
        const full = `${u.name || ''} ${u.surname || ''} ${u.nick || ''} ${u.email || ''}`.toLowerCase();
        return full.includes(q);
      });
      setSearchResults(filtered.slice(0, 10));
    } catch (err) {
      setSearchError(err.response?.data?.message || err.message || 'Error al buscar');
    } finally {
      setSearchLoading(false);
    }
  };

  const followUserFromSearch = async (id) => {
    if (!token) return;
    // optimistic
    setFollowingIds((prev) => new Set(prev).add(id));
    try {
      await axios.post(`http://localhost:3900/api/follows/follow/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      // notify other components
      window.dispatchEvent(new CustomEvent('followsChanged', { detail: { id, action: 'follow' } }));
    } catch (err) {
      console.error('Error siguiendo desde búsqueda:', err);
      setFollowingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const unfollowUserFromSearch = async (id) => {
    if (!token) return;
    setFollowingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    try {
      await axios.delete(`http://localhost:3900/api/follows/unfollow/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      window.dispatchEvent(new CustomEvent('followsChanged', { detail: { id, action: 'unfollow' } }));
    } catch (err) {
      console.error('Error unfollow desde búsqueda:', err);
      setFollowingIds((prev) => new Set(prev).add(id));
    }
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

  // Definimos los colores según tema
  const isDark = theme === "dark";

  const colors = {
    navbar: isDark
      ? "bg-gradient-to-r from-black via-blue-900 to-emerald-600"
      : "bg-gradient-to-r from-indigo-600 to-purple-600",
    bg: isDark ? "bg-black text-white" : "bg-gray-50 text-gray-900",
    buttonActive: isDark
      ? "bg-emerald-400 text-black shadow-lg scale-105"
      : "bg-white text-indigo-700 shadow scale-105",
    buttonInactive: isDark
      ? "text-white/90 hover:text-orange-400 hover:bg-blue-900/30"
      : "text-white/90 hover:text-white hover:bg-white/10",
    avatarBg: isDark
      ? "bg-gradient-to-br from-emerald-500 to-orange-500"
      : "bg-gradient-to-br from-indigo-400 to-purple-500",
  };

  return (
<div className={`min-h-screen transition-all duration-500 ${colors.bg} ${isDark ? "dark" : ""}`}>
      {/* Navbar */}
      <nav className={`${colors.navbar} shadow-xl sticky top-0 z-50`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => setView("feed")}
                className="flex items-center space-x-6 group transition-all duration-200"
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 relative">
                    {!logoError && (
                      <img src="/LogoApp.jpg" alt="LogoApp" className="w-12 h-12 object-contain" onError={() => setLogoError(true)} onLoad={() => setLogoError(false)} />
                    )}
                    {logoError && (
                      <div className={`w-12 h-12 ${isDark ? "bg-emerald-400" : "bg-white"} rounded-lg flex items-center justify-center absolute`}>
                        <span className={isDark ? "text-black font-bold text-lg" : "text-indigo-700 font-bold text-lg"}>L</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">LogoApp</h1>
                </div>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              {/* Search bar */}
              <div className="mr-6 relative hidden lg:block">
                <input
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Buscar personas..."
                  className="px-4 py-2 rounded-2xl w-72 bg-white/10 placeholder-white/60 focus:outline-none"
                />
                {searchQuery && (
                  <div className="absolute left-0 mt-2 w-72 bg-white/95 dark:bg-[#0f172a] rounded-lg shadow-lg z-50 overflow-hidden">
                    {searchLoading && <div className="p-2 text-sm text-gray-500">Buscando...</div>}
                    {searchError && <div className="p-2 text-sm text-red-500">{searchError}</div>}
                    {!searchLoading && searchResults.length === 0 && <div className="p-2 text-sm text-gray-500">No se encontraron usuarios</div>}
                    {searchResults.map(u => (
                      <div key={u._id} className="p-2 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800">
                        <div className="flex items-center space-x-3">
                          {u.image ? <img src={`http://localhost:3900/api/users/avatar/${u.image}`} alt={`Avatar de ${u.nick || u.name || 'usuario'}`} className="w-8 h-8 rounded-md"/> : <div className="w-8 h-8 rounded-md bg-purple-400 flex items-center justify-center text-white font-bold">{(u.name||'?').charAt(0)}</div>}
                          <div>
                            <div className="text-sm font-semibold">{u.name} {u.surname}</div>
                            <div className="text-xs text-gray-500">@{u.nick}</div>
                          </div>
                        </div>
                        <div>
                          {followingIds.has(u._id) ? (
                            <button onClick={() => unfollowUserFromSearch(u._id)} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-800 rounded-full">Siguiendo</button>
                          ) : (
                            <button onClick={() => followUserFromSearch(u._id)} className="px-3 py-1 text-sm bg-purple-600 text-white rounded-full">Seguir</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 bg-white/10 rounded-2xl p-2 mr-8">
                {navItems.map((item) => {
                  const isActive = view === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={`relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform ${
                        isActive ? colors.buttonActive : colors.buttonInactive
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden xl:block">
                    <p className="text-sm font-semibold">{user?.name || 'User'}</p>
                    <p className="text-xs opacity-80">{user?.email}</p>
                  </div>

                  {/* Avatar */}
                  <button onClick={() => setView("profile")} className="relative group">
                    {user?.image ? (
                      <img
                        src={`http://localhost:3900/api/users/avatar/${user.image}`}
                        alt="Foto de perfil"
                        className="w-12 h-12 rounded-2xl object-cover shadow-lg border-2 border-white/40 group-hover:scale-105 transition-all duration-300"
                      />
                    ) : (
                      <div className={`w-12 h-12 ${colors.avatarBg} rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/40 group-hover:scale-105 transition-all duration-300`}>
                        <span className="text-black font-bold text-lg">{user?.name?.charAt(0) || '?'}</span>
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${isDark ? "bg-blue-500" : "bg-emerald-400"} rounded-full border-2 border-black`}></div>
                  </button>

                  {/* Botón Tema */}
                  <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="p-3 text-white/80 hover:text-yellow-300 hover:bg-white/20 rounded-xl transition-all duration-200"
                    title="Cambiar tema"
                  >
                    {isDark ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1zm0 16a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zm9-7a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zM6 12a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm10.95 6.364a1 1 0 0 1 1.414 1.414l-1.415 1.415a1 1 0 0 1-1.414-1.415l1.415-1.414zM6.636 7.05A1 1 0 0 1 8.05 5.636L9.465 7.05a1 1 0 0 1-1.414 1.415L6.636 7.05zm10.95-1.414A1 1 0 0 1 19 7.05l-1.414 1.415a1 1 0 0 1-1.415-1.415L17.586 5.636zM7.05 17.95a1 1 0 0 1 1.415-1.415L9.88 17.95a1 1 0 0 1-1.414 1.414L7.05 17.95z"/>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21.64 13a1 1 0 0 0-1.11-.27 8 8 0 0 1-10.26-10.26 1 1 0 0 0-1.38-1.38A10 10 0 1 0 22 14.11a1 1 0 0 0-.36-1.11z"/>
                      </svg>
                    )}
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="p-3 text-white/80 hover:text-red-300 hover:bg-red-600/30 rounded-xl transition-all duration-200"
                    title="Cerrar sesión"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H4v16h10v-2h2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Botón móvil */}
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
      </nav>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {view === "feed" && <Feed token={token} />}
        {view === "create" && <CreatePost token={token} />}
        {view === "profile" && <Profile user={user} token={token} setUser={setUser} />}
      </div>
    </div>
  );
}
