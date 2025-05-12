const client = require('../config/db');

const Categorie = {
    
    async addCategorie(nom_categorie) {
        const result = await client.query(
            'INSERT INTO connected_restaurant."Categorie"(nom_categorie) VALUES ($1) RETURNING *',
            [nom_categorie]
        );
        return result.rows[0];
    },

    async findAllCategorie() {
        const result = await client.query(
            'SELECT * FROM connected_restaurant."Categorie"'
        );
        return result.rows;
    },
    async deleteCategorie(nom_categorie) {
        const result = await client.query(
            'DELETE FROM connected_restaurant."Categorie" WHERE nom_categorie = $1 RETURNING *',
            [nom_categorie]
        );
        return result.rows[0];
    }

   
};

module.exports = Categorie;