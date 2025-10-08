import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Profile({ user, token, setUser }) {
  const [posts, setPosts] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [newText, setNewText] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverFile, setCoverFile] = useState(null);

  // Cargar publicaciones
  useEffect(() => {
    if (!user?._id) return;
    const fetchUserPosts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3900/api/publications/user/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const enhanced = (res.data.publications || []).map((p) => ({
          ...p,
          likes: JSON.parse(localStorage.getItem(`likes_${p._id}`)) || 0,
          comments: JSON.parse(localStorage.getItem(`comments_${p._id}`)) || [],
        }));
        setPosts(enhanced);
      } catch (err) {
        console.error("Error cargando publicaciones:", err);
      }
    };
    fetchUserPosts();
  }, [user, token]);

  // Subir avatar
  const handleAvatarUpload = async (e) => {
    e.preventDefault();
    if (!avatar) return;
    const formData = new FormData();
    formData.append("avatar", avatar);
    try {
      await axios.post(
        "http://localhost:3900/api/users/upload-avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const profileRes = await axios.get(
        "http://localhost:3900/api/users/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("user", JSON.stringify(profileRes.data.user));
      setUser(profileRes.data.user);
      setMessage("success_avatar");
      setShowAvatarModal(false);
      setAvatar(null);
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setMessage("error");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  // Subir portada
  const handleCoverUpload = async (e) => {
    e.preventDefault();
    if (!coverFile) return;
    const formData = new FormData();
    formData.append("cover", coverFile);
    try {
      await axios.post(
        "http://localhost:3900/api/users/upload-cover",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const profileRes = await axios.get(
        "http://localhost:3900/api/users/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("user", JSON.stringify(profileRes.data.user));
      setUser(profileRes.data.user);
      setMessage("success_avatar");
      setShowCoverModal(false);
      setCoverFile(null);
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setMessage("error");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  // Mensaje actual (preparado para render)
  function getMessageContent(msgType) {
    switch (msgType) {
      case "success_avatar":
        return { type: "success", title: "Fantástico", text: "Tu avatar se actualizó correctamente" };
      case "success_delete":
        return { type: "success", title: "Eliminado", text: "Tu publicación se eliminó exitosamente" };
      case "success_edit":
        return { type: "success", title: "Actualizado", text: "Tu publicación se editó con éxito" };
      default:
        return { type: "error", title: "Oops", text: "Algo salió mal, intenta de nuevo" };
    }
  }

  const msg = message ? getMessageContent(message) : null;

  // Eliminar publicación
  const handleDeletePost = async (postId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta publicación?")) return;
    try {
      await axios.delete(
        `http://localhost:3900/api/publications/remove/${postId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.filter((p) => p._id !== postId));
      setSelectedPost(null);
      setMessage("success_delete");
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setMessage("error");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  // Abrir modal de edición
  const openEditModal = (post) => {
    setEditingPost(post);
    setNewText(post.text);
    setNewFile(null);
  };

  // Guardar edición
  const saveEditPost = async () => {
    try {
      let updatedPost = { ...editingPost };

      if (newText !== editingPost.text) {
        const res = await axios.put(
          `http://localhost:3900/api/publications/update/${editingPost._id}`,
          { text: newText },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updatedPost = res.data.publication;
      }

      if (newFile) {
        const formData = new FormData();
        formData.append("file", newFile);
        const res = await axios.post(
          `http://localhost:3900/api/publications/upload-image/${editingPost._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        updatedPost = res.data.publication;
      }

      setPosts(
        posts.map((p) =>
          p._id === updatedPost._id
            ? { ...updatedPost, likes: p.likes, comments: p.comments }
            : p
        )
      );
      setEditingPost(null);
      setSelectedPost(null);
      setMessage("success_edit");
      setTimeout(() => setMessage(""), 4000);
    } catch {
      setMessage("error");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  // Comentarios
  const handleComment = (postId, comment) => {
    if (!comment.trim()) return;
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, comments: [...p.comments, comment] }
          : p
      )
    );
    if (selectedPost && selectedPost._id === postId) {
      setSelectedPost({
        ...selectedPost,
        comments: [...selectedPost.comments, comment]
      });
    }
    const current =
      JSON.parse(localStorage.getItem(`comments_${postId}`)) || [];
    localStorage.setItem(
      `comments_${postId}`,
      JSON.stringify([...current, comment])
    );
  };

  const getUserInitials = (user) => {
    if (!user || !user.name) return "U";
    const names = `${user.name} ${user.surname || ""}`.split(" ");
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  // getMessageContent is declared earlier as a named function to avoid hoisting/lint issues
return (
  <div className="min-h-screen w-full transition-colors duration-500 dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:via-[#0f172a] dark:to-[#052e16] bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden fixed inset-0">
    {/* Partículas decorativas */}
    <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse dark:opacity-10"></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse dark:opacity-10"></div>
    <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-yellow-200/10 to-orange-200/10 rounded-full blur-2xl animate-float dark:opacity-0"></div>

    {/* Notificación */}
    {message && (
      <div className="fixed top-8 right-8 z-50 transform transition-all duration-700 ease-out">
        <div
          className={`px-8 py-5 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center space-x-4 ${
            msg?.type === "success"
              ? "bg-gradient-to-r from-emerald-400/90 to-green-400/90 border-emerald-200/50 text-white"
              : "bg-gradient-to-r from-red-400/90 to-pink-400/90 border-red-200/50 text-white"
          }`}
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/20">
            {msg?.type === "success" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l5.516 9.82c.75 1.335-.213 2.981-1.742 2.981H4.483c-1.53 0-2.492-1.646-1.742-2.98l5.516-9.82zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-.993.883L9 6v4a1 1 0 001.993.117L11 10V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <div>
            <p className="font-bold">{msg?.title}</p>
            <p className="text-sm opacity-90">{msg?.text}</p>
          </div>
        </div>
      </div>
    )}

    {/* CONTENIDO */}
    <div className="max-w-7xl mx-auto px-6 py-16 relative z-10 min-h-screen overflow-y-auto">

{/* PORTADA Y PERFIL INTEGRADO (versión más pequeña y alineada a la izquierda) */}
{/* PORTADA Y PERFIL INTEGRADO (versión compacta y con avatar grande) */}
<div className="relative mb-16">
  {/* Portada */}
  <div className="relative h-48 w-full rounded-[24px] overflow-hidden shadow-xl border border-white/10">
    {user.cover ? (
      <img
        src={`http://localhost:3900/api/users/cover/${user.cover}`}
        alt="Portada"
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-400">
        Sin portada
      </div>
    )}

    {/* Botón cambiar portada */}
    <button
      onClick={() => setShowCoverModal(true)}
      className="absolute top-3 right-4 px-3 py-1 bg-white/90 dark:bg-emerald-600 dark:text-black rounded-md shadow-md text-xs font-medium hover:scale-105 transition"
    >
      Cambiar portada
    </button>
  </div>

  {/* Perfil flotante */}
  <div className="absolute left-7 -bottom-10 w-[78%] max-w-3xl bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-2xl rounded-[20px] shadow-2xl border border-white/20 dark:border-gray-700 flex flex-col lg:flex-row items-center p-3 lg:p-2 space-y-1 lg:space-y-0 lg:space-x-4 transition-all duration-500">

    {/* Avatar (más grande) */}
    <div className="relative group flex-shrink-0">
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-green-400 rounded-2xl blur opacity-40 group-hover:opacity-70 transition duration-300"></div>
      <div className="relative">
        {user.image ? (
          <img
            src={`http://localhost:3900/api/users/avatar/${user.image}`}
            alt="Avatar"
            className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl bg-white dark:bg-gray-700"
          />
        ) : (
          <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold">
            {getUserInitials(user)}
          </div>
        )}
      </div>
    </div>

    {/* Info usuario (más compacta y alineada) */}
    <div className="flex-1 flex flex-col justify-center w-full">
      <div className="flex flex-col lg:flex-row items-start lg:items-center lg:justify-between w-full">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-green-400 bg-clip-text text-transparent dark:text-white leading-tight">
            {user.name} {user.surname}
          </h1>

          <div className="flex flex-wrap items-center gap-2 mt-1 text-gray-600 dark:text-gray-300 text-sm">
            <span className="flex items-center bg-emerald-100/50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
              <span className="text-emerald-500 mr-1">@</span>
              <span className="font-medium">{user.nick}</span>
            </span>
            <span className="flex items-center bg-blue-100/50 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
              <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">{user.email}</span>
            </span>
          </div>
        </div>

        {/* Botón más pegado */}
        <button
          onClick={() => setShowAvatarModal(true)}
          className="mt-1 lg:mt-0 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-xs font-bold rounded-lg hover:scale-105 transition-all shadow-md"
        >
          Cambiar foto
        </button>
      </div>

      {/* Métricas (más compactas) */}
      <div className="flex justify-start space-x-5 mt-2">
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-400">{posts.length}</div>
          <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">Publicaciones</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">
            {posts.reduce((a, p) => a + p.likes, 0)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">Me gusta</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">
            {posts.reduce((a, p) => a + p.comments.length, 0)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">Comentarios</div>
        </div>
      </div>
    </div>
  </div>
</div>


        {/* MODAL CAMBIAR AVATAR */}
        {showAvatarModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl w-full max-w-md border border-white/50 relative overflow-hidden">
              <div className="relative z-10 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Cambiar avatar</h3>
                  <button
                    onClick={() => {
                      setShowAvatarModal(false);
                      setAvatar(null);
                    }}
                    className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                    aria-label="Cerrar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAvatarUpload} className="space-y-6">
                  <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} className="block w-full" required />
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAvatarModal(false);
                        setAvatar(null);
                      }}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 font-bold transition-all duration-300 hover:bg-gray-100/50 rounded-2xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!avatar}
                      className="px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white rounded-2xl hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all duration-300 transform hover:scale-105"
                    >
                      Actualizar foto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CAMBIAR PORTADA */}
        {showCoverModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl w-full max-w-lg border border-white/50 relative overflow-hidden">
              <div className="relative z-10 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold">Cambiar portada</h3>
                  <button
                    onClick={() => { setShowCoverModal(false); setCoverFile(null); }}
                    className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                    aria-label="Cerrar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleCoverUpload} className="space-y-6">
                  <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="block w-full" required />
                  <div className="flex justify-end space-x-4">
                    <button type="button" onClick={() => { setShowCoverModal(false); setCoverFile(null); }} className="px-6 py-3 text-gray-600 hover:text-gray-800 font-bold transition-all duration-300 hover:bg-gray-100/50 rounded-2xl">Cancelar</button>
                    <button type="submit" disabled={!coverFile} className="px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed font-bold">Actualizar portada</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* SECCIÓN DE PUBLICACIONES */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/50 overflow-hidden relative">
          <div className="px-8 py-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border-b border-white/30 flex items-center justify-between">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">Mis Publicaciones</h3>
            <div className="flex space-x-2">
                  <button aria-label="Vista cuadrícula" onClick={() => setViewMode("grid")} className={`p-3 rounded-xl ${viewMode === "grid" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-white/50"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
                    </svg>
                  </button>
                  <button aria-label="Vista lista" onClick={() => setViewMode("list")} className={`p-3 rounded-xl ${viewMode === "list" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-white/50"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h16v2H4z" />
                    </svg>
                  </button>
            </div>
          </div>
          <div className="p-8">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm3 7a1 1 0 11-2 0 1 1 0 012 0zm-6 0a1 1 0 11-2 0 1 1 0 012 0zm6.9 6.1a5 5 0 01-7.8 0 1 1 0 111.6-1.2 3 3 0 004.6 0 1 1 0 111.6 1.2z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Tu lienzo está esperando</h3>
                <p className="text-gray-600">Crea tu primera publicación y compártela con la comunidad.</p>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                      <div key={post._id} onClick={() => setSelectedPost(post)} className="group relative bg-white/50 rounded-3xl overflow-hidden shadow-lg border border-white/50 hover:shadow-2xl transition-all cursor-pointer">
                        {post.file ? (
                          <img src={`http://localhost:3900/api/publications/image/${post.file}`} alt="Post" className="w-full h-full object-cover" />
                        ) : (
                          <div className="p-8 text-center">{post.text}</div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white space-x-6">
                          <span className="flex items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 21s-6.716-4.35-9.071-6.332C.973 12.99 2 8.5 6 7c2.279-.84 3.5 1 6 3 2.5-2 3.721-3.84 6-3C22 8.5 23.027 12.99 21.071 14.668 18.716 16.65 12 21 12 21z"/></svg><span>{post.likes}</span></span>
                          <span className="flex items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M21 6h-18v12h4l4 4 4-4h6z"/></svg><span>{post.comments.length}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <div key={post._id} onClick={() => setSelectedPost(post)} className="p-6 bg-white/50 rounded-3xl shadow cursor-pointer hover:shadow-lg">
                        <p className="font-medium mb-2">{post.text}</p>
                        <div className="text-sm text-gray-500 flex space-x-4">
                          <span className="flex items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 21s-6.716-4.35-9.071-6.332C.973 12.99 2 8.5 6 7c2.279-.84 3.5 1 6 3 2.5-2 3.721-3.84 6-3C22 8.5 23.027 12.99 21.071 14.668 18.716 16.65 12 21 12 21z"/></svg><span>{post.likes}</span></span>
                          <span className="flex items-center space-x-2"><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M21 6h-18v12h4l4 4 4-4h6z"/></svg><span>{post.comments.length}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* MODAL DETALLE DE POST */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full flex flex-col lg:flex-row overflow-hidden relative">
              <button 
                onClick={() => setSelectedPost(null)} 
                className="absolute top-4 right-4 z-60 w-10 h-10 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl font-bold text-lg"
                aria-label="Cerrar detalle"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {selectedPost.file && (
                <div className="flex-1 bg-black flex items-center justify-center">
                  <img src={`http://localhost:3900/api/publications/image/${selectedPost.file}`} alt="" className="max-h-[90vh]" />
                </div>
              )}
              <div className="w-full lg:w-96 p-6 flex flex-col">
                <h4 className="text-black font-bold">{user.name} {user.surname}</h4>
<p className="text-sm text-black mb-6">@{user.nick}</p>
<p className="mb-6 text-black">{selectedPost.text}</p>
                <div className="flex space-x-4 mb-6">
                  {/* Botón de me gusta SIN onClick */}
                  <button className="px-3 py-2 bg-red-100 text-red-600 rounded-xl flex items-center space-x-2" disabled aria-label="Me gusta">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M12 21s-6.716-4.35-9.071-6.332C.973 12.99 2 8.5 6 7c2.279-.84 3.5 1 6 3 2.5-2 3.721-3.84 6-3C22 8.5 23.027 12.99 21.071 14.668 18.716 16.65 12 21 12 21z"/>
                    </svg>
                    <span className="text-sm">{selectedPost.likes}</span>
                  </button>
                <button
  onClick={() => openEditModal(selectedPost)}
  className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-all duration-300"
  aria-label="Editar publicación"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487a2.1 2.1 0 0 1 2.971 2.972l-9.15 9.15-3.182.353a.75.75 0 0 1-.823-.823l.353-3.182 9.15-9.15z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 7.5L16.5 4.5"
    />
  </svg>
</button>


                  <button onClick={() => handleDeletePost(selectedPost._id)} className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center" aria-label="Eliminar publicación">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6M10 6V4a2 2 0 012-2h0a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
                <div>
                 <h5 className="font-bold mb-2 text-black">
    Comentarios ({selectedPost.comments.length})
  </h5>
  <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                    {selectedPost.comments.map((c, i) => (
                      <div key={i} className="bg-gray-100 p-2 rounded-xl text-black">{c}</div>
                    ))}
                  </div>
                  <CommentForm postId={selectedPost._id} onComment={handleComment} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL EDICIÓN */}
   {editingPost && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative text-black">
      {/* Botón cerrar */}
      <button 
        onClick={() => setEditingPost(null)} 
        className="absolute top-4 right-4 z-60 w-8 h-8 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg font-bold text-sm"
        aria-label="Cerrar edición"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Título */}
      <h3 className="font-bold mb-4 pr-8 text-black">Editar publicación</h3>

      {/* Campo de texto */}
      <textarea
        value={newText}
        onChange={(e) => setNewText(e.target.value)}
        className="w-full border border-gray-300 rounded-xl p-3 mb-4 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
      />

      {/* Archivo */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setNewFile(e.target.files[0])}
        className="mb-4 text-black"
      />

      {/* Botones */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={saveEditPost}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Guardar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentForm({ postId, onComment }) {
  const [comment, setComment] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onComment(postId, comment);
    setComment("");
  };

  return (
    <form onSubmit={submit} className="flex space-x-3">
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Escribe un comentario..."
        className="flex-1 border border-gray-300 rounded-xl px-4 py-2"
      />
      <button
        type="submit"
        disabled={!comment.trim()}
        className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white rounded-full flex items-center justify-center"
        aria-label="Enviar comentario"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transform rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M22 2l-7 20 2-7 7-13z" />
        </svg>
      </button>
    </form>
  );
}