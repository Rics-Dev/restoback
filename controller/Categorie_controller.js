const Categorie = require("../models/categorie_model");
const ClientCategorie = require("../models/ClientCategorie_model");
const { catchAsync, AppError,handleDBErrors } = require ("./error");

exports.getAllCategories = handleDBErrors(catchAsync(async (req, res, next) => {
    const categories = await Categorie.findAllCategorie();

    if (!categories) {
        return next(new AppError('No categories found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            categories
        }
    });
}));

exports.addCategorie = handleDBErrors(catchAsync(async (req, res, next) => {
    const { nom_categorie } = req.body;

    if (!nom_categorie) {
        return next(new AppError('Missing fields', 400));
    }

    const newCategorie = await Categorie.addCategorie(nom_categorie);

    if (!newCategorie) {
        return next(new AppError('Category not added', 400));
    }

    res.status(201).json({
        status: 'success',
        data: {
            categorie: newCategorie
        }
    });
}));

exports.deleteCategorie = handleDBErrors(catchAsync(async (req, res, next) => {
    const { nom_categorie } = req.params;
    if (!nom_categorie) return next(new AppError('nom manquant', 400));

    const categorie = await Categorie.deleteCategorie(nom_categorie);
    if (!categorie) return next(new AppError('Category not found', 404));

    res.status(204).json({ status: 'success', data: null });
}));

exports.AddClientCategorie = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_client, nom_categorie } = req.body;
    if (!id_client || !nom_categorie) {
        return next(new AppError('Missing fields', 400));
    }

    const newClientCategorie = await ClientCategorie.addCategorieClient(id_client, nom_categorie);

    if (!newClientCategorie) {
        return next(new AppError('Client category not added', 400));
    }

    res.status(201).json({
        status: 'success',
        data: {
            clientCategorie: newClientCategorie
        }
    });
}
));

exports.getClientCategorie = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_client } = req.params;
    if (!id_client) {
        return next(new AppError('Missing id', 400));
    }

    const clientCategorie = await ClientCategorie.getCategoriesByClient(id_client);

    if (!clientCategorie) {
        return next(new AppError('Client category not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            clientCategorie
        }
    });
}
));

exports.deleteClientCategorie = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_client} = req.params;
    const { nom_categorie } = req.body;
    if (!id_client || !nom_categorie) {
        return next(new AppError('Missing fields', 400));
    }

    const clientCategorie = await ClientCategorie.deleteCategorie(id_client, nom_categorie);

    if (!clientCategorie) {
        return next(new AppError('Client category not found', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
}));