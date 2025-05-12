const PlatMaladie = require("../models/MaladiePlat");
const { catchAsync, AppError,handleDBErrors } = require("./error");

// Ajouter une maladie à un plat
exports.addMaladiePlat = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_plat, id_maladie } = req.body;

    // Vérifier que les champs requis sont présents
    if (!id_plat || !id_maladie) {
        return next(new AppError('Missing fields: id_plat and id_maladie are required', 400));
    }

    // Ajouter la maladie
    const nouvelleMaladiePlat = await PlatMaladie.addMaladie(id_plat, id_maladie);

    // Vérifier si l'ajout a réussi
    if (!nouvelleMaladiePlat) {
        return next(new AppError('Failed to add maladie', 400));
    }

    // Réponse en cas de succès
    res.status(201).json({
        status: 'success',
        data: {
            maladie: nouvelleMaladiePlat
        }
    });
}));

// Consulter les maladies d'un plat
exports.getMaladiesByPlat = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_plat } = req.params;

    // Récupérer les maladies du client
    const maladies = await PlatMaladie.findMaladiesByPlat(id_plat);

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

   const { id_plat } = req.params;
    const {id_maladie} = req.body;

    const maladieSupprimee = await PlatMaladie.deleteMaladie(id_plat, id_maladie);

    if (!maladieSupprimee) {
        return next(new AppError('Maladie not found or could not be deleted', 404));
    }

    res.status(204).json({
        status:'success',
        data: null
    });
}));