const client = require('../config/db');

const PlatMaladie = {
    // Ajouter une maladie à un plat
    async addMaladie(idplat, idmaladie) {
        const result = await client.query(
            'INSERT INTO connected_restaurant."Maladie_in_plat" (id_plat, id_maladie) VALUES ($1, $2) RETURNING *',
            [idplat, idmaladie]
        );
        return result.rows[0];

    },

    // Consulter les maladies d'un plat
    async findMaladiesByPlat(id_plat) {
        const result = await client.query(
            'SELECT id_maladie FROM connected_restaurant."Maladie_in_plat" WHERE id_plat = $1',
            [id_plat]
        );
        return result.rows;
    },

    // Supprimer une maladie d'un plat
    async deleteMaladie(id_plat, id_maladie) {

        const result = await client.query(
            'DELETE FROM connected_restaurant."Maladie_in_plat" WHERE id_plat = $1 AND id_maladie = $2  RETURNING *;',
            [id_plat, id_maladie]
        );
        return result.rows[0];
    },

};

module.exports = PlatMaladie;