const client = require('../config/db');

const ServeurNote = {
    
        async addNoteServeur(id_client, nb_etoile, avis, id_serveur){
            const result = await client.query('INSERT INTO connected_restaurant.note_serveur(id_client, nb_etoile, avis, id_serveur ) VALUES ($1, $2, $3,$4) RETURNING *;', [id_client, nb_etoile, avis, id_serveur]) ;
             return result.rows[0];
        
        },

        async UpdateNoteServeur (id_client,id_serveur, nb_etoile, avis){
            const result = await client.query('UPDATE connected_restaurant.note_serveur SET nb_etoile = $3, avis = $4 WHERE id_client = $1 AND id_serveur = $2 RETURNING *', [id_client,id_serveur, nb_etoile, avis]);
            return result.rows;
        },

        

    }

module.exports = ServeurNote;