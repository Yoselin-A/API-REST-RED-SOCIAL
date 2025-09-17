import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3900/api/publications";

export default function Feed({ token }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <p className="text-center mt-6">⏳ Cargando publicaciones...</p>;
  }

  if (!posts.length) {
    return <p className="text-center mt-6">📭 No hay publicaciones aún.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">
        📸 Feed de publicaciones
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition flex flex-col"
          >
            {post.file && (
              <img
                src={`http://localhost:3900/api/publications/image/${post.file}`}
                alt="Publicación"
                className="w-full h-64 object-cover"
              />
            )}

            <div className="p-4 flex flex-col flex-1">
              <p className="text-gray-700">{post.text}</p>
              <p className="text-sm text-gray-500 mt-2">
                ✍️ {post.user?.name} (@{post.user?.nick})
              </p>

              {/* Likes */}
              <button
                onClick={() => handleLike(post._id)}
                className="mt-4 text-red-500 hover:scale-110 transition transform self-start"
              >
                ❤️ {post.likes}
              </button>

              {/* Comentarios */}
              <div className="mt-4">
                <h4 className="font-semibold mb-2">💬 Comentarios</h4>
                <ul className="space-y-2 max-h-32 overflow-y-auto">
                  {post.comments.map((c, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 bg-gray-100 p-2 rounded"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
                <CommentForm postId={post._id} onComment={handleComment} />
              </div>
            </div>
          </div>
        ))}
      </div>
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
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Escribe un comentario..."
        className="flex-1 border rounded p-2 text-sm"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700"
      >
        ➤
      </button>
    </form>
  );
}