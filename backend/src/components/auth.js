import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3900/api/users";

export default function Auth() {
  const [form, setForm] = useState({ name: "", surname: "", nick: "", email: "", password: "" });
  const [token, setToken] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const register = async () => {
    try {
      const res = await axios.post(`${API_URL}/register`, form);
      alert(res.data.message);
    } catch (err) {
      alert("Error en el registro: " + err.response.data.message);
    }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, {
        email: form.email,
        password: form.password,
      });
      setToken(res.data.token);
      alert("Login exitoso");
      localStorage.setItem("token", res.data.token);
    } catch (err) {
      alert("Error en el login: " + err.response.data.message);
    }
  };

  return (
    <div>
      <h2>Registro / Login</h2>
      <input name="name" placeholder="Nombre" onChange={handleChange} />
      <input name="surname" placeholder="Apellido" onChange={handleChange} />
      <input name="nick" placeholder="Nick" onChange={handleChange} />
      <input name="email" type="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} />
      <br />
      <button onClick={register}>Registrar</button>
      <button onClick={login}>Login</button>
      {token && <p>Token: <code>{token}</code></p>}
    </div>
  );
}