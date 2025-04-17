import { useState } from "react";
import RegisterLogin from "./components/RegisterLogin";
import Dashboard from "./components/Dashboard";
import Marketplace from "./components/Marketplace";

function App() {
  const [wallet, setWallet] = useState("");
  const [showMarketplace, setShowMarketplace] = useState(false);

  if (!wallet) {
    return <RegisterLogin setWallet={setWallet} />;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h2>🌿 GreenLedger</h2>
        <button onClick={() => setShowMarketplace(!showMarketplace)}>
          {showMarketplace ? "Go to Dashboard" : "Go to Marketplace"}
        </button>
      </div>

      {showMarketplace ? (
        <Marketplace wallet={wallet} />
      ) : (
        <Dashboard wallet={wallet} />
      )}
    </div>
  );
}

export default App;
