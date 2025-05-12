const client = require('../config/db');

const PlatNote = {
    
     
    async addNotePlat(id_client, nb_etoile, avis, id_plat){
        const result = await client.query('INSERT INTO connected_restaurant.note_plat(id_client, nb_etoile, avis, id_plat ) VALUES ($1, $2, $3,$4) RETURNING *;', [id_client, nb_etoile, avis, id_plat]) ;
         return result.rows[0];
    
    },

    async UpdateNotePlat(id_client, id_plat, nb_etoile, avis) {
        const result = await client.query(
            'UPDATE connected_restaurant.note_plat SET nb_etoile = $1, avis = $2 WHERE id_client = $3 AND id_plat = $4 RETURNING *',
            [nb_etoile, avis, id_client, id_plat]
        );
        return result.rows;
    },


    }

module.exports = PlatNote;