const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const path = require('path');

// Load environment variables first with explicit path
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug: Check if environment variables are loaded
console.log('Environment variables loaded:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);

const app = express();
const db = require('./database/db');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.json());


// Routes
app.use('/api/products', require('./inventoryManagement/routes/productsRoute'));
app.use('/api/sales', require('./inventoryManagement/routes/salesRoute'));
app.use('/api/purchases', require('./inventoryManagement/routes/purchasesRoute'));
app.use('/api/history', require('./inventoryManagement/routes/historyRoute'));
app.use('/api/vat-bill', require('./inventoryManagement/routes/vatBillRoute'));
app.use('/api/dishhome', require('./dishomeFibernet/routes/dishhomeRoutes'));
app.use('/api/fibernet', require('./dishomeFibernet/routes/fibernetRoutes'));
app.use('/api/Dhfibernet', require('./dishomeFibernet/routes/dishhome_fibernetRoutes'));


// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await db.query('SELECT 1');
    res.status(200).json({
      status: 'healthy',
      message: 'Backend and database are connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 8000;
app.get('/', (req, res) => {
  res.status(200).send('Hello, World!');
})

db.query('SELECT 1').then(() => {
    console.log('Database connected successfully'.bgGreen);
    app.listen(PORT, () =>{
        console.log(`Server is running on port ${PORT}`.bgBlue);
    })
})
.catch((err) => {
    console.log(err);
});

