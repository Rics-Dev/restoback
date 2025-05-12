const client = require('../config/db');

const Plat = {


    async findAllplat(){
        const result = await client.query('SELECT * FROM connected_restaurant."Plat"');
        return result.rows;
    },

    async AddPlat(id, nom, image, description,prix, calorie, categorie, date) {
        const result = await client.query(
          'INSERT INTO connected_restaurant."Plat" (id_plat, nom_plat, image_plat, "Description_plat", "Prix_plat", info_calorie, categorie_plat, "Ajout_date") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
          [id, nom, image, description, prix, calorie, categorie, date]
        );
        return result.rows[0];
      },

      async AddIngredientInPlat (id_plat, id_ingredient, quantite) {
        const result = await client.query('INSERT INTO connected_restaurant.ingredient_in_plat( id_plat, id_ingredient, "quantité_in_plat") VALUES ($1, $2, $3) RETURNING *',
        [id_plat, id_ingredient, quantite] );
        return result.rows[0];
      
      },

      async updateQuantiteIngredientInplat (id_plat, id_ingredient, quantite) {
        const result = await client.query('UPDATE connected_restaurant.ingredient_in_plat SET "quantité_in_plat" = $1 WHERE id_plat = $2 AND id_ingredient = $3 RETURNING *',
        [quantite, id_plat, id_ingredient]);
        return result.rows[0];
      },

      async ConsulterUnPlatGerant(id) {
        const result = await client.query('SELECT * FROM connected_restaurant."Plat" WHERE id_plat = $1', [id]);
        return result.rows[0];
      },
      async Deleatplat(id_palt) {

        const result1 =  client.query('DELETE FROM connected_restaurant.ingredient_in_plat WHERE id_plat = $1 RETURNING *', [id_palt]);
        const result2 =  client.query('DELETE FROM connected_restaurant."Plat" WHERE id_plat = $1 RETURNING *', [id_palt]);
        return {
          result1: result1.rowCount,
          result2: result2.rowCount
        }

      },
      async DeleatIngredientInPlat(id_palt, id_ingredient) {
        const result = await client.query('DELETE FROM connected_restaurant.ingredient_in_plat WHERE id_plat = $1 AND id_ingredient = $2 RETURNING *', [id_palt, id_ingredient]);
        return result.rows[0];
      },
      
      async update_prix_plat (id_plat, prix) {
        const result = await client.query('UPDATE connected_restaurant."Plat" SET "Prix_plat" = $1 WHERE id_plat = $2 RETURNING *',
        [prix, id_plat]);
        return result.rows[0];
      }


     




}
module.exports = Plat;