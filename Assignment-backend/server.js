//assigment
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const USERS = [
  {
    'email': 'manojggiliyari@gmail.com',
    'password': 'password123',
    'isAdmin': true
  }
];

const QUESTIONS = [
  {
    id: 1,
    title: 'Find Maximum',
    description: 'Given an array, return the maximum value',
    testCase: [
      {
        input: '[1,2,3,4,5]',
        output: '5'
      }
    ]
  },
];

const SUBMISSIONS = [];

function getResult() {
  const randomNumber = Math.random();
  return randomNumber < 0.5 ? 'accepted' : 'rejected';
}

app.use(bodyParser.json());

function authenticateUser(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
}

app.get('/', (req, res) => {
  res.json({
    message: 'Hello'
  });
});

app.post('/signup', (req, res) => {
  const { email, password } = req.body;
  if (USERS.find(user => user.email === email)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  USERS.push({ email, password, isAdmin: false });
  res.status(201).json({ message: 'User created' });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find(user => user.email === email && user.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ email: user.email, isAdmin: user.isAdmin }, 'your-secret-key', {
    expiresIn: '1h'
  });

  res.status(200).json({ token });
});

app.get('/questions', (req, res) => {
  const questions = QUESTIONS.map(q => ({
    id: q.id,
    title: q.title,
    description: q.description,
    testCase: q.testCase
  }));
  res.json(questions);
});

app.get('/submissions', authenticateUser, (req, res) => {
  const userSubmissions = SUBMISSIONS.filter(submission => submission.userId === req.user.email);
  res.json(userSubmissions);
});

app.post('/submissions', authenticateUser, (req, res) => {
  const { problemId, code } = req.body;
  const problem = QUESTIONS.find(q => q.id === problemId);
  if (!problem) {
    return res.status(404).json({ message: 'Problem not found' });
  }

  const result = getResult();
  SUBMISSIONS.push({ userId: req.user.email, problemId, code, result });
  res.json({ message: 'Submission received', result });
});

app.post('/create-problem', authenticateUser, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Only admins can create problems' });
  }

 

  res.status(201).json({ message: 'Problem created' });
});

app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
