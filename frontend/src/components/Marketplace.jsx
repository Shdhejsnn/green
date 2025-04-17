// src/components/Marketplace.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const REGIONS = [
  { name: "European Union", base: 66.85 },
  { name: "UK", base: 47.39 },
  { name: "Australia (AUD)", base: 34.05 },
  { name: "New Zealand (NZD)", base: 52.0 },
  { name: "South Korea", base: 6.17 },
  { name: "China", base: 83.5 },
];

const Marketplace = () => {
  const [prices, setPrices] = useState([]);
  const [region, setRegion] = useState(REGIONS[0].name);
  const [ethAmount, setEthAmount] = useState("");
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [estimatedCredits, setEstimatedCredits] = useState("0");

  // Simulate live price changes every 5 seconds
  useEffect(() => {
    const updatePrices = () => {
      const updated = REGIONS.map((r) => {
        const change = (Math.random() * 2 - 1).toFixed(2); // ±1%
        const newPrice = (r.base * (1 + parseFloat(change) / 100)).toFixed(2);
        return {
          name: r.name,
          price: newPrice,
          ethPerCredit: (newPrice / 10).toFixed(4), // fake mapping
          change,
        };
      });
      setPrices(updated);
    };

    updatePrices();
    const interval = setInterval(updatePrices, 5000);
    return () => clearInterval(interval);
  }, []);

  // Recalculate estimated credits when region or ETH changes
  useEffect(() => {
    const selected = prices.find((p) => p.name === region);
    if (selected && ethAmount) {
      const credits = (parseFloat(ethAmount) / parseFloat(selected.ethPerCredit)).toFixed(2);
      setEstimatedCredits(credits);
    }
  }, [region, ethAmount, prices]);

  const handleBuy = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/buy", {
        from: address,
        privateKey,
        region,
        ethAmount,
      });

      alert(`✅ Success! TX: ${res.data.txHash}`);
    } catch (err) {
      console.error(err);
      alert("❌ Purchase failed: " + err.response?.data?.error);
    }
  };

  return (
    <div style={{ display: "flex", padding: "2rem", gap: "2rem" }}>
      {/* Left - Live Prices */}
      <div style={{ flex: 1, border: "1px solid #ccc", padding: "1rem" }}>
        <h3>🌍 Live Carbon Prices</h3>
        <table>
          <thead>
            <tr>
              <th>Region</th>
              <th>Price (USD)</th>
              <th>ETH/Credit</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((p, i) => (
              <tr key={i}>
                <td>{p.name}</td>
                <td>${p.price}</td>
                <td>{p.ethPerCredit} ETH</td>
                <td style={{ color: p.change >= 0 ? "green" : "red" }}>
                  {p.change > 0 ? "+" : ""}
                  {p.change}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right - Purchase Card */}
      <div style={{ flex: 1, border: "1px solid #ccc", padding: "1rem" }}>
        <h3>💱 Buy Carbon Credits</h3>

        <label>Region:</label><br />
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          {REGIONS.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name}
            </option>
          ))}
        </select><br /><br />

        <label>ETH Amount:</label><br />
        <input
          type="number"
          value={ethAmount}
          onChange={(e) => setEthAmount(e.target.value)}
        /><br /><br />

        <label>Wallet Address:</label><br />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        /><br /><br />

        <label>Private Key:</label><br />
        <input
          type="text"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
        /><br /><br />

        <p>📈 Estimated Credits: <strong>{estimatedCredits}</strong></p>
        <button onClick={handleBuy}>Buy Now</button>
      </div>
    </div>
  );
};

export default Marketplace;
