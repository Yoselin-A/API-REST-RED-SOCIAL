import React, { useState } from "react";
import axios from "axios";

export default function CreatePost({ token }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3900/api/publications/create",
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const publication = res.data.publication;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        await axios.post(
          `http://localhost:3900/api/publications/upload-image/${publication._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setMessage("success");
      setText("");
      setFile(null);
      setImagePreview(null);
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error(err);
      setMessage("error");
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full transition-colors duration-500 dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:via-[#0f172a] dark:to-[#052e16] bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden fixed inset-0">
      {/* Partículas decorativas */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl dark:opacity-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl dark:opacity-10"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-yellow-200/10 to-orange-200/10 rounded-full blur-2xl dark:opacity-0"></div>

      {/* Notificación */}
      {message && (
        <div className="fixed top-8 right-8 z-50 transform transition-all duration-700 ease-out">
          <div
            className={`px-8 py-5 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center space-x-4 ${
              message === "success"
                ? "bg-gradient-to-r from-emerald-400/90 to-green-400/90 border-emerald-200/50 text-white"
                : "bg-gradient-to-r from-red-400/90 to-pink-400/90 border-red-200/50 text-white"
            }`}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/20">
              {message === "success" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l5.516 9.82c.75 1.335-.213 2.981-1.742 2.981H4.483c-1.53 0-2.492-1.646-1.742-2.98l5.516-9.82zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-.993.883L9 6v4a1 1 0 001.993.117L11 10V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="font-bold">
                {message === "success" ? "¡Publicación creada!" : "Error"}
              </p>
              <p className="text-sm opacity-90">
                {message === "success"
                  ? "Tu publicación se ha creado correctamente"
                  : "Ocurrió un error, intenta de nuevo"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor principal */}
      <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
        <div className="bg-white/70 dark:bg-[#0f172a]/90 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/50 dark:border-gray-700 overflow-hidden relative">
          {/* Encabezado */}
          <div className="px-8 py-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border-b border-white/30 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent dark:text-white">
              Crear publicación
            </h3>
          </div>

          {/* Formulario */}
          <div className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Texto */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="¿Qué quieres compartir hoy?"
                rows="4"
                maxLength={500}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-2xl p-4 text-gray-800 dark:text-gray-100 bg-white/70 dark:bg-[#0f172a]/80 focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder-gray-500 dark:placeholder-gray-400"
              />

              {/* Imagen previa */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-2xl border border-gray-200 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:scale-110 transition"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Subida de imagen */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-400 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                    <span className="text-2xl text-white">📸</span>
                  </div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200">
                    {file ? file.name : "Selecciona una imagen o arrástrala aquí"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    PNG, JPG o GIF (máx. 5MB)
                  </p>
                </label>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setText("");
                    setFile(null);
                    setImagePreview(null);
                  }}
                  className="px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  disabled={(!text.trim() && !file) || isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? "Publicando..." : "Publicar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
