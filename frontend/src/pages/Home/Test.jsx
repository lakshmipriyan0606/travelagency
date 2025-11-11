import React, { useState } from "react";

export default function UploadPackage() {
  const [result, setResult] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const res = await fetch("http://localhost:5000/api/packages/create", {
      method: "POST",
      credentials: "include", // important for cookie auth
      body: formData,
    });

    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>


      <h2>Upload Travel Package (React Test UI)</h2>

      <TestLogin/>

      <form onSubmit={handleSubmit}>
        <label>Package Title:</label>
        <input type="text" name="title" required />

        <label>Description:</label>
        <textarea name="description" required />

        <label>Location:</label>
        <input type="text" name="location" required />

        <label>Price:</label>
        <input type="number" name="price" required />

        <label>Images (max 3):</label>
        <input type="file" name="images" multiple accept="image/*" required />

        <button type="submit" style={{ marginTop: "15px" }}>
          Upload
        </button>
      </form>

      {result && (
        <pre style={{ marginTop: "20px", color: "green" }}>{result}</pre>
      )}
    </div>
  );
}


 function TestLogin() {
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    setMessage(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Test Login</h2>
      <form onSubmit={handleLogin}>
        <input name="email" placeholder="Email" defaultValue="admin@test.com" />
        <input name="password" placeholder="Password" defaultValue="123456" />
        <button type="submit">Login</button>
      </form>

      {message && <pre style={{ marginTop: 20 }}>{message}</pre>}
    </div>
  );
}
