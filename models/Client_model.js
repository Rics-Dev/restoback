const client = require('../config/db');
const bcrypt = require('bcryptjs');
const ClientMaladie = require('./ClientMaladie_model');
const ClientCategorie = require('./ClientCategorie_model');

const Client = {
  // Trouver un client par son email
  async findClient(email) {
    const result = await client.query('SELECT * FROM connected_restaurant."Client" WHERE adress_mail_client = $1', [email]);
    return result.rows[0];
  },

  // Créer un nouveau client
  async create(nom, prenom, age, num, password, adressemaison, email) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await client.query(
      'INSERT INTO connected_restaurant."Client" (name_client, prenom_client, "Age_client", "Num_tel_client", mot_de_passe_client, adress_client, adress_mail_client) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_client, name_client, prenom_client, "Age_client", "Num_tel_client", adress_client, adress_mail_client',
      [nom, prenom, age, num, hashedPassword, adressemaison, email]
    );
    return result.rows[0];
  },

  // Comparer le mot de passe candidat avec le mot de passe hashé
  async compareMDP(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  },

  async deleteClient(id){
    const result = await client.query('DELETE FROM connected_restaurant."Client" WHERE id_client = $1',[id]);
    return result.rows[0];
},

async addMaladies(idClient, maladiesIds) {
  const promises = maladiesIds.map(idMaladie => 
    ClientMaladie.addMaladie(idClient, idMaladie)
  );
  return Promise.all(promises);
},



async addCategories(idClient, categories) {
  const promises = categories.map(cat =>
    ClientCategorie.addCategorieClient(idClient, cat)
  );
  return Promise.all(promises);
},





async ConsulterCompte(id) {
  const result = await client.query('SELECT * FROM connected_restaurant."Client" WHERE id_client = $1', [id]);
  return result.rows[0];
},


}

module.exports = Client;