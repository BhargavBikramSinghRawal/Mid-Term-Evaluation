const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Hardcoded products list (could also be stored in a JSON file)
const products = [
  { id: 1, name: 'Laptop', description: 'A high-performance laptop', price: 1200 },
  { id: 2, name: 'Phone', description: 'A smartphone with a great camera', price: 800 },
  { id: 3, name: 'Headphones', description: 'Noise-cancelling over-ear headphones', price: 200 }
];

// In-memory shopping cart
let cart = [];

// Route to get the list of products
app.get('/products', (req, res) => {
  res.json(products);
});

// Route to add a product to the cart
app.post('/cart', (req, res) => {
  const { productId, quantity } = req.body;

  // Find the product by ID
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Check if the product is already in the cart
  const cartItem = cart.find(item => item.productId === productId);
  if (cartItem) {
    // Update the quantity if it exists
    cartItem.quantity += quantity;
  } else {
    // Add a new item to the cart
    cart.push({ productId, name: product.name, price: product.price, quantity });
  }

  res.status(201).json({ message: 'Product added to cart', cart });
});

// Route to update the quantity of an item in the cart
app.put('/cart/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);
  const { quantity } = req.body;

  const cartItem = cart.find(item => item.productId === productId);
  if (!cartItem) {
    return res.status(404).json({ message: 'Product not found in cart' });
  }

  // Update the quantity
  cartItem.quantity = quantity;
  res.json({ message: 'Cart updated', cart });
});

// Route to view the cart and the total cost
app.get('/cart', (req, res) => {
  const totalCost = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  res.json({ cart, totalCost });
});

// Route to remove an item from the cart
app.delete('/cart/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);

  // Filter out the item with the given product ID
  const newCart = cart.filter(item => item.productId !== productId);
  if (newCart.length === cart.length) {
    return res.status(404).json({ message: 'Product not found in cart' });
  }

  cart = newCart;
  res.json({ message: 'Product removed from cart', cart });
});

// Start the server
app.listen(port, () => {
  console.log(`E-commerce Cart API running at http://localhost:${port}`);
});
