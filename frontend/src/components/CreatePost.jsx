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

      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      console.error(err);
      setMessage("error");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-yellow-200/10 to-orange-200/10 rounded-full blur-2xl animate-float"></div>

      {/* Floating particles */}
      <div className="absolute top-20 left-20 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce"></div>
      <div className="absolute top-40 right-32 w-2 h-2 bg-pink-400/40 rounded-full animate-ping"></div>
      <div className="absolute bottom-32 left-40 w-4 h-4 bg-blue-400/30 rounded-full animate-pulse"></div>

      {/* Success/Error Notification */}
      {message && (
        <div className={`fixed top-8 right-8 z-50 transform transition-all duration-700 ease-out ${
          message ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
        }`}>
          <div className={`px-8 py-5 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center space-x-4 ${
            message === "success" 
              ? "bg-gradient-to-r from-emerald-400/90 to-green-400/90 border-emerald-200/50 text-white shadow-emerald-200/50" 
              : "bg-gradient-to-r from-red-400/90 to-pink-400/90 border-red-200/50 text-white shadow-red-200/50"
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              message === "success" ? "bg-white/20" : "bg-white/20"
            }`}>
              {message === "success" ? "✨" : "💫"}
            </div>
            <div>
              <p className="font-bold">
                {message === "success" ? "¡Increíble!" : "¡Oops!"}
              </p>
              <p className="text-sm opacity-90">
                {message === "success" ? "Tu post se publicó exitosamente" : "Algo salió mal, intenta de nuevo"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-16 relative z-10">
        {/* Main Card */}
        <div className="bg-white/70 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/50 overflow-hidden relative">
          {/* Luxury gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-[32px] p-[2px]">
            <div className="bg-white/80 backdrop-blur-2xl rounded-[30px] h-full"></div>
          </div>

          <div className="relative z-10">
            {/* Header with gradient */}
            <div className="px-10 py-8 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border-b border-white/30">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    Crear Publicación
                  </h1>
                  <p className="text-gray-600 mt-2">Comparte tu creatividad con el mundo ✨</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🎨</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Text Input with neon glow */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-300"></div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="¿Qué quieres compartir hoy? ✨"
                    rows="5"
                    maxLength={500}
                    className="relative w-full bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-0 rounded-3xl p-8 text-gray-800 resize-none focus:outline-none focus:ring-4 focus:ring-purple-200/50 placeholder-gray-500 text-lg leading-relaxed transition-all duration-300"
                  />
                  <div className="absolute bottom-6 right-8 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-xs font-bold text-purple-600 backdrop-blur-sm">
                    {text.length}/500
                  </div>
                </div>

                {/* Image Preview with organic shapes */}
                {imagePreview && (
                  <div className="relative group">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-100 to-pink-100 p-2">
                      <div className="rounded-2xl overflow-hidden">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-80 object-cover transform group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-2xl hover:shadow-red-200/50 hover:scale-110"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Upload Area - Creative Design */}
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    id="file-upload"
                  />
                  
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-3xl blur-sm group-hover:blur-md transition duration-300"></div>
                    <label 
                      htmlFor="file-upload"
                      className="relative flex items-center justify-center w-full p-12 border-3 border-dashed border-purple-300/50 rounded-3xl cursor-pointer hover:border-pink-400/70 transition-all duration-500 group bg-gradient-to-br from-purple-50/30 to-pink-50/30 backdrop-blur-sm"
                    >
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition duration-300 shadow-2xl">
                          <span className="text-3xl">📸</span>
                        </div>
                        <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                          {file ? file.name : "Arrastra tu imagen aquí"}
                        </p>
                        <p className="text-gray-600 font-medium">
                          O haz clic para explorar tus archivos
                        </p>
                        <div className="flex justify-center space-x-4 mt-4">
                          <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-bold">PNG</span>
                          <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-bold">JPG</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">GIF</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Creative Action Buttons */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 pt-8 border-t border-gradient-to-r from-purple-200/30 to-pink-200/30">
                  {/* Creative Tools */}
                  <div className="flex flex-wrap gap-3">
                    
                   
                                </div>

                  {/* Main Actions */}
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setText("");
                        setFile(null);
                        setImagePreview(null);
                      }}
                      className="px-8 py-4 text-gray-600 hover:text-gray-800 font-bold transition-all duration-300 hover:bg-gray-100/50 rounded-2xl"
                    >
                      Limpiar
                    </button>
                    
                    <button
                      type="submit"
                      disabled={(!text.trim() && !file) || isLoading}
                      className="relative px-10 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white rounded-2xl hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-2xl hover:shadow-purple-200/50 overflow-hidden"
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] animate-shimmer"></div>
                      
                      {isLoading ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Publicando magia...</span>
                          <span>✨</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <span>Publicar</span>
                          <span className="text-xl">🚀</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Inspirational Quote */}
        <div className="mt-10 text-center">
          <div className="inline-block bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl px-8 py-4 border border-white/30">
            <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              "Cada publicación es una obra de arte" 🎨
            </p>
           
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}