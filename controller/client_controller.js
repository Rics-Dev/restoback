const Client = require('../models/Client_model');
const jwt = require('jsonwebtoken');
const { catchAsync, AppError, handleDBErrors } = require('./error'); // Assurez-vous que le chemin est correct


// Fonction pour générer un token JWT
const token = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET);
};

// Inscription
exports.inscription = handleDBErrors(catchAsync(async (req, res, next) => {
  const { nom, prenom, age, num, password, adressemaison, email, passwordConfirm,  maladies = [], categorie=[] } = req.body;

  // 1) Vérifier si l'email est déjà utilisé
  const existingClient = await Client.findClient(email);
  if (existingClient) {
    return next(new AppError('Cet email est déjà utilisé.', 400));
  }

  // 2) Vérifier que le mot de passe et la confirmation correspondent
  if (password !== passwordConfirm) {
    return next(new AppError('Le mot de passe et la confirmation ne correspondent pas.', 400));
  }

  // 3) Vérifier que le mot de passe a au moins 8 caractères
  if (password.length < 8) {
    return next(new AppError('Le mot de passe doit contenir au moins 8 caractères.', 400));
  }

  // 4) Créer un nouveau client
  const newClient = await Client.create(nom, prenom, age, num, password, adressemaison, email);
  if (maladies && maladies.length > 0) {
    await Client.addMaladies(newClient.id_client, maladies);
  }
  if (categorie && categorie.length > 0) {
    await Client.addCategories(newClient.id_client, categorie);
  }


  // 5) Générer un token JWT pour le nouveau client
  const tok = token(newClient.id_client, 'client');

  // 6) Retourner la réponse avec le token
  res.status(201).json({
    status: 'success',
    token: tok,
    
    role : 'client',
    data: {
      client: newClient,
    },
  });
}));

// Connexion
exports.login = handleDBErrors(catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Vérifier que l'email et le mot de passe sont fournis
  if (!email || !password) {
    return next(new AppError('Veuillez fournir un email et un mot de passe.', 400));
  }

  // 2) Vérifier si le client existe
  const client = await Client.findClient(email);
  if (!client) {
    return next(new AppError('Aucun client trouvé avec cet email.', 404));
  }

  // 3) Vérifier si le mot de passe est correct
  const isPasswordCorrect = await Client.compareMDP(password, client.mot_de_passe_client);
  if (!isPasswordCorrect) {
    return next(new AppError('Mot de passe incorrect.', 401));
  }

  // 4) Générer un token JWT pour le client
  const tok = token(client.id_client, 'client');

  // 5) Retourner la réponse avec le token
  res.status(200).json({
    status: 'success',
    token: tok,
    role: 'client',
    data: {
      client: {
        id: client.id_client,
        nom : client.name_client,
        prenom: client.prenom_client,
        email: client.adress_mail_client,
        age: client.Age_client,
      },
    },
  });
}));


exports.deleteCompteClient = handleDBErrors(catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
      return next(new AppError('Missing id', 400));
  }

  const client = await Client.deleteClient(id);

  if (!client) {
      return next(new AppError('client not found', 404));
  }

  res.status(204).json({
      status: 'success',
      data: null
  });
}));



exports.ConsulterCompteClient = handleDBErrors(catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
      return next(new AppError('Missing id', 400));
  }

  const client = await Client.ConsulterCompte(id);

  if (!client) {
      return next(new AppError('client not found', 404));
  }

  res.status(200).json({
      status: 'success',
      data: {
          client
      }
  });
}));