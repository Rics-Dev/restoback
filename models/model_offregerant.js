const client = require('../config/db');

const offre = {

    async findalloffre(){
        const result = await client.query('SELECT * FROM connected_restaurant."Offre"');
       
        return result.rows;
    },
    async addoffre(date_deb,date_fin,reduction){
        const result = await client.query('INSERT INTO connected_restaurant."Offre"(date_deb_offre, date_fin_offre, reduction) VALUES ($1, $2, $3) RETURNING *;', [date_deb, date_fin, reduction]) ;
       
        return result.rows[0];
       
    },
    async addoffre_inplat(id_offre, id_plat){
        const result = await client.query('INSERT INTO connected_restaurant.offre_plat(id_offre, id_plat) VALUES ($1, $2) RETURNING *;', [id_offre, id_plat]) ;
       
        return result.rows[0];
    }

}
module.exports = offre;  