const axios = require('axios');

async function test() {
  try {
    const response = await axios.post('http://127.0.0.1:8000/hybrid_recommend', {
      user_id: "4",
      plats: ["tricolour salad"]
    });
    console.log("✅ Réponse reçue :", response.data);
  } catch (error) {
    console.error("❌ Erreur :", {
      message: error.message,
      url: error.config?.url,
      dataSent: error.config?.data,
      response: error.response?.data
    });
  }
}

test();