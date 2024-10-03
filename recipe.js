const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// File path for storing recipes
const RECIPES_FILE = './recipes.json';

// Utility function to read recipes from the file
const readRecipes = () => {
  if (fs.existsSync(RECIPES_FILE)) {
    const data = fs.readFileSync(RECIPES_FILE);
    return JSON.parse(data);
  }
  return [];
};

// Utility function to write recipes to the file
const writeRecipes = (recipes) => {
  fs.writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2));
};

// Route to get all recipes or search by name or ingredient
app.get('/recipes', (req, res) => {
  const recipes = readRecipes();
  const { name, ingredient } = req.query;

  let filteredRecipes = recipes;

  if (name) {
    filteredRecipes = filteredRecipes.filter(recipe =>
      recipe.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (ingredient) {
    filteredRecipes = filteredRecipes.filter(recipe =>
      recipe.ingredients.some(ing => ing.toLowerCase().includes(ingredient.toLowerCase()))
    );
  }

  res.json(filteredRecipes);
});

// Route to add a new recipe
app.post('/recipes', (req, res) => {
  const recipes = readRecipes();
  const newRecipe = {
    id: recipes.length + 1,
    name: req.body.name,
    ingredients: req.body.ingredients, // array of ingredients
    instructions: req.body.instructions
  };

  recipes.push(newRecipe);
  writeRecipes(recipes);
  res.status(201).json(newRecipe);
});

// Route to update an existing recipe
app.put('/recipes/:id', (req, res) => {
  const recipes = readRecipes();
  const recipeId = parseInt(req.params.id);
  const recipeIndex = recipes.findIndex(recipe => recipe.id === recipeId);

  if (recipeIndex !== -1) {
    const updatedRecipe = {
      ...recipes[recipeIndex],
      name: req.body.name || recipes[recipeIndex].name,
      ingredients: req.body.ingredients || recipes[recipeIndex].ingredients,
      instructions: req.body.instructions || recipes[recipeIndex].instructions
    };

    recipes[recipeIndex] = updatedRecipe;
    writeRecipes(recipes);
    res.json(updatedRecipe);
  } else {
    res.status(404).json({ message: 'Recipe not found' });
  }
});

// Route to delete a recipe
app.delete('/recipes/:id', (req, res) => {
  const recipes = readRecipes();
  const recipeId = parseInt(req.params.id);
  const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);

  if (updatedRecipes.length !== recipes.length) {
    writeRecipes(updatedRecipes);
    res.json({ message: 'Recipe deleted' });
  } else {
    res.status(404).json({ message: 'Recipe not found' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Recipe Search API running at http://localhost:${port}`);
});
