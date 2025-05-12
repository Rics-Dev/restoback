const Personnel = require('../models/model_gererPersonnel');
const jwt = require('jsonwebtoken');
const { catchAsync, AppError,handleDBErrors } = require('./error');
const bcrypt = require('bcryptjs');

// Génération du token avec rôle
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET)};

// Inscription personnel (adaptée à votre schéma)
exports.inscriptionPersonnel = handleDBErrors(catchAsync(async (req, res, next) => {
  const {
    
    nom_personnel,
    prenom_personnel,
    adress_personnel,
    adress_mail_personnel,
    Num_tel_personnel,
    mot_de_pass_personnel,
    passwordConfirm,
    Age_personnel,
    personnel_type,
    id_table_serveur
  } = req.body;

  // 1) Validation des champs obligatoires
  if ( !nom_personnel || !prenom_personnel || !adress_mail_personnel || 
      !mot_de_pass_personnel || !passwordConfirm || !Age_personnel || !personnel_type || !id_table_serveur) {
    return next(new AppError('Tous les champs obligatoires doivent être remplis.', 400));
  }

  // 2) Vérification email existant
  const existingPersonnel = await Personnel.FindPersonnelWithEmail(adress_mail_personnel);
  if (existingPersonnel) {
    return next(new AppError('Cet email est déjà utilisé.', 400));
  }

  // 3) Vérification mot de passe
  if (mot_de_pass_personnel !== passwordConfirm) {
    return next(new AppError('Les mots de passe ne correspondent pas.', 400));
  }

  if (mot_de_pass_personnel.length < 8) {
    return next(new AppError('Le mot de passe doit contenir au moins 8 caractères.', 400));
  }

  // 4) Vérification rôle valide
  const validRoles = ['serveur', 'cuisinier', 'gerant'];
  if (!validRoles.includes(personnel_type)) {
    return next(new AppError('Rôle invalide.', 400));
  }

  // 5) Création du personnel
  const newPersonnel = await Personnel.createPersonnel(
    nom_personnel,
    prenom_personnel,
    adress_personnel,
    adress_mail_personnel,
    Num_tel_personnel,
    mot_de_pass_personnel,
    Age_personnel,
    personnel_type,   
    id_table_serveur
  );

  // 6) Génération token
  const token = generateToken(newPersonnel.id_personnel, newPersonnel.personnel_type);

  
  res.status(201).json({
    status: 'success',
    token,
    role: newPersonnel.personnel_type,
    data: {
      personnel: {
        id: newPersonnel.id_personnel,
        nom: newPersonnel.nom_personnel,
        prenom: newPersonnel.prenom_personnel,
        email: newPersonnel.adress_mail_personnel,
        role: newPersonnel.personnel_type,
        age: newPersonnel.Age_personnel,
        table: newPersonnel.id_table_serveur
      }
    }
  });
}));

// Connexion personnel (adaptée)
exports.loginPersonnel = handleDBErrors(catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email et mot de passe requis.', 400));
  }

  const personnel = await Personnel.FindPersonnelWithEmail(email);
  if (!personnel) {
    return next(new AppError('Identifiants incorrects.', 401)); // Message générique pour la sécurité
  }

  // Vérification mot de passe
  const isPasswordCorrect = await Personnel.compareMDP(password, personnel.mot_de_pass_pessonel);
  if (!isPasswordCorrect) {
    return next(new AppError('Identifiants incorrects.', 401));
  }

  const token = generateToken(personnel.id_personnel, personnel.personnel_type);

  res.status(200).json({
    status: 'success',
    token,
    role: personnel.personnel_type,
    data: {
      personnel: {
        id: personnel.id_personnel,
        nom: personnel.nom_personnel,
        prenom: personnel.prenom_personnel,
        email: personnel.adress_mail_personnel,
        role: personnel.personnel_type,
        age: personnel.Age_personnel,
        telephone: personnel.Num_tel_personnel,
        table: personnel.id_table_serveur
      }
    }
  });
}));

exports.DonnerPersonnel = handleDBErrors(catchAsync(async (req, res, next) => {
    const personnels = await Personnel.findAllPersonnel();
    
    // Assurez-vous que getAllplat est bien défini dans le module plat

    if (!personnels) {
        return next(new AppError('No personnels found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            personnels
        }
    });
}));


exports.deletePersonnel = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new AppError('Missing id', 400));
    }

    const perso = await Personnel.deletePersonnel(id);

    res.status(204).json({
        status: 'success',
        data: null
    });
}));



exports.ConsulterUnPersonnel= handleDBErrors(catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new AppError('Missing id', 400));
    }

    const perso = await Personnel.findPersonnel(id);

    if (!perso) {
        return next(new AppError('Personnel not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            perso
        }
    });
}));

exports.ChangerTablepourServeur = handleDBErrors(catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const {id_table} = req.body;

    if (!id || !id_table) {
        return next(new AppError('Missing fields', 400));
    }

    const Verifier = await Personnel.VerifierSiServeur(id);
  
    if( Verifier.personnel_type !== 'serveur'){
        return next(new AppError('This personnel is not a server', 400));
    }
    const newTable = await Personnel.updateTableServeur(id, id_table);

    if (!newTable) {
        return next(new AppError('Table not updated', 400));
    }

    res.status(200).json({
        status: 'success',
        data: {
            newTable
        }
    });
}));
