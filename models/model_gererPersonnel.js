const client = require('../config/db');
const bcrypt = require('bcryptjs');

const Personnel = {

  async FindPersonnelWithEmail(email) {
    const result = await client.query(
      'SELECT * FROM connected_restaurant."Personnel" WHERE adress_mail_personnel = $1', 
      [email]
    );
    return result.rows[0];
  },
     
    async createPersonnel(nom_personnel,prenom_personnel,adress_personnel,adress_mail_personnel,Num_tel_personnel, mot_de_pass_personnel,Age_personnel,personnel_type,id_table_serveur) {
    const hashedPassword = await bcrypt.hash(mot_de_pass_personnel, 12);
        
        const result = await client.query(
          `INSERT INTO connected_restaurant."Personnel" (
            nom_personnel,
            prenom_personnel,
            adress_personnel,
            adress_mail_personnel,
            "Num_tel_personnel",
            mot_de_pass_pessonel,
            "Age_personnel",
            personnel_type,
            id_table_serveur
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [
           
            nom_personnel,
            prenom_personnel,
            adress_personnel,
            adress_mail_personnel,
            Num_tel_personnel,
            hashedPassword,
            Age_personnel,
            personnel_type,
            id_table_serveur
          ]
        );
        
        return result.rows[0];
      },

      // Comparer le mot de passe candidat avec le mot de passe hashé
      async compareMDP(candidatePassword, hashedPassword) {
        return await bcrypt.compare(candidatePassword, hashedPassword);
      },

async deletePersonnel(id){
    const result = await client.query('DELETE FROM connected_restaurant."Personnel" WHERE id_personnel = $1',[id]);
    return result.rows[0];
},

async findAllPersonnel(){
    const result = await client.query('SELECT * FROM connected_restaurant."Personnel"');
    
    return result.rows;
},

async findPersonnel(id){
    const result = await client.query('SELECT * FROM connected_restaurant."Personnel" WHERE id_personnel = $1',[id]);
    return result.rows[0];
    
},

async updateTableServeur(id, table){
    const result = await client.query('UPDATE connected_restaurant."Personnel" SET id_table_serveur = $1 WHERE id_personnel = $2 RETURNING *',[table, id]);
    return result.rows[0];
},

async VerifierSiServeur(id){
    const result = await client.query('SELECT personnel_type FROM connected_restaurant."Personnel" WHERE id_personnel = $1',[id]);
    return result.rows[0];
},

}

module.exports = Personnel;
