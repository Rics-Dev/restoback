const client = require('../config/db');

const Maladie = {
    // Ajouter une maladie
    async addMaladie(nom_maladie, desc_maladie) {
        const result = await client.query(
            'INSERT INTO connected_restaurant.maladie (nom_maladie, desc_maladie) VALUES ($1, $2) RETURNING *',
            [nom_maladie, desc_maladie]
        );
        return result.rows[0];
    },

    // Consulter toutes les maladies
    async findAllMaladies() {
        const result = await client.query(
            'SELECT * FROM connected_restaurant.maladie'
        );
        return result.rows;
    },

    // Consulter une maladie par son id
    async findMaladieById(id_maladie) {
        const result = await client.query(
            'SELECT * FROM connected_restaurant.maladie WHERE id_maladie = $1',
            [id_maladie]
        );
        return result.rows[0];
    },

    // Supprimer une maladie par son id
    async deleteMaladie(id_maladie) {
        const result = await client.query(
            'DELETE FROM connected_restaurant.maladie WHERE id_maladie = $1 RETURNING *',
            [id_maladie]
        );
        return result.rows[0];
    },
};

module.exports = Maladie;