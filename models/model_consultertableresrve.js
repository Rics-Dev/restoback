const client = require('../config/db');

const reservation = {
    
        async findallreservation(){
            const date = new Date(); 
            
            const result = await client.query('SELECT * FROM connected_restaurant."Table_reserv" WHERE date_deb_res > $1;', [date]);
        
            return result.rows;
        },
        async addreservation(id_client, id_table, nb_personne, date_deb_res, date_fin_res){
            const result = await client.query('INSERT INTO connected_restaurant."Table_reserv"(id_client, id_table, nb_personne, date_deb_res, date_fin_res) VALUES ($1, $2, $3, $4, $5) RETURNING *;', [id_client, id_table, nb_personne, date_deb_res, date_fin_res]) ;
        
            return result.rows[0];
        
        },
        async findreservationbyclient(id_client){
            const result = await client.query('SELECT * FROM connected_restaurant."Table_reserv" WHERE id_client = $1 ;', [id_client]);
        
            return result.rows;
        },
        async deletereservationbyclient(id_client, id_reserv){
            const result = await client.query('DELETE FROM connected_restaurant."Table_reserv" WHERE id_client = $1 AND id_reserv = $2 RETURNING *;', [id_client, id_reserv]);
        
            return result.rows[0];
        },

        async findtable(){
            const result = await client.query('SELECT * FROM connected_restaurant."Table"');
        
            return result.rows;
        }



}

module.exports = reservation;