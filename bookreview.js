const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// File path for storing reviews
const REVIEWS_FILE = './reviews.json';

// Hardcoded list of books
const books = [
  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', description: 'A novel about the American dream.' },
  { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', description: 'A novel about racial injustice in the South.' },
  { id: 3, title: '1984', author: 'George Orwell', description: 'A dystopian novel about a totalitarian regime.' }
];

// Utility function to read reviews from the file
const readReviews = () => {
  if (fs.existsSync(REVIEWS_FILE)) {
    const data = fs.readFileSync(REVIEWS_FILE);
    return JSON.parse(data);
  }
  return [];
};

// Utility function to write reviews to the file
const writeReviews = (reviews) => {
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
};

// Route to get all books
app.get('/books', (req, res) => {
  res.json(books);
});

// Route to get reviews for a specific book
app.get('/books/:id/reviews', (req, res) => {
  const bookId = parseInt(req.params.id);
  const reviews = readReviews();
  const bookReviews = reviews.filter(review => review.bookId === bookId);
  res.json(bookReviews);
});

// Route to add a new review for a specific book
app.post('/books/:id/reviews', (req, res) => {
  const bookId = parseInt(req.params.id);
  const reviews = readReviews();
  const newReview = {
    id: reviews.length + 1,
    bookId: bookId,
    username: req.body.username,
    reviewText: req.body.reviewText,
    rating: req.body.rating // assuming rating is from 1-5
  };

  reviews.push(newReview);
  writeReviews(reviews);
  res.status(201).json(newReview);
});

// Route to edit a review for a specific book
app.put('/books/:bookId/reviews/:reviewId', (req, res) => {
  const bookId = parseInt(req.params.bookId);
  const reviewId = parseInt(req.params.reviewId);
  const reviews = readReviews();
  const reviewIndex = reviews.findIndex(review => review.bookId === bookId && review.id === reviewId);

  if (reviewIndex !== -1) {
    reviews[reviewIndex].username = req.body.username || reviews[reviewIndex].username;
    reviews[reviewIndex].reviewText = req.body.reviewText || reviews[reviewIndex].reviewText;
    reviews[reviewIndex].rating = req.body.rating || reviews[reviewIndex].rating;

    writeReviews(reviews);
    res.json(reviews[reviewIndex]);
  } else {
    res.status(404).json({ message: 'Review not found' });
  }
});

// Route to delete a review for a specific book
app.delete('/books/:bookId/reviews/:reviewId', (req, res) => {
  const bookId = parseInt(req.params.bookId);
  const reviewId = parseInt(req.params.reviewId);
  const reviews = readReviews();
  const updatedReviews = reviews.filter(review => !(review.bookId === bookId && review.id === reviewId));

  if (updatedReviews.length !== reviews.length) {
    writeReviews(updatedReviews);
    res.json({ message: 'Review deleted' });
  } else {
    res.status(404).json({ message: 'Review not found' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Book Review API running at http://localhost:${port}`);
});
