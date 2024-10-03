const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// File to store workout logs
const WORKOUTS_FILE = './workouts.json';

// Utility function to read workouts from file
const readWorkouts = () => {
  if (fs.existsSync(WORKOUTS_FILE)) {
    const data = fs.readFileSync(WORKOUTS_FILE);
    return JSON.parse(data);
  }
  return [];
};

// Utility function to write workouts to file
const writeWorkouts = (workouts) => {
  fs.writeFileSync(WORKOUTS_FILE, JSON.stringify(workouts, null, 2));
};

// Route to get all workout logs
app.get('/workouts', (req, res) => {
  const workouts = readWorkouts();
  res.json(workouts);
});

// Route to create a new workout log
app.post('/workouts', (req, res) => {
  const workouts = readWorkouts();
  const newWorkout = {
    id: workouts.length + 1,
    activity: req.body.activity,
    duration: req.body.duration, // in minutes
    caloriesBurned: req.body.caloriesBurned
  };
  workouts.push(newWorkout);
  writeWorkouts(workouts);
  res.status(201).json(newWorkout);
});

// Route to update an existing workout log
app.put('/workouts/:id', (req, res) => {
  const workouts = readWorkouts();
  const workoutId = parseInt(req.params.id);
  const workoutIndex = workouts.findIndex(workout => workout.id === workoutId);

  if (workoutIndex !== -1) {
    workouts[workoutIndex].activity = req.body.activity || workouts[workoutIndex].activity;
    workouts[workoutIndex].duration = req.body.duration || workouts[workoutIndex].duration;
    workouts[workoutIndex].caloriesBurned = req.body.caloriesBurned || workouts[workoutIndex].caloriesBurned;
    writeWorkouts(workouts);
    res.json(workouts[workoutIndex]);
  } else {
    res.status(404).json({ message: "Workout not found" });
  }
});

// Route to delete a workout log
app.delete('/workouts/:id', (req, res) => {
  const workouts = readWorkouts();
  const workoutId = parseInt(req.params.id);
  const updatedWorkouts = workouts.filter(workout => workout.id !== workoutId);

  if (workouts.length !== updatedWorkouts.length) {
    writeWorkouts(updatedWorkouts);
    res.json({ message: "Workout deleted" });
  } else {
    res.status(404).json({ message: "Workout not found" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Fitness Tracker API running at http://localhost:${port}`);
});
