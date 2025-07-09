require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const path = require('path');
const app = express();

// ✅ Connect to database
require('./config/db');

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static frontend and uploaded images
app.use('/frontend', express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static('uploads'));

// ✅ Import route files
const userRoutes = require('./routes/user');
const homeRoutes = require('./routes/home');
const adminRoutes = require('./routes/admindashboard');
const productRoutes = require('./routes/product');
const supplierRoutes = require('./routes/supplier');
const manageuserRoutes = require('./routes/manageuser');

// ✅ Mount routes under same API version prefix
app.use('/api/v1', userRoutes);
app.use('/api/v1', homeRoutes);
app.use('/api/v1', adminRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', supplierRoutes);
app.use('/api/v1', manageuserRoutes);


// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log("PORT:", PORT);
    console.log("DB_USER:", process.env.DB_USER);
    console.log(`Server is running on port ${PORT}`);
});
