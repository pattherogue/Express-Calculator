const express = require('express');
const fs = require('fs');
const app = express();

// Middleware to parse query parameters
app.use(express.urlencoded({ extended: true }));

// Middleware to handle JSON responses
app.use(express.json());

// Function to calculate mean
const calculateMean = (nums) => {
  const numbers = nums.split(',').map(num => parseFloat(num));
  if (numbers.some(isNaN)) {
    throw new Error('Invalid number');
  }
  if (numbers.length === 0) {
    throw new Error('nums are required');
  }
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  return sum / numbers.length;
};

// Function to calculate median
const calculateMedian = (nums) => {
  const numbers = nums.split(',').map(num => parseFloat(num)).sort((a, b) => a - b);
  if (numbers.some(isNaN)) {
    throw new Error('Invalid number');
  }
  if (numbers.length === 0) {
    throw new Error('nums are required');
  }
  const middle = Math.floor(numbers.length / 2);
  if (numbers.length % 2 === 0) {
    return (numbers[middle - 1] + numbers[middle]) / 2;
  } else {
    return numbers[middle];
  }
};

// Function to calculate mode
const calculateMode = (nums) => {
  const numbers = nums.split(',').map(num => parseFloat(num));
  if (numbers.some(isNaN)) {
    throw new Error('Invalid number');
  }
  if (numbers.length === 0) {
    throw new Error('nums are required');
  }
  const modeMap = {};
  let maxCount = 0;
  let modes = [];

  numbers.forEach(num => {
    modeMap[num] = (modeMap[num] || 0) + 1;
    if (modeMap[num] > maxCount) {
      modes = [num];
      maxCount = modeMap[num];
    } else if (modeMap[num] === maxCount) {
      modes.push(num);
    }
  });

  return modes;
};

// Route for mean calculation
app.get('/mean', (req, res) => {
  try {
    const mean = calculateMean(req.query.nums);
    res.json({ operation: 'mean', value: mean });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route for median calculation
app.get('/median', (req, res) => {
  try {
    const median = calculateMedian(req.query.nums);
    res.json({ operation: 'median', value: median });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route for mode calculation
app.get('/mode', (req, res) => {
  try {
    const mode = calculateMode(req.query.nums);
    res.json({ operation: 'mode', value: mode });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route for all operations
app.get('/all', (req, res) => {
  try {
    const nums = req.query.nums;
    const mean = calculateMean(nums);
    const median = calculateMedian(nums);
    const mode = calculateMode(nums);
    res.json({ operation: 'all', mean, median, mode });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Function to save results to a file
const saveToFile = (data) => {
  const fileName = 'results.json';
  const timestamp = new Date().toISOString();
  const content = { timestamp, ...data };

  fs.writeFile(fileName, JSON.stringify(content), (err) => {
    if (err) throw err;
    console.log('Results saved to file:', fileName);
  });
};

// Route to handle saving results to a file
app.get('/save', (req, res) => {
  try {
    const save = req.query.save === 'true';
    const nums = req.query.nums;
    const mean = calculateMean(nums);
    const median = calculateMedian(nums);
    const mode = calculateMode(nums);
    const data = { mean, median, mode };
    res.json({ operation: 'save', save, data });

    if (save) {
      saveToFile(data);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
