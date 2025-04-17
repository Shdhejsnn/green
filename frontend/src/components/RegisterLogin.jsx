// src/components/RegisterLogin.jsx
import { useState } from "react";
import axios from "axios";

const RegisterLogin = ({ setWallet }) => {
  const [name, setName] = useState("");
  const [companyType, setCompanyType] = useState("0");
  const [walletInput, setWalletInput] = useState("");
  const [companyData, setCompanyData] = useState(null);

  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        name,
        companyType: parseInt(companyType),
        fromAddress: walletInput,
      });
      alert("✅ Registered! TX Hash: " + res.data.txHash);
    } catch (err) {
      console.error(err);
      alert("❌ Registration Failed");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/company/${walletInput}`);
      if (!res.data.registered) {
        alert("❌ Company not registered");
      } else {
        setCompanyData(res.data);
        setWallet(walletInput); // ✅ trigger dashboard in App.jsx
      }
    } catch (err) {
      console.error(err);
      alert("❌ Login failed");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🌱 GreenLedger Registration / Login</h2>

      <input
        type="text"
        placeholder="Company Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      /><br />

      <input
        type="text"
        placeholder="Wallet Address"
        value={walletInput}
        onChange={(e) => setWalletInput(e.target.value)}
      /><br />

      <select value={companyType} onChange={(e) => setCompanyType(e.target.value)}>
        <option value="0">Agriculture</option>
        <option value="1">Manufacturing</option>
        <option value="2">Technology</option>
        <option value="3">Energy</option>
      </select><br />

      <button onClick={handleRegister}>Register</button>
      <button onClick={handleLogin} style={{ marginLeft: "1rem" }}>Login</button>
    </div>
  );
};

export default RegisterLogin;
