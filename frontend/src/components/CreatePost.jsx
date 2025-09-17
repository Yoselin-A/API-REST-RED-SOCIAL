import React, { useState } from "react";
import axios from "axios";

export default function CreatePost({ token }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Crear publicación (solo texto)
      const res = await axios.post(
        "http://localhost:3900/api/publications/create",
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const publication = res.data.publication;

      // 2. Subir imagen (si hay)
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        await axios.post(
          `http://localhost:3900/api/publications/upload-image/${publication._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setMessage("✅ Publicación creada con éxito");
      setText("");
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error al crear publicación");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Crear publicación</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe tu publicación..."
          className="w-full p-3 border rounded resize-none focus:outline-none focus:ring focus:ring-blue-300"
          rows="4"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full text-sm text-gray-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Publicar
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}