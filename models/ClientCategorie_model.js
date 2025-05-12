const client = require('../config/db');

const ClientCategorie = {
  async addCategorieClient(id_client, nom_categorie) {
    const result = await client.query(
      'INSERT INTO connected_restaurant."Client_Categorie"(id_client, nom_categorie) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [id_client, nom_categorie]
    );
    return result.rows[0];
  },

  async getCategoriesByClient(id_client) {
    const result = await client.query(
      'SELECT nom_categorie FROM connected_restaurant."Client_Categorie" WHERE id_client = $1',
      [id_client]
    );
    return result.rows;
  },

  async deleteCategorie(id_client, nom_categorie) {
    const result = await client.query(
      'DELETE FROM connected_restaurant."Client_Categorie" WHERE id_client = $1 AND nom_categorie = $2 RETURNING *',
      [id_client, nom_categorie]
    );
    return result.rows[0];
  },
};

module.exports = ClientCategorie;
