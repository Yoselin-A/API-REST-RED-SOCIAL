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

  const getMessageContent = (msgType) => {
    switch (msgType) {
      case "success_avatar":
        return { emoji: "✨", title: "¡Fantástico!", text: "Tu avatar se actualizó perfectamente" };
      case "success_delete":
        return { emoji: "🗑️", title: "¡Eliminado!", text: "Tu publicación se eliminó exitosamente" };
      case "success_edit":
        return { emoji: "🎨", title: "¡Actualizado!", text: "Tu publicación se editó con éxito" };
      default:
        return { emoji: "💫", title: "¡Oops!", text: "Algo salió mal, intenta de nuevo" };
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden fixed inset-0">
      {/* Partículas */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-yellow-200/10 to-orange-200/10 rounded-full blur-2xl animate-float"></div>

      {/* Notificación */}
      {message && (
        <div className="fixed top-8 right-8 z-50 transform transition-all duration-700 ease-out">
          <div className={`px-8 py-5 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center space-x-4 ${
            message.includes("success")
              ? "bg-gradient-to-r from-emerald-400/90 to-green-400/90 border-emerald-200/50 text-white shadow-emerald-200/50"
              : "bg-gradient-to-r from-red-400/90 to-pink-400/90 border-red-200/50 text-white shadow-red-200/50"
          }`}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/20">
              {getMessageContent(message).emoji}
            </div>
            <div>
              <p className="font-bold">{getMessageContent(message).title}</p>
              <p className="text-sm opacity-90">{getMessageContent(message).text}</p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10 min-h-screen overflow-y-auto">
        {/* HEADER PERFIL */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/50 overflow-hidden mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-[32px] p-[2px]">
            <div className="bg-white/80 backdrop-blur-2xl rounded-[30px] h-full"></div>
          </div>
          <div className="relative z-10 p-8 flex flex-col lg:flex-row lg:items-center lg:space-x-8">
            {/* AVATAR */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-3xl blur opacity-60 group-hover:opacity-80 transition duration-300"></div>
              <div className="relative">
                <img
                  src={`http://localhost:3900/api/users/avatar/${user.image}`}
                  alt="Avatar"
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-2xl bg-white"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold" style={{ display: "none" }}>
                  {getUserInitials(user)}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-400 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
                  <span className="text-lg">✨</span>
                </div>
              </div>
            </div>
            {/* INFO */}
            <div className="flex-1 mt-6 lg:mt-0">
              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  {user.name} {user.surname}
                </h1>
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  📸 <span>Cambiar Foto</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center space-x-6 text-gray-600 mb-4">
                <span className="flex items-center bg-purple-100/50 px-3 py-1 rounded-full">
                  <span className="text-purple-500 mr-2">@</span>
                  <span className="font-medium">{user.nick}</span>
                </span>
                <span className="flex items-center bg-blue-100/50 px-3 py-1 rounded-full">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">{user.email}</span>
                </span>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-center bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{posts.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Publicaciones</div>
                </div>
                <div className="text-center bg-gradient-to-br from-pink-50 to-red-50 p-4 rounded-2xl">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">{posts.reduce((a, p) => a + p.likes, 0)}</div>
                  <div className="text-sm text-gray-600 font-medium">Me gusta</div>
                </div>
                <div className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-2xl">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{posts.reduce((a, p) => a + p.comments.length, 0)}</div>
                  <div className="text-sm text-gray-600 font-medium">Comentarios</div>
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
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Cambiar Avatar ✨</h3>
                  <button
                    onClick={() => {
                      setShowAvatarModal(false);
                      setAvatar(null);
                    }}
                    className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
                  >
                    ✕
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
                      Actualizar ✨
                    </button>
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
              <button onClick={() => setViewMode("grid")} className={`p-3 rounded-xl ${viewMode === "grid" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-white/50"}`}>🔲</button>
              <button onClick={() => setViewMode("list")} className={`p-3 rounded-xl ${viewMode === "list" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-white/50"}`}>📜</button>
            </div>
          </div>
          <div className="p-8">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl">🎭</div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Tu lienzo está esperando</h3>
                <p className="text-gray-600">¡Crea tu primera obra maestra y compártela! ✨</p>
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
                          <span>❤️ {post.likes}</span>
                          <span>💬 {post.comments.length}</span>
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
                          <span>❤️ {post.likes}</span>
                          <span>💬 {post.comments.length}</span>
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
              >
                ✕
              </button>
              {selectedPost.file && (
                <div className="flex-1 bg-black flex items-center justify-center">
                  <img src={`http://localhost:3900/api/publications/image/${selectedPost.file}`} alt="" className="max-h-[90vh]" />
                </div>
              )}
              <div className="w-full lg:w-96 p-6 flex flex-col">
                <h4 className="font-bold">{user.name} {user.surname}</h4>
                <p className="text-sm text-gray-500 mb-6">@{user.nick}</p>
                <p className="mb-6">{selectedPost.text}</p>
                <div className="flex space-x-4 mb-6">
                  {/* Botón de me gusta SIN onClick */}
                  <button className="px-4 py-2 bg-red-100 text-red-600 rounded-xl" disabled>
                    ❤️ {selectedPost.likes}
                  </button>
                  <button onClick={() => openEditModal(selectedPost)} className="px-4 py-2 bg-blue-100 text-blue-600 rounded-xl">✏️</button>
                  <button onClick={() => handleDeletePost(selectedPost._id)} className="px-4 py-2 bg-pink-100 text-pink-600 rounded-xl">🗑️</button>
                </div>
                <div>
                  <h5 className="font-bold mb-2">Comentarios ({selectedPost.comments.length})</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                    {selectedPost.comments.map((c, i) => (
                      <div key={i} className="bg-gray-100 p-2 rounded-xl">{c}</div>
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
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative">
              <button 
                onClick={() => setEditingPost(null)} 
                className="absolute top-4 right-4 z-60 w-8 h-8 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg font-bold text-sm"
              >
                ✕
              </button>
              <h3 className="font-bold mb-4 pr-8">Editar publicación</h3>
              <textarea value={newText} onChange={(e) => setNewText(e.target.value)} className="w-full border rounded-xl p-3 mb-4" />
              <input type="file" accept="image/*" onChange={(e) => setNewFile(e.target.files[0])} className="mb-4" />
              <div className="flex justify-end space-x-3">
                <button onClick={saveEditPost} className="px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">
                  ✨ Guardar
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
        className="px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white rounded-xl"
      >
        ➤
      </button>
    </form>
  );
}
