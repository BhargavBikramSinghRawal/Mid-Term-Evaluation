const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse incoming requests
app.use(bodyParser.json());

// File to store quiz questions
const QUESTIONS_FILE = './questions.json';

// Utility function to read questions from the file
const readQuestions = () => {
  if (fs.existsSync(QUESTIONS_FILE)) {
    const data = fs.readFileSync(QUESTIONS_FILE);
    return JSON.parse(data);
  }
  return [];
};

// Utility function to write questions to the file
const writeQuestions = (questions) => {
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
};

// Route to get all questions
app.get('/questions', (req, res) => {
  const questions = readQuestions();
  res.json(questions);
});

// Route to create a new multiple-choice question
app.post('/questions', (req, res) => {
  const questions = readQuestions();
  const newQuestion = {
    id: questions.length + 1,
    text: req.body.text,
    options: req.body.options, // array of options
    correctAnswer: req.body.correctAnswer // single correct option or array of correct options
  };
  questions.push(newQuestion);
  writeQuestions(questions);
  res.status(201).json(newQuestion);
});

// Route to update an existing question
app.put('/questions/:id', (req, res) => {
  const questions = readQuestions();
  const questionId = parseInt(req.params.id);
  const questionIndex = questions.findIndex(question => question.id === questionId);

  if (questionIndex !== -1) {
    questions[questionIndex].text = req.body.text || questions[questionIndex].text;
    questions[questionIndex].options = req.body.options || questions[questionIndex].options;
    questions[questionIndex].correctAnswer = req.body.correctAnswer || questions[questionIndex].correctAnswer;
    writeQuestions(questions);
    res.json(questions[questionIndex]);
  } else {
    res.status(404).json({ message: "Question not found" });
  }
});

// Route to delete a question
app.delete('/questions/:id', (req, res) => {
  const questions = readQuestions();
  const questionId = parseInt(req.params.id);
  const updatedQuestions = questions.filter(question => question.id !== questionId);

  if (questions.length !== updatedQuestions.length) {
    writeQuestions(updatedQuestions);
    res.json({ message: "Question deleted" });
  } else {
    res.status(404).json({ message: "Question not found" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Quiz Management API running at http://localhost:${port}`);
});
