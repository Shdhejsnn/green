const express = require("express");
const router = express.Router();
const { contract, web3 } = require("../contract");

const ownerAddress = "0x7feC44587c6fa1b37Cd0a7bd1aF3Eb61710A8175"; // 💡 Ganache deployer

// ✅ Register company
router.post("/register", async (req, res) => {
  const { name, companyType, fromAddress } = req.body;

  if (!name || companyType === undefined || !fromAddress) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const tx = await contract.methods
      .registerCompany(name, companyType)
      .send({ from: fromAddress, gas: 3000000 });

    res.json({
      message: "Company registered successfully",
      txHash: tx.transactionHash,
    });
  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get company details
router.get("/company/:address", async (req, res) => {
  const { address } = req.params;

  try {
    const data = await contract.methods.getCompany(address).call();

    res.json({
      name: data[0],
      wallet: data[1],
      type: parseInt(data[2]),
      threshold: data[3].toString(),
      registered: data[4],
    });
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/buy", async (req, res) => {
  const { from, privateKey, region, ethAmount } = req.body;

  if (!from || !privateKey || !region || !ethAmount) {
    return res.status(400).json({ error: "Missing fields: from, privateKey, region, ethAmount" });
  }

  try {
    const ownerAddress = "0x9EbE5C3e965A3558FC68236A6Ee73b8c0B99cbc3"; // ✅ Replace with Ganache owner
    const amountInWei = web3.utils.toWei(ethAmount.toString(), "ether");
    const nonce = await web3.eth.getTransactionCount(from);
    const gasPrice = await web3.eth.getGasPrice(); // 👈 Use current gas price

    const tx = {
      from,
      to: ownerAddress,
      value: amountInWei,
      gas: web3.utils.toHex(21000),         // 👈 Explicit gas
      gasPrice: web3.utils.toHex(gasPrice), // 👈 Explicit gas price
      nonce,
    };

    const signed = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);

    res.json({
      message: `Transferred ${ethAmount} ETH to ${ownerAddress} for ${region} credits`,
      txHash: receipt.transactionHash,
    });
  } catch (err) {
    console.error("❌ ETH Transfer Error:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
