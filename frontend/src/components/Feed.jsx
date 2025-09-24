import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3900/api/publications";

export default function Feed({ token }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${API_URL}/feed`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Inicializar likes y comentarios desde localStorage
        const enhancedPosts = (res.data.feed || []).map((post) => ({
          ...post,
          likes: JSON.parse(localStorage.getItem(`likes_${post._id}`)) || 0,
          comments: JSON.parse(localStorage.getItem(`comments_${post._id}`)) || [],
        }));

        setPosts(enhancedPosts);
      } catch (err) {
        console.error("Error cargando feed:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [token]);

  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, likes: p.likes + 1 } : p
      )
    );
    const newLikes = (JSON.parse(localStorage.getItem(`likes_${postId}`)) || 0) + 1;
    localStorage.setItem(`likes_${postId}`, newLikes);
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

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/50 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto mb-6 flex items-center justify-center animate-spin">
              <span className="text-2xl">⏳</span>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Cargando tu feed...
            </h3>
            <p className="text-gray-600 mt-2">Preparando las últimas publicaciones ✨</p>
          </div>
        </div>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/50 p-12 text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <span className="text-4xl">📭</span>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Tu feed está vacío
            </h3>
            <p className="text-gray-600">¡Sigue a más personas para ver sus increíbles publicaciones! ✨</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Partículas */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-yellow-200/10 to-orange-200/10 rounded-full blur-2xl animate-float"></div>

      {/* CONTENIDO */}
      <div className="max-w-4xl mx-auto px-6 py-8 relative z-10">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
            ✨ Tu Feed Personal
          </h2>
          <p className="text-xl text-gray-600 font-medium">
            Descubre las últimas creaciones de las personas que sigues
          </p>
        </div>

        {/* POSTS FEED */}
        <div className="space-y-8">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white/70 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/50 overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1"
            >
              {/* HEADER DEL POST */}
              <div className="p-6 border-b border-white/30">
                <div className="flex items-center space-x-4">
                  {/* Avatar del usuario */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-2xl blur opacity-60 group-hover:opacity-80 transition duration-300"></div>
                    <div className="relative">
                      {post.user?.image ? (
                        <img
                          src={`http://localhost:3900/api/users/avatar/${post.user.image}`}
                          alt="Avatar"
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-lg bg-white"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold" style={{ display: post.user?.image ? "none" : "flex" }}>
                        {getUserInitials(post.user)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Info del usuario */}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">
                      {post.user?.name} {post.user?.surname}
                    </h4>
                    <p className="text-gray-600 text-sm">@{post.user?.nick}</p>
                  </div>
                  
                  {/* Botón para ver detalle */}
                  <button
                    onClick={() => setSelectedPost(post)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 rounded-2xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 font-medium"
                  >
                    Ver más
                  </button>
                </div>
              </div>

              {/* IMAGEN DEL POST */}
              {post.file && (
                <div className="relative group cursor-pointer" onClick={() => setSelectedPost(post)}>
                  <img
                    src={`http://localhost:3900/api/publications/image/${post.file}`}
                    alt="Publicación"
                    className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3">
                      <span className="text-white font-bold">👀 Ver completo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENIDO DEL POST */}
              <div className="p-6">
                {post.text && (
                  <p className="text-gray-800 text-lg leading-relaxed mb-6 cursor-pointer" onClick={() => setSelectedPost(post)}>
                    {post.text}
                  </p>
                )}

                {/* ACCIONES */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {/* Like */}
                    <button
                      onClick={() => handleLike(post._id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-100/80 to-pink-100/80 text-red-600 rounded-2xl hover:from-red-200/80 hover:to-pink-200/80 transition-all duration-300 transform hover:scale-105 font-medium"
                    >
                      <span className="text-xl">❤️</span>
                      <span>{post.likes}</span>
                    </button>

                    {/* Comentarios */}
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100/80 to-cyan-100/80 text-blue-600 rounded-2xl hover:from-blue-200/80 hover:to-cyan-200/80 transition-all duration-300 transform hover:scale-105 font-medium"
                    >
                      <span className="text-xl">💬</span>
                      <span>{post.comments.length}</span>
                    </button>
                  </div>

                  {/* Timestamp */}
                  <div className="text-sm text-gray-500 bg-gray-100/50 px-3 py-1 rounded-full">
                    {new Date(post.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Preview de comentarios */}
                {post.comments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/30">
                    <div className="space-y-2">
                      {post.comments.slice(-2).map((comment, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 p-3 rounded-2xl">
                          <p className="text-gray-700 text-sm">{comment}</p>
                        </div>
                      ))}
                      {post.comments.length > 2 && (
                        <button
                          onClick={() => setSelectedPost(post)}
                          className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors"
                        >
                          Ver los {post.comments.length - 2} comentarios restantes...
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick comment */}
                <div className="mt-4">
                  <CommentForm postId={post._id} onComment={handleComment} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL DETALLE DE POST */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl max-w-4xl w-full flex flex-col lg:flex-row overflow-hidden relative max-h-[90vh]">
              <button 
                onClick={() => setSelectedPost(null)} 
                className="absolute top-4 right-4 z-60 w-10 h-10 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl font-bold text-lg"
              >
                ✕
              </button>
              
              {/* Imagen */}
              {selectedPost.file && (
                <div className="flex-1 bg-black/5 flex items-center justify-center">
                  <img 
                    src={`http://localhost:3900/api/publications/image/${selectedPost.file}`} 
                    alt="" 
                    className="max-h-[80vh] max-w-full object-contain rounded-2xl" 
                  />
                </div>
              )}
              
              {/* Contenido */}
              <div className="w-full lg:w-96 p-6 flex flex-col overflow-y-auto">
                {/* Header del usuario */}
                <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-white/30">
                  {selectedPost.user?.image ? (
                    <img
                      src={`http://localhost:3900/api/users/avatar/${selectedPost.user.image}`}
                      alt="Avatar"
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl border-2 border-white shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {getUserInitials(selectedPost.user)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedPost.user?.name} {selectedPost.user?.surname}</h4>
                    <p className="text-sm text-gray-600">@{selectedPost.user?.nick}</p>
                  </div>
                </div>
                
                {/* Texto */}
                {selectedPost.text && (
                  <p className="text-gray-800 mb-6 leading-relaxed">{selectedPost.text}</p>
                )}
                
                {/* Acciones */}
                <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-white/30">
                  <button
                    onClick={() => handleLike(selectedPost._id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-100 to-pink-100 text-red-600 rounded-2xl hover:from-red-200 hover:to-pink-200 transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="text-xl">❤️</span>
                    <span>{selectedPost.likes}</span>
                  </button>
                  
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600 rounded-2xl">
                    <span className="text-xl">💬</span>
                    <span>{selectedPost.comments.length}</span>
                  </div>
                </div>
                
                {/* Comentarios */}
                <div className="flex-1">
                  <h5 className="font-bold mb-4 text-gray-900">Comentarios</h5>
                  <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                    {selectedPost.comments.map((comment, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 p-3 rounded-2xl">
                        <p className="text-gray-700">{comment}</p>
                      </div>
                    ))}
                  </div>
                  <CommentForm postId={selectedPost._id} onComment={handleComment} />
                </div>
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
        className="flex-1 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all duration-300"
      />
      <button
        type="submit"
        disabled={!comment.trim()}
        className="px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        ➤
      </button>
    </form>
  );
}