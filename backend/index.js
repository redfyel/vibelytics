import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import spotifyRoutes from './routes/spotifyRoutes.js';
dotenv.config();

console.log('DEBUG: SPOTIFY_CLIENT_ID Loaded?', !!process.env.SPOTIFY_CLIENT_ID);
console.log('DEBUG: SPOTIFY_CLIENT_SECRET Loaded?', !!process.env.SPOTIFY_CLIENT_SECRET ? 'Yes' : 'NO!!!');

const app = express();
const PORT = 8888
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/api/spotify', spotifyRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
