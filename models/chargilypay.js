const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const createChargilyInvoice = async ({ montant, clientName, clientEmail, invoiceId }) => {
  const payload = {
    client: clientName || "Client",
    client_email: clientEmail || "default@client.com",
    invoice_number: invoiceId || Date.now().toString(),

    amount: montant,
    discount: 0,
    back_url: process.env.CHARGILY_SUCCESS_URL,
    webhook_url: process.env.CHARGILY_WEBHOOK_URL,
    mode: "EDAHABIA" // ou "CIB"
  };

  const signature = crypto
    .createHmac("sha256", process.env.CHARGILY_APP_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");

  const headers = {
    "X-Authorization": process.env.CHARGILY_APP_KEY,
    "Signature": signature,
    "Content-Type": "application/json"
  };

  const response = await axios.post("https://epay.chargily.com.dz/api/invoice", payload, { headers });

  return response.data.checkout_url;
};

module.exports = { createChargilyInvoice };
