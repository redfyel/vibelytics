// backend/routes/spotifyRoutes.js
import express from 'express';
import {
  getTrendingSongs,
  getPopularArtists,
  getNewReleases,
  getPopularRadio,
  getFeaturedCharts,
  getIndiasBest,
} from '../services/spotifyService.js';

const router = express.Router();

const wrap = fn => (req, res, next) =>
  fn(req, res).catch(next);

// Each route returns an array (possibly empty) so frontend can render or skip
router.get('/trending-songs', wrap(async (req, res) => {
  res.json(await getTrendingSongs());
}));

router.get('/popular-artists', wrap(async (req, res) => {
  res.json(await getPopularArtists());
}));

router.get('/new-releases', wrap(async (req, res) => {
  res.json(await getNewReleases());
}));

router.get('/popular-radio', wrap(async (req, res) => {
  res.json(await getPopularRadio());
}));

router.get('/featured-charts', wrap(async (req, res) => {
  res.json(await getFeaturedCharts());
}));

router.get('/indias-best', async (req, res) => {
    console.log("ROUTE: GET /indias-best triggered"); // Log when the route is hit
    try {
        // Call the service function which now has internal error handling
        const data = await getIndiasBest();

        // The service function returns [] on error, so we just send the result.
        // The service function handles logging the specific Spotify API error.
        res.status(200).json(data);

    } catch (error) {
        // This catch block handles errors *outside* the Spotify API call itself
        // (e.g., issues within the getIndiasBest function before the try/catch,
        // or problems getting the access token if that fails unexpectedly).
        console.error("ROUTE ERROR: /indias-best - Unhandled exception in route:", error);
        res.status(500).json({ error: 'Internal server error while processing India\'s Best request' });
    }
});

export default router;
