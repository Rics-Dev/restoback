const client = require('../config/db');

const PlatClient = {
    
        async findAllPlatDisponible(){
            const result = await client.query(`SELECT plat.* FROM connected_restaurant."Plat" 
                plat JOIN connected_restaurant.ingredient_in_plat ing_plat ON plat.id_plat = ing_plat.id_plat 
                JOIN connected_restaurant.ingredient ing ON ing_plat.id_ingredient = ing.id_ingedient 
                GROUP BY plat.id_plat, plat.nom_plat 
                HAVING MIN(ing.quantité_ing) > 10 `);
            return result.rows;
        },

        async ConsulterUnPlat(id) {
            const result = await client.query('SELECT * FROM connected_restaurant."Plat" WHERE id_plat = $1', [id]);
            return result.rows[0];
          },
    }

module.exports = PlatClient;