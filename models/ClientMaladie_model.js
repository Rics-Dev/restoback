const client = require('../config/db');

const ClientMaladie = {
    // Ajouter une maladie à un client
    async addMaladie(idclient, idmaladie) {
        const result = await client.query(
            'INSERT INTO connected_restaurant.client_maladie (id_client, id_maladie) VALUES ($1, $2) RETURNING *',
            [idclient, idmaladie]
        );
        return result.rows[0];

    },

    // Consulter les maladies d'un client
    async findMaladiesByClient(id_client) {
        const result = await client.query(
            'SELECT id_maladie FROM connected_restaurant.client_maladie WHERE id_client = $1',
            [id_client]
        );
        return result.rows;
    },

    // Supprimer une maladie d'un client
    async deleteMaladie(id_client, id_maladie) {

        const result = await client.query(
            'delete from connected_restaurant.client_maladie where id_client = $1 AND id_maladie = $2  RETURNING *;',
            [id_client, id_maladie]
        );
        return result.rows[0];
    },

};

module.exports = ClientMaladie;