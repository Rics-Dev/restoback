const ClientMaladie = require("../models/ClientMaladie_model");
const { catchAsync, AppError,handleDBErrors } = require("./error");

// Ajouter une maladie à un client
exports.addMaladie = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_client, id_maladie } = req.body;

    // Vérifier que les champs requis sont présents
    if (!id_client || !id_maladie) {
        return next(new AppError('Missing fields: id_client and id_maladie are required', 400));
    }

    // Ajouter la maladie
    const nouvelleMaladie = await ClientMaladie.addMaladie(id_client, id_maladie);

    // Vérifier si l'ajout a réussi
    if (!nouvelleMaladie) {
        return next(new AppError('Failed to add maladie', 400));
    }

    // Réponse en cas de succès
    res.status(201).json({
        status: 'success',
        data: {
            maladie: nouvelleMaladie
        }
    });
}));

// Consulter les maladies d'un client
exports.getMaladiesByClient = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_client } = req.params;

    // Récupérer les maladies du client
    const maladies = await ClientMaladie.findMaladiesByClient(id_client);

    if (!maladies) {
        return next(new AppError('No maladies found', 404));
    }

    // Réponse en cas de succès
    res.status(200).json({
        status: 'success',
        data: {
            maladies
        }
    });
}));




exports.deleteMaladie = handleDBErrors(catchAsync(async (req, res, next) => {

   const { id_client } = req.params;
    const {id_maladie} = req.body;

    const maladieSupprimee = await ClientMaladie.deleteMaladie(id_client, id_maladie);

    if (!maladieSupprimee) {
        return next(new AppError('Maladie not found or could not be deleted', 404));
    }

    res.status(204).json({
        status:'success',
        data: null
    });
}));





 


