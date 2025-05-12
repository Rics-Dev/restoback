const plat = require('../models/model_platGerant'); // Assurez-vous que le chemin est correct
const { catchAsync, AppError,handleDBErrors } = require('./error');
const PlatMaladie = require('../models/MaladiePlat'); // Assurez-vous que le chemin est correct
 // Assurez-vous que le chemin est correct

exports.DonnerPlats = handleDBErrors(catchAsync(async (req, res, next) => {
    const plats = await plat.findAllplat();
    // Assurez-vous que getAllplat est bien défini dans le module plat

    if (!plats) {
        return next(new AppError('No plats found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            plats
        }
    });
}));

exports.AjouterPlat = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id, nom, image, description,prix,calorie,categorie,date,ingredients,maladies } = req.body;

    if (!id || !nom || !prix || !description || !image || !calorie || !date, !categorie) {
        return next(new AppError('Missing fields', 400));

    }

     // Validation des ingrédients (obligatoires)
     if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return next(new AppError('At least one ingredient is required', 400));
    }


    const newPlat = await plat.AddPlat(id, nom, image , description,prix,calorie,categorie,date);

    if (!newPlat) {
        return next(new AppError('Plat not added', 400));
    }

// 2. Ensuite ajouter les ingrédients
const addedIngredients = [];
for (const ing of ingredients) {
    if (!ing.id_ingredient || !ing.quantite) {
        continue; // ou return next(new AppError('Invalid ingredient format', 400))
    }
    
    const ingredient = await plat.AddIngredientInPlat(
        id, 
        ing.id_ingredient, 
        ing.quantite
    );
    addedIngredients.push(ingredient);
}

// 3. Enfin ajouter les maladies si elles existent
let addedMaladies = [];
if (maladies && Array.isArray(maladies)) {
    for (const mal of maladies) {
        if (!mal) continue;
        
        const maladie = await PlatMaladie.addMaladie(id, mal);
        addedMaladies.push(maladie);
    }
}

res.status(201).json({
    status: 'success',
    data: {
        plat: newPlat,
        ingredients: addedIngredients,
        maladies: addedMaladies
    }
});
}));

exports.AjouterIngredientDansPlat = handleDBErrors(catchAsync(async (req, res, next) => {
   
    const { id_plat, id_ingredient, quantite} = req.body;

    if (!id_plat || !id_ingredient || !quantite) {
        return next(new AppError('Missing fields', 400));
    }

    const newIngredient = await plat.AddIngredientInPlat(id_plat, id_ingredient, quantite);

    if (!newIngredient) {
        return next(new AppError('Ingredient not added', 400));
    }

    res.status(201).json({
        status: 'success',
        data: {
            ingredient: newIngredient
        }
    });
}));

exports.updatequantiteIngredientDansPlat = handleDBErrors(catchAsync(async (req, res, next) => {  
    const { id_plat, id_ingredient, quantite } = req.body;

    if (!id_plat || !id_ingredient || !quantite) {
        return next(new AppError('Missing fields', 400));
    }

    const platss = await plat.updateQuantiteIngredientInplat(id_plat, id_ingredient, quantite);

    if (!platss) {
        return next(new AppError('Ingredient not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            platss
        }
    });
}));

exports.ConsulterUnPlatGerant = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new AppError('Missing id', 400));
    }

    const platss = await plat.ConsulterUnPlatGerant(id);

    if (!platss) {
        return next(new AppError('Plat not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            platss
        }
    });
}));

exports.SupprimerPlat = handleDBErrors(catchAsync(async (req, res, next) => {
    const  id_palt  = req.params.id;

    if (!id_palt ) {
        return next(new AppError('Missing fields', 400));
    }

    const plats_supp = await plat.Deleatplat(id_palt);

    if (!plats_supp) {
        return next(new AppError('Plat not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            "resultat1" :plats_supp.result1,
             "resultat2" :plats_supp.result2
        }
    });
}));

exports.SupprimerIngredientDansPlat = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_palt, id_ingredient } = req.body;

    if (!id_palt || !id_ingredient) {
        return next(new AppError('Missing fields', 400));
    }

    const ingredient_supp = await plat.DeleatIngredientInPlat(id_palt, id_ingredient);

    if (!ingredient_supp) {
        return next(new AppError('Ingredient not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            ingredient_supp
        }
    });
}));

exports.update_prix_plat = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_plat, prix } = req.body;

    if (!id_plat || !prix) {
        return next(new AppError('Missing fields', 400));
    }

    const platss = await plat.update_prix_plat(id_plat, prix);

    if (!platss) {
        return next(new AppError('Plat not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            platss
        }
    });
}));