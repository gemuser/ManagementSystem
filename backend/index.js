const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');

dotenv.config();
const app = express();
const db = require('./database/db');
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


// Routes
app.use('/api/products', require('./routes/productsRoute'));
app.use('/api/sales', require('./routes/salesRoute'));


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

