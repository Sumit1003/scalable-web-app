const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// Fixed CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'https://scalable-web-app-delta.vercel.app',
        'https://scalable-web-app-delta.vercel.app'
    ],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://sk6306210_db_user:rNSLKy8aC2MLywiE@scalable-web-app.ipxachk.mongodb.net/?retryWrites=true&w=majority&appName=scalable-web-app', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Test route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// 🔍 DEBUG: Route loading with proper placement
console.log('🔍 Loading routes...');

let authRoutes, userRoutes, taskRoutes, passwordRoutes;

try {
    authRoutes = require('./routes/auth');
    console.log('✅ Auth routes loaded');
} catch (error) {
    console.error('❌ Auth routes failed to load:', error.message);
    // Create a basic fallback to prevent crash
    authRoutes = express.Router();
    authRoutes.post('/register', (req, res) => res.status(500).json({ error: 'Auth routes failed to load' }));
}

try {
    userRoutes = require('./routes/users');
    console.log('✅ User routes loaded');
} catch (error) {
    console.error('❌ User routes failed to load:', error.message);
    userRoutes = express.Router();
}

try {
    taskRoutes = require('./routes/tasks');
    console.log('✅ Task routes loaded');
} catch (error) {
    console.error('❌ Task routes failed to load:', error.message);
    taskRoutes = express.Router();
}

try {
    passwordRoutes = require('./routes/password');
    console.log('✅ Password routes loaded');
} catch (error) {
    console.error('❌ Password routes failed to load:', error.message);
    passwordRoutes = express.Router();
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/password', passwordRoutes);

// 🔍 DEBUG: Log all registered routes
app.use((req, res, next) => {
    console.log(`📝 Incoming Request: ${req.method} ${req.originalUrl}`);
    next();
});

// Debug registered routes after all are mounted
console.log('🛣️  Registered Routes:');
app._router.stack.forEach((layer) => {
    if (layer.route) {
        console.log(`   ${Object.keys(layer.route.methods)} ${layer.route.path}`);
    } else if (layer.name === 'router') {
        console.log(`   Router: ${layer.regexp}`);
        // Log routes from mounted routers
        if (layer.handle.stack) {
            layer.handle.stack.forEach((sublayer) => {
                if (sublayer.route) {
                    console.log(`     ${Object.keys(sublayer.route.methods)} ${sublayer.route.path}`);
                }
            });
        }
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('💥 Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});