const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const ruanganRoute = require('./routes/ruangan.route');
const gedungRoute = require('./routes/gedung.route');
const authRoute = require('./routes/auth.route');
const peminjamanRoute = require('./routes/peminjaman.route');
const approvalRoute = require('./routes/approval-log.route');

app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

app.use('/auth', authRoute);
app.use('/gedung', gedungRoute);
app.use('/ruangan', ruanganRoute);
app.use('/peminjaman', peminjamanRoute);
app.use('/approval-log', approvalRoute);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});