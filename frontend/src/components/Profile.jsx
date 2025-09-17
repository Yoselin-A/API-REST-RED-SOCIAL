import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Profile({ user, token, setUser }) {
  const [posts, setPosts] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [newText, setNewText] = useState("");
  const [newFile, setNewFile] = useState(null);

  // Cargar publicaciones del usuario
  useEffect(() => {
    if (!user?._id) return;
    const fetchUserPosts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3900/api/publications/user/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // inicializar likes y comentarios
        const enhanced = (res.data.publications || []).map((p) => ({
          ...p,
          likes: JSON.parse(localStorage.getItem(`likes_${p._id}`)) || 0,
          comments: JSON.parse(localStorage.getItem(`comments_${p._id}`)) || [],
        }));

        setPosts(enhanced);
      } catch (err) {
        console.error("Error cargando publicaciones:", err.response?.data || err.message);
      }
    };
    fetchUserPosts();
  }, [user, token]);

  // Subir nuevo avatar
  const handleAvatarUpload = async (e) => {
    e.preventDefault();
    if (!avatar) return;

    const formData = new FormData();
    formData.append("avatar", avatar);

    try {
      await axios.post("http://localhost:3900/api/users/upload-avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // 🔄 Recargar usuario actualizado
      const profileRes = await axios.get("http://localhost:3900/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem("user", JSON.stringify(profileRes.data.user));
      setUser(profileRes.data.user);
      setMessage("✅ Avatar actualizado con éxito");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al actualizar avatar");
    }
  };

  // Eliminar publicación
  const handleDeletePost = async (postId) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta publicación?")) return;
    try {
      await axios.delete(`http://localhost:3900/api/publications/remove/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter((p) => p._id !== postId));
      setMessage("🗑️ Publicación eliminada");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al eliminar publicación");
    }
  };

  // Abrir modal de edición
  const openEditModal = (post) => {
    setEditingPost(post);
    setNewText(post.text);
    setNewFile(null);
  };

  // Guardar cambios de edición
  const saveEditPost = async () => {
    try {
      let updatedPost = { ...editingPost };

      // 1. Actualizar texto
      if (newText !== editingPost.text) {
        const res = await axios.put(
          `http://localhost:3900/api/publications/update/${editingPost._id}`,
          { text: newText },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        updatedPost = res.data.publication;
      }

      // 2. Subir nueva imagen
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

      // 3. Actualizar en estado local
      setPosts(posts.map((p) => (p._id === updatedPost._id ? { ...updatedPost, likes: p.likes, comments: p.comments } : p)));

      setEditingPost(null);
      setMessage("✏️ Publicación actualizada");
    } catch (err) {
      console.error("Error al editar publicación:", err.response?.data || err.message);
      setMessage("❌ Error al actualizar publicación");
    }
  };

  // Likes
  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, likes: p.likes + 1 } : p
      )
    );
    const newLikes = (JSON.parse(localStorage.getItem(`likes_${postId}`)) || 0) + 1;
    localStorage.setItem(`likes_${postId}`, newLikes);
  };

  // Comentarios
  const handleComment = (postId, comment) => {
    if (!comment.trim()) return;

    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, comments: [...p.comments, comment] } : p
      )
    );

    const currentComments = JSON.parse(localStorage.getItem(`comments_${postId}`)) || [];
    localStorage.setItem(`comments_${postId}`, JSON.stringify([...currentComments, comment]));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {message && (
        <div className="mb-4 p-2 text-center bg-gray-100 rounded shadow text-sm">
          {message}
        </div>
      )}

      {/* Info usuario */}
      <div className="bg-white shadow rounded-lg p-6 flex items-center gap-6 mb-8">
        <img
          src={`http://localhost:3900/api/users/avatar/${user.image}`}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-blue-500"
        />
        <div>
          <h2 className="text-2xl font-bold">{user.name} {user.surname}</h2>
          <p className="text-gray-500">@{user.nick}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
      </div>

      {/* Cambiar avatar */}
      <form onSubmit={handleAvatarUpload} className="mb-8 flex items-center gap-4">
        <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
          file:rounded-full file:border-0 file:text-sm file:font-semibold 
          file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Cambiar avatar
        </button>
      </form>

      {/* Publicaciones */}
      <h3 className="text-xl font-bold mb-4">Mis publicaciones</h3>
      {posts.length === 0 ? (
        <p className="text-gray-500">📭 Aún no has publicado nada.</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post._id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition">
              {post.file && (
                <img
                  src={`http://localhost:3900/api/publications/image/${post.file}`}
                  alt="Publicación"
                  className="w-full max-h-[400px] object-cover"
                />
              )}
              <div className="p-4">
                <p className="text-gray-700">{post.text}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(post.created_at).toLocaleString()}</p>

                {/* Likes */}
                <button onClick={() => handleLike(post._id)} className="mt-3 text-red-500 hover:scale-110 transition transform">
                  ❤️ {post.likes}
                </button>

                {/* Comentarios */}
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">💬 Comentarios</h4>
                  <ul className="space-y-2 max-h-32 overflow-y-auto">
                    {post.comments.map((c, idx) => (
                      <li key={idx} className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                        {c}
                      </li>
                    ))}
                  </ul>
                  <CommentForm postId={post._id} onComment={handleComment} />
                </div>

                {/* Botones editar/eliminar */}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEditModal(post)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm">
                    Editar
                  </button>
                  <button onClick={() => handleDeletePost(post._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edición */}
      {editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Editar publicación</h2>
            <textarea value={newText} onChange={(e) => setNewText(e.target.value)} className="w-full border rounded p-2 mb-3" />
            <input type="file" accept="image/*" onChange={(e) => setNewFile(e.target.files[0])} className="mb-3" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingPost(null)} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
              <button onClick={saveEditPost} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentForm({ postId, onComment }) {
  const [comment, setComment] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onComment(postId, comment);
    setComment("");
  };

  return (
    <form onSubmit={submit} className="flex gap-2 mt-2">
      <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
        placeholder="Escribe un comentario..." className="flex-1 border rounded p-2 text-sm"
      />
      <button type="submit" className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700">
        ➤
      </button>
    </form>
  );
}