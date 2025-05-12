
const express = require('express');
const Router = express.Router();
const Ingredient = require('../controller/controller_ingredient');


Router.get('/ingredient', Ingredient.getAllIngredients);
Router.post('/ingredient', Ingredient.addIngredient);
Router.delete('/ingredient/:id', Ingredient.deleteIngredient);
Router.patch('/ingredient/:id', Ingredient.updateIngredient);
Router.get('/ingredient/plat/:id_plat', Ingredient.getIngredientInPlat);
module.exports = Router;