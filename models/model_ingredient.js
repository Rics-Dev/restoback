const client = require('../config/db');

const Ingredient ={


    async findAllIngredient(){
        const result = await client.query('SELECT * FROM connected_restaurant.ingredient');
        return result.rows;
    },

    async AddIngredient (nom,quantite){
        const result = await client.query('INSERT INTO connected_restaurant.ingredient (nom_igredient,quantité_ing) VALUES ($1,$2) RETURNING *',[nom,quantite]);
        return result.rows[0];
    },

    async deleteIngredient(id){
        const result = await client.query('DELETE FROM connected_restaurant.ingredient WHERE id_ingedient = $1',[id]);
        return result.rows[0];
    },


    async updateIngredient(id,quantite){
        const result = await client.query('UPDATE connected_restaurant.ingredient SET  quantité_ing = $2 WHERE id_ingedient = $1 RETURNING *',[id,quantite]);
        return result.rows[0];
    },
    async findingredientinPlat(id_plat){
        const result = await client.query('SELECT * FROM connected_restaurant.ingredient_in_plat WHERE id_plat = $1',[id_plat]);
        return result.rows;
    },

}

module.exports = Ingredient;