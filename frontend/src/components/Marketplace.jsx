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
  const [mode, setMode] = useState("buy");
  const [prices, setPrices] = useState([]);
  const [region, setRegion] = useState(REGIONS[0].name);
  const [ethAmount, setEthAmount] = useState("");
  const [address, setAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [estimatedCredits, setEstimatedCredits] = useState("0");
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    const updatePrices = () => {
      const updated = REGIONS.map((r) => {
        const change = (Math.random() * 2 - 1).toFixed(2);
        const newPrice = (r.base * (1 + parseFloat(change) / 100)).toFixed(2);
        return {
          name: r.name,
          price: newPrice,
          ethPerCredit: (newPrice / 10).toFixed(4),
          change,
        };
      });
      setPrices(updated);
    };

    updatePrices();
    const interval = setInterval(updatePrices, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const selected = prices.find((p) => p.name === region);
    if (selected && ethAmount && mode === "buy") {
      const credits = (parseFloat(ethAmount) / parseFloat(selected.ethPerCredit)).toFixed(2);
      setEstimatedCredits(credits);
    }
  }, [region, ethAmount, prices, mode]);

  const handleBuy = async () => {
    const amount = parseFloat(estimatedCredits);
    try {
      const res = await axios.post("http://localhost:5000/api/buy", {
        from: address,
        privateKey,
        region,
        ethAmount,
        amount,
      });

      alert(`✅ Bought! TX: ${res.data.txHash}`);
      setLedger((prev) => [
        {
          type: "BUY",
          txHash: res.data.txHash,
          region: res.data.ledger?.region || "N/A",
          amount: `${res.data.ledger?.credits} (Token #${res.data.ledger?.tokenId || "?"})`,
          ethAmount: res.data.ledger?.ethSpent || ethAmount,
          party: res.data.ledger?.buyer || address,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error(err);
      alert("❌ Purchase failed: " + err.response?.data?.error);
    }
  };

  const handleSell = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/sell", {
        from: address,
        privateKey,
        tokenId,
        salePriceInEth: ethAmount,
      });

      alert(`✅ Sold! TX: ${res.data.txHash}`);
      setLedger((prev) => [
        {
          type: "SELL",
          txHash: res.data.txHash || "N/A",
          region: "N/A",
          amount: "1 Token",
          ethAmount,
          party: address,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error(err);
      alert("❌ Sell failed: " + err.response?.data?.error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🌿 GreenLedger Marketplace</h2>

      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
        {/* Live Price Table */}
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

        {/* Buy / Sell Card */}
        <div style={{ flex: 1, border: "1px solid #ccc", padding: "1rem" }}>
          <h3>💱 {mode === "buy" ? "Buy" : "Sell"} Carbon Credits</h3>
          <div style={{ marginBottom: "1rem" }}>
            <button onClick={() => setMode("buy")}>Buy</button>
            <button onClick={() => setMode("sell")} style={{ marginLeft: "1rem" }}>
              Sell
            </button>
          </div>

          {mode === "buy" && (
            <>
              <label>Region:</label><br />
              <select value={region} onChange={(e) => setRegion(e.target.value)}>
                {REGIONS.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select><br /><br />
            </>
          )}

          {mode === "sell" && (
            <>
              <label>Token ID to Sell:</label><br />
              <input
                type="text"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
              /><br /><br />
            </>
          )}

          <label>{mode === "buy" ? "ETH to Spend:" : "ETH You Expect:"}</label><br />
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

          {mode === "buy" && (
            <p>📈 Estimated Credits: <strong>{estimatedCredits}</strong></p>
          )}

          <button onClick={mode === "buy" ? handleBuy : handleSell}>
            {mode === "buy" ? "Buy Now" : "Sell Now"}
          </button>
        </div>
      </div>

      {/* Ledger */}
      <div style={{ borderTop: "2px solid #ddd", paddingTop: "1rem" }}>
        <h3>📜 Blockchain Ledger</h3>
        {ledger.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <table style={{ width: "100%", fontSize: "0.9rem" }}>
            <thead>
              <tr>
                <th>TX Hash</th>
                <th>Type</th>
                <th>Region</th>
                <th>Credits</th>
                <th>ETH</th>
                <th>Wallet</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((tx, i) => (
                <tr key={i}>
                  <td>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${tx.txHash || "#"}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {tx.txHash?.slice(0, 10) || "N/A"}...
                    </a>
                  </td>
                  <td>{tx.type}</td>
                  <td>{tx.region || "N/A"}</td>
                  <td>{tx.amount || "N/A"}</td>
                  <td>{tx.ethAmount || "0"} ETH</td>
                  <td>{tx.party?.slice(0, 10) || "N/A"}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
