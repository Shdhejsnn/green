// src/components/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = ({ wallet }) => {
  const [company, setCompany] = useState(null);
  const [ethBalance, setEthBalance] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/company/${wallet}`);
        setCompany(res.data);

        const web3Res = await axios.post("http://localhost:7545", {
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [wallet, "latest"],
          id: 1
        });

        const balanceInWei = parseInt(web3Res.data.result, 16);
        const balanceInEth = balanceInWei / 1e18;
        setEthBalance(balanceInEth.toFixed(4));
      } catch (err) {
        console.error("Dashboard Error:", err);
      }
    };

    if (wallet) fetchData();
  }, [wallet]);

  if (!company) return <p>Loading company data...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📊 Company Dashboard</h2>

      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
        <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <h4>💰 ETH Balance</h4>
          <p>{ethBalance} ETH</p>
        </div>

        <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <h4>🏢 Company Info</h4>
          <p><strong>Name:</strong> {company.name}</p>
          <p><strong>Wallet:</strong> {company.wallet}</p>
          <p><strong>Type:</strong> {["Agriculture", "Manufacturing", "Tech", "Energy"][company.type]}</p>
          <p><strong>Threshold:</strong> {company.threshold}</p>
        </div>
      </div>

      <div>
        <h4>🌍 Real-Time Carbon Prices</h4>
        <iframe
          src="https://carboncredits.com/carbon-prices-today/"
          width="100%"
          height="400px"
          title="Carbon Prices"
        ></iframe>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h4>🧾 Recent Transactions</h4>
        <p>(Coming soon...)</p>
      </div>
    </div>
  );
};

export default Dashboard;
