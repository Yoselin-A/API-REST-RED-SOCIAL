import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3900/api/publications";

export default function Feed({ token }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [sidebarError, setSidebarError] = useState(null);

  // Escuchar cambios globales de follows para mantener sincronizado el estado
  useEffect(() => {
    const handler = (e) => {
      const { id, action } = e.detail || {};
      if (!id) return;
      if (action === 'follow') {
        setFollowingIds((prev) => new Set(prev).add(id));
      } else if (action === 'unfollow') {
        setFollowingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      }
    };
    window.addEventListener('followsChanged', handler);
    return () => window.removeEventListener('followsChanged', handler);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${API_URL}/feed`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const enhancedPosts = (res.data.feed || []).map((post) => ({
          ...post,
          likes: JSON.parse(localStorage.getItem(`likes_${post._id}`)) || 0,
          liked: JSON.parse(localStorage.getItem(`liked_${post._id}`)) || false,
          comments:
            JSON.parse(localStorage.getItem(`comments_${post._id}`)) || [],
        }));

        setPosts(enhancedPosts);
      } catch (err) {
        console.error("Error cargando feed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    // Fetch users list and current following
    const fetchUsersAndFollowing = async () => {
      if (!token) return;
      setSidebarLoading(true);
      setSidebarError(null);
      try {
        const usersRes = await axios.get("http://localhost:3900/api/users/list?limit=8", {
          headers: { Authorization: `Bearer ${token}` },
        });

          // obtener mi perfil para excluirme de la lista
          let myId = null;
          try {
            const profileRes = await axios.get("http://localhost:3900/api/users/profile", { headers: { Authorization: `Bearer ${token}` } });
            myId = profileRes.data.user?._id || profileRes.data.user?.id || null;
          } catch (e) {
            // si falla el profile, seguimos sin filtrar
            console.warn('No se pudo obtener perfil para filtrar:', e.message || e);
          }

          const followRes = await axios.get("http://localhost:3900/api/follows/following", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ids = new Set((followRes.data.following || []).map((f) => (f.followed && f.followed._id) || f.followed));

  // filtrar usuario actual
  const rawUsers = usersRes.data.users || [];
  const filtered = myId ? rawUsers.filter((u) => u._id !== myId && u.id !== myId) : rawUsers;
  setUsersList(filtered);
        setFollowingIds(ids);
      } catch (err) {
        console.error("Error cargando usuarios/seguimientos:", err);
        setSidebarError(err.response?.data?.message || err.message || 'Error al cargar');
        setUsersList([]);
      } finally {
        setSidebarLoading(false);
      }
    };
    fetchUsersAndFollowing();
  }, [token]);

  const handleLike = (postId) => {
    // toggle like: only one like per user per post
    const currentlyLiked = JSON.parse(localStorage.getItem(`liked_${postId}`)) || false;
    if (currentlyLiked) {
      // remove like
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: Math.max(0, p.likes - 1), liked: false } : p
        )
      );
      // update selectedPost if open
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost((sp) => ({ ...sp, likes: Math.max(0, sp.likes - 1), liked: false }));
      }
      const newLikes = Math.max(0, (JSON.parse(localStorage.getItem(`likes_${postId}`)) || 0) - 1);
      localStorage.setItem(`likes_${postId}`, newLikes);
      localStorage.setItem(`liked_${postId}`, false);
    } else {
      // add like
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: (p.likes || 0) + 1, liked: true } : p
        )
      );
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost((sp) => ({ ...sp, likes: (sp.likes || 0) + 1, liked: true }));
      }
      const newLikes = (JSON.parse(localStorage.getItem(`likes_${postId}`)) || 0) + 1;
      localStorage.setItem(`likes_${postId}`, newLikes);
      localStorage.setItem(`liked_${postId}`, true);
    }
  };

  const handleComment = (postId, comment) => {
    if (!comment.trim()) return;
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, comments: [...p.comments, comment] }
          : p
      )
    );
    const currentComments =
      JSON.parse(localStorage.getItem(`comments_${postId}`)) || [];
    localStorage.setItem(
      `comments_${postId}`,
      JSON.stringify([...currentComments, comment])
    );
  };

  const getUserInitials = (user) => {
    if (!user || !user.name) return "U";
    const names = `${user.name} ${user.surname || ""}`.split(" ");
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  // Follow / Unfollow actions
  const followUser = async (id) => {
    // optimistically update
    setFollowingIds((prev) => new Set(prev).add(id));
    try {
      await axios.post(`http://localhost:3900/api/follows/follow/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error siguiendo usuario:", err);
      // revert
      setFollowingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const unfollowUser = async (id) => {
    // optimistically update
    setFollowingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    try {
      await axios.delete(`http://localhost:3900/api/follows/unfollow/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Error dejando de seguir usuario:", err);
      // revert
      setFollowingIds((prev) => new Set(prev).add(id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center dark:from-[#0a0a0a] dark:via-[#0f172a] dark:to-[#052e16]">
        <div className="bg-white/70 dark:bg-[#0f172a]/80 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/50 dark:border-gray-700 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-2xl text-white">⏳</span>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
            Cargando publicaciones...
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Por favor espera un momento ✨
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full transition-colors duration-500 dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:via-[#0f172a] dark:to-[#052e16] bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden fixed inset-0">
      {/* Fondo decorativo */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 dark:from-purple-900/10 dark:to-pink-900/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-yellow-200/10 to-orange-200/10 dark:from-yellow-900/5 dark:to-orange-900/5 rounded-full blur-2xl"></div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        {/* Encabezado */}
        <div className="px-8 py-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border-b border-white/30 dark:border-gray-700 rounded-t-[32px] mb-10">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
            Publicaciones Recientes
          </h3>
         
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de publicaciones */}
          <div className="col-span-2 space-y-8">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white/70 dark:bg-[#0f172a]/90 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/50 dark:border-gray-700 overflow-hidden"
            >
              {/* Header del post */}
              <div className="p-6 border-b border-white/30 dark:border-gray-700 flex items-center space-x-4">
                {post.user?.image ? (
                  <img
                    src={`http://localhost:3900/api/users/avatar/${post.user.image}`}
                    alt="Avatar"
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl border-2 border-white bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {getUserInitials(post.user)}
                  </div>
                )}

                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {post.user?.name} {post.user?.surname}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    @{post.user?.nick}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedPost(post)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-pink-300 rounded-2xl hover:from-purple-500/30 hover:to-pink-500/30 transition font-medium"
                >
                  Ver más
                </button>
              </div>

              {/* Imagen del post */}
              {post.file && (
                <img
                  src={`http://localhost:3900/api/publications/image/${post.file}`}
                  alt="Publicación"
                  className="w-full h-80 object-cover"
                  onClick={() => setSelectedPost(post)}
                />
              )}
              {/* Contenido del post */}
              <div className="p-6">
                {post.text && (
                  <p
                    className="text-gray-800 dark:text-gray-100 mb-6 leading-relaxed cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                  >
                    {post.text}
                  </p>
                )}

                {/* Acciones */}
                <div className="flex items-center justify-between border-t border-white/30 dark:border-gray-700 pt-4">
                  <div className="flex items-center space-x-4">
                    {/* Like */}
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-2xl transition font-medium ${post.liked ? 'bg-red-500 text-white' : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-600 dark:from-red-900/40 dark:to-pink-900/40 dark:text-red-300 hover:from-red-200 hover:to-pink-200'}`}
                    >
                      <span>{post.liked ? '❤️' : '🤍'}</span>
                      <span>{post.likes}</span>
                    </button>

                    {/* Comentarios */}
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 text-blue-600 dark:text-blue-300 rounded-2xl hover:from-blue-200 hover:to-cyan-200 transition font-medium"
                    >
                      <span>💬</span>
                      <span>{post.comments.length}</span>
                    </button>
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Comentarios previos */}
                {post.comments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {post.comments.slice(-2).map((comment, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-purple-50/60 to-pink-50/60 dark:from-purple-900/40 dark:to-pink-900/40 p-3 rounded-2xl text-gray-800 dark:text-gray-100"
                      >
                        {comment}
                      </div>
                    ))}
                    {post.comments.length > 2 && (
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="text-sm text-purple-600 dark:text-purple-300 hover:text-purple-700"
                      >
                        Ver los {post.comments.length - 2} comentarios restantes...
                      </button>
                    )}
                  </div>
                )}

                {/* Formulario de comentario */}
                <div className="mt-4">
                  <CommentForm postId={post._id} onComment={handleComment} />
                </div>
              </div>
            </div>
          ))}
          </div>

          {/* Sidebar de usuarios */}
          <aside className="col-span-1 bg-white/70 dark:bg-[#0f172a]/90 backdrop-blur-2xl rounded-[24px] shadow-lg border border-white/40 dark:border-gray-700 p-6">
            <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Personas</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Conéctate con gente en la red</p>

            <div className="space-y-4">
              {sidebarLoading && (
                <div className="text-sm text-gray-500">Cargando personas...</div>
              )}

              {sidebarError && (
                <div className="text-sm text-red-500">
                  Error: {sidebarError}
                  <button onClick={() => {
                    // reintentar
                    setSidebarError(null);
                    setSidebarLoading(true);
                    (async () => {
                      try {
                        const usersRes = await axios.get("http://localhost:3900/api/users/list?limit=8", { headers: { Authorization: `Bearer ${token}` } });
                        const followRes = await axios.get("http://localhost:3900/api/follows/following", { headers: { Authorization: `Bearer ${token}` } });
                        const ids = new Set((followRes.data.following || []).map((f) => (f.followed && f.followed._id) || f.followed));
                        setUsersList(usersRes.data.users || []);
                        setFollowingIds(ids);
                      } catch (err) {
                        console.error('Reintento fallido', err);
                        setSidebarError(err.response?.data?.message || err.message || 'Error al recargar');
                      } finally {
                        setSidebarLoading(false);
                      }
                    })();
                  }} className="ml-2 text-sm text-blue-600 underline">Reintentar</button>
                </div>
              )}

              {!sidebarLoading && !sidebarError && usersList.length === 0 && (
                <div className="text-sm text-gray-500">No hay usuarios para mostrar</div>
              )}

              {usersList.map((u) => (
                <div key={u._id} className="flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-3">
                    {u.image ? (
                      <img src={`http://localhost:3900/api/users/avatar/${u.image}`} alt="avatar" className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl border-2 border-white bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {getUserInitials(u)}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{u.name} {u.surname}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">@{u.nick}</div>
                    </div>
                  </div>

                  <div>
                    {followingIds.has(u._id) ? (
                      <button onClick={() => unfollowUser(u._id)} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-800 rounded-full">Siguiendo</button>
                    ) : (
                      <button onClick={() => followUser(u._id)} className="px-3 py-1 text-sm bg-purple-600 text-white rounded-full">Seguir</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* Modal de detalle */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-[32px] shadow-2xl max-w-4xl w-full flex flex-col lg:flex-row overflow-hidden relative">
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
              >
                ✕
              </button>

              {selectedPost.file && (
                <div className="flex-1 bg-black/5 flex items-center justify-center">
                  <img
                    src={`http://localhost:3900/api/publications/image/${selectedPost.file}`}
                    alt=""
                    className="max-h-[80vh] object-contain"
                  />
                </div>
              )}

              <div className="w-full lg:w-96 p-6 flex flex-col">
                <div className="flex items-center space-x-3 mb-6 border-b border-white/30 dark:border-gray-700 pb-4">
                  {selectedPost.user?.image ? (
                    <img
                      src={`http://localhost:3900/api/users/avatar/${selectedPost.user.image}`}
                      alt="Avatar"
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl border-2 border-white bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      {getUserInitials(selectedPost.user)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">
                      {selectedPost.user?.name} {selectedPost.user?.surname}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      @{selectedPost.user?.nick}
                    </p>
                  </div>
                </div>

                <p className="text-gray-800 dark:text-gray-100 mb-6 leading-relaxed">
                  {selectedPost.text}
                </p>

                <div className="flex items-center space-x-4 mb-6 border-b border-white/30 dark:border-gray-700 pb-4">
                  <button
                    onClick={() => handleLike(selectedPost._id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-2xl transition font-medium ${selectedPost.liked ? 'bg-red-500 text-white' : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-600 dark:from-red-900/40 dark:to-pink-900/40 dark:text-red-300 hover:from-red-200 hover:to-pink-200'}`}
                  >
                    <span>{selectedPost.liked ? '❤️' : '🤍'}</span>
                    <span>{selectedPost.likes}</span>
                  </button>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 text-blue-600 dark:text-blue-300 rounded-2xl font-medium">
                    <span>💬</span>
                    <span>{selectedPost.comments.length}</span>
                  </div>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                  {selectedPost.comments.map((comment, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-r from-purple-50/60 to-pink-50/60 dark:from-purple-900/40 dark:to-pink-900/40 p-3 rounded-2xl text-gray-800 dark:text-gray-100"
                    >
                      {comment}
                    </div>
                  ))}
                </div>
                <CommentForm
                  postId={selectedPost._id}
                  onComment={handleComment}
                />
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
        className="flex-1 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 bg-white/70 dark:bg-[#0f172a]/80 text-gray-800 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-700"
      />
      <button
        type="submit"
        disabled={!comment.trim()}
        className="px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white rounded-2xl font-bold shadow-md hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ➤
      </button>
    </form>
  );
}
