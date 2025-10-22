require('dotenv').config();
const express = require('express');
const stringsRouter = require('./routes/strings.routes');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/strings', stringsRouter );

// app.use((err, req, res, next) => {
//   if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
//     return res.status(400).json({ message: 'Invalid JSON body' });
//   }
//   next();
// });

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// 404 handler
// Default 404 should be LAST
// app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the API at ${PORT}/strings`);
});


// Add error handling for the server Or any unhandled exceptions
app.on('error', (err) => {
    if (err.code === 'EACCES') {
        console.error(`Permission denied on port ${PORT}. Try running with elevated privileges or using a different port.`);
        process.exit(1);
    } else if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Choose a different port.`);
        process.exit(1);
    } else {
        console.error('Unhandled server error:', err);
        process.exit(1);
    }
});

process.on('uncaughtException', (err) => {
    console.error('Unhandled exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

