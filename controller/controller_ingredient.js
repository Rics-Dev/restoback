const Ingredient = require("../models/model_ingredient");
const { catchAsync, AppError,handleDBErrors } = require ("./error");

exports.getAllIngredients = catchAsync(async (req, res, next) => {

    const ingredients = await Ingredient.findAllIngredient();

    if (!ingredients) {
        return next(new AppError('No ingredients found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            ingredients
        }
    });

});

exports.addIngredient = handleDBErrors(catchAsync(async (req, res, next) => {
    const { nom, quantite } = req.body;

    // Validation minimale des champs obligatoires
    if (!nom || quantite === undefined) {
        return next(new AppError('Missing fields: id, nom et quantite sont obligatoires', 400));
    }

    // PostgreSQL gérera automatiquement les erreurs de type (quantité non numérique)
    const newIngredient = await Ingredient.AddIngredient (nom, quantite);
    if (!newIngredient) {
        return next(new AppError("Échec de l'ajout de l'ingrédient", 400));
    }

    res.status(201).json({ status: 'success', data: { ingredient: newIngredient } });
}));

// 3. Supprimer un ingrédient
exports.deleteIngredient = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!id) return next(new AppError('ID manquant', 400));

    const ingredient = await Ingredient.deleteIngredient(id);
    if (!ingredient) return next(new AppError('Ingrédient non trouvé', 404));

    res.status(204).json({ status: 'success', data: null });
}));

// 4. Mettre à jour un ingrédient
exports.updateIngredient = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { quantite } = req.body;

    if (!id || quantite === undefined) {
        return next(new AppError('ID et quantité sont obligatoires', 400));
    }

    // PostgreSQL gérera les erreurs de type (quantité non numérique)
    const ingredient = await Ingredient.updateIngredient(id, quantite);
    if (!ingredient) return next(new AppError('Ingrédient non trouvé', 404));

    res.status(200).json({ status: 'success', data: { ingredient } });
}));

exports.getIngredientInPlat = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_plat } = req.params;
    if (!id_plat) return next(new AppError('ID plat manquant', 400));

    const ingredients = await Ingredient.findingredientinPlat(id_plat);
    if (!ingredients) return next(new AppError('Aucun ingrédient trouvé pour ce plat', 404));

    res.status(200).json({ status: 'success', data: { ingredients } });
}
));