const Maladie = require("../models/Maladie_model"); 
const { catchAsync, AppError, handleDBErrors } = require("./error");

// Récupérer toutes les maladies
exports.getAllMaladies = handleDBErrors(catchAsync(async (req, res, next) => {
    const maladies = await Maladie.findAllMaladies();

    if (!maladies) {
        return next(new AppError('No diseases found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            maladies
        }
    });
}));

// Ajouter une maladie
exports.addMaladie = handleDBErrors(catchAsync(async (req, res, next) => {
    const { nom_maladie, desc_maladie } = req.body;
  

    if (!nom_maladie || !desc_maladie) {
        return next(new AppError('Missing fields', 400));
    }

    const newMaladie = await Maladie.addMaladie(nom_maladie, desc_maladie);

    if (!newMaladie) {
        return next(new AppError('Disease not added', 400));
    }

    res.status(201).json({
        status: 'success',
        data: {
            maladie: newMaladie
        }
    });
}));

// Consulter une maladie par son ID
exports.getMaladieById = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_maladie } = req.params;

    if (!id_maladie) {
        return next(new AppError('Missing id', 400));
    }

    const maladie = await Maladie.findMaladieById(id_maladie);

    if (!maladie) {
        return next(new AppError('Disease not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            maladie
        }
    });
}));

// Supprimer une maladie
exports.deleteMaladie = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_maladie } = req.params;

    if (!id_maladie) {
        return next(new AppError('Missing id', 400));
    }

    const maladie = await Maladie.deleteMaladie(id_maladie);

    if (!maladie) {
        return next(new AppError('Disease not found', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
}));