const PlatFavorie = require("../models/PlatFavorie_model");
const { catchAsync, AppError,handleDBErrors } = require("./error");

// Ajouter un plat a une liste
exports.addPlatListe = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_plat, id_client } = req.body;

    // Vérifier que les champs requis sont présents
    if (!id_plat || !id_client) {
        return next(new AppError('Missing fields: id_plat and id_client are required', 400));
    }

    // Ajouter le plat dans la liste
    const nouveauplatListe  = await PlatFavorie.addPlatPref(id_plat,id_client);

    // Vérifier si l'ajout a réussi
    if (!nouveauplatListe) {
        return next(new AppError('Failed to add maladie', 400));
    }

    // Réponse en cas de succès
    res.status(201).json({
        status: 'success',
        data: {
            plat : nouveauplatListe
        }
    });
}));

// Consulter les plats d'un client
exports.getplatByclient = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_client } = req.params;

    // Récupérer les plats du client
    const plats = await PlatFavorie.findPlatbyClient(id_client);

    if (!plats) {
        return next(new AppError('No plats found', 404));
    }

    // Réponse en cas de succès
    res.status(200).json({
        status: 'success',
        data: {
            plats
        }
    });
}));




exports.deletePlatListe = handleDBErrors(catchAsync(async (req, res, next) => {

   const { id_client } = req.params;
    const {id_plat} = req.body;

    const platsupprimee = await PlatFavorie.deletePlatDeLaListe(id_plat,id_client);

    if (!platsupprimee) {
        return next(new AppError('plat not found or could not be deleted', 404));
    }

    res.status(204).json({
        status:'success',
        data: null
    });
}));