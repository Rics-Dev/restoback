const recommendationService = require('../models/service_model');

exports.getRecommendations = async (req, res) => {
    try {
        const { clientId } = req.params;
        const result = await recommendationService.getFinalRecommendations(clientId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};