const client = require('../config/db');

const PlatClientPref = {
    // Ajouter un plat à la liste
    async addPlatPref(id_plat, id_client) {
        const result = await client.query(
            'INSERT INTO connected_restaurant.client_platpref (id_plat, id_client) VALUES ($1, $2) RETURNING *',
            [id_plat, id_client]
        );
        return result.rows[0];

    },

    // Consulter les 
    async findPlatbyClient(id_client) {
        const result = await client.query(
            'SELECT id_plat FROM connected_restaurant.client_platpref WHERE id_client = $1',
            [id_client]
        );
        return result.rows;
    },

    // Supprimer un plat de la liste
    async deletePlatDeLaListe(id_plat, id_client) {

        const result = await client.query(
            'DELETE FROM connected_restaurant.client_platpref WHERE id_client = $1 AND id_plat = $2 RETURNING *',
            [id_client, id_plat]
        );
        
        return result.rows[0];
    },

};

module.exports = PlatClientPref;