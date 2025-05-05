// src/components/MoodForecast.jsx
import React, { useState, useEffect } from 'react';
import { getRecentlyPlayedTracks, getAudioFeaturesForTracks, getTopTracks } from '../services/spotifyService';
import { calculateMoodStats, generateForecastSentence } from '../utils/moodAnalyzer';

const MoodForecast = () => {
  const [moodStats, setMoodStats] = useState(null); // null: initial, []: no data/error, array: success
  const [forecastSentence, setForecastSentence] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisSource, setAnalysisSource] = useState(''); // 'recent' or 'top'

  useEffect(() => {
    const fetchAndAnalyzeMood = async () => {
      setIsLoading(true);
      setError(null);
      setMoodStats(null);
      setForecastSentence('');
      setAnalysisSource('');
      console.log("[MoodForecast START] Starting fetchAndAnalyzeMood...");

      let finalFeatures = [];
      let trackSourceUsed = 'none';

      try {
        // --- Step 1: Try Recently Played Tracks ---
        console.log("[MoodForecast STEP 1] Attempting getRecentlyPlayedTracks...");
        const recentTracks = await getRecentlyPlayedTracks(50);
        console.log(`[MoodForecast STEP 1 RESULT] Found ${recentTracks?.length ?? 0} recent tracks.`);

        if (recentTracks && recentTracks.length > 0) {
          trackSourceUsed = 'recent';
          const recentTrackIds = recentTracks.map(track => track.id).filter(id => !!id);

          if (recentTrackIds.length > 0) {
            console.log(`[MoodForecast STEP 2a] Attempting features for ${recentTrackIds.length} recent tracks...`);
            const recentFeatures = await getAudioFeaturesForTracks(recentTrackIds);

            if (recentFeatures && recentFeatures.length > 0) {
              console.log(`[MoodForecast STEP 2a SUCCESS] Got ${recentFeatures.length} valid features from recent tracks.`);
              finalFeatures = recentFeatures;
              setAnalysisSource('Recently Played Tracks');
            } else {
              console.warn("[MoodForecast STEP 2a FAILED] No valid features returned for recent tracks. Will try top tracks.");
            }
          } else {
             console.warn("[MoodForecast STEP 1 WARN] Recent tracks found, but none had valid IDs.");
          }
        } else {
          console.log("[MoodForecast STEP 1 FAILED] No recent tracks found. Will try top tracks directly.");
        }

        // --- Step 2: Try Top Tracks (if needed) ---
        // Execute if we didn't get features from recent tracks OR if there were no recent tracks at all
        if (finalFeatures.length === 0) {
          console.log("[MoodForecast STEP 2b] Attempting getTopTracks...");
          const topTracks = await getTopTracks(50, 'short_term');
          console.log(`[MoodForecast STEP 2b RESULT] Found ${topTracks?.length ?? 0} top tracks.`);

          if (topTracks && topTracks.length > 0) {
            trackSourceUsed = 'top'; // Mark that we switched or started here
            const topTrackIds = topTracks.map(track => track.id).filter(id => !!id);

            if (topTrackIds.length > 0) {
              console.log(`[MoodForecast STEP 3] Attempting features for ${topTrackIds.length} top tracks...`);
              const topFeatures = await getAudioFeaturesForTracks(topTrackIds);

              if (topFeatures && topFeatures.length > 0) {
                console.log(`[MoodForecast STEP 3 SUCCESS] Got ${topFeatures.length} valid features from top tracks.`);
                finalFeatures = topFeatures;
                setAnalysisSource('Top Tracks'); // Update source description
              } else {
                console.error("[MoodForecast STEP 3 FAILED] No valid features returned for top tracks either.");
              }
            } else {
               console.warn("[MoodForecast STEP 2b WARN] Top tracks found, but none had valid IDs.");
            }
          } else {
             console.warn("[MoodForecast STEP 2b FAILED] No top tracks found.");
          }
        }

        // --- Step 4: Analyze if Features Exist ---
        if (finalFeatures.length > 0) {
          console.log(`[MoodForecast STEP 4] Analyzing ${finalFeatures.length} features from source: ${analysisSource}`);
          const calculatedStats = calculateMoodStats(finalFeatures);
          console.log("[MoodForecast STEP 4 RESULT] Calculated Stats:", calculatedStats);

          if (calculatedStats && calculatedStats.length > 0) {
            setMoodStats(calculatedStats);
            setForecastSentence(generateForecastSentence(calculatedStats));
            console.log("[MoodForecast STEP 5] Analysis successful.");
          } else {
            console.warn("[MoodForecast STEP 4 FAILED/EMPTY] Mood calculation resulted in empty stats.");
            setMoodStats([]); // Set empty state
          }
        } else {
          // This case means neither recent nor top tracks yielded analysable features
          console.error("[MoodForecast FINAL] No valid audio features obtained from any source.");
          setMoodStats([]); // Set empty state
        }

      } catch (err) {
        console.error("[MoodForecast ERROR] Error during overall process:", err);
        // Check if it's an error *during* feature fetching that wasn't caught inside the service
        const message = err?.response?.data?.error?.message || err.message || "Could not generate vibe forecast.";
        setError(message); // Set a generic error state if something unexpected breaks the flow
        setMoodStats([]); // Ensure empty state on unexpected error
      } finally {
        setIsLoading(false);
        console.log("[MoodForecast END] fetchAndAnalyzeMood finished.");
      }
    };

    fetchAndAnalyzeMood();
  }, []); // Fetch only on mount

  // --- Render Logic ---

  console.log("[MoodForecast RENDER] Component rendering...");
  console.log("[MoodForecast RENDER STATE] isLoading:", isLoading, "error:", error, "moodStats:", moodStats);

  if (isLoading) {
    return <div className="mood-forecast-container loading-state">Calculating your vibes...</div>;
  }

  if (error) {
    // Display a specific error message caught during the process
    return <div className="mood-forecast-container error-state">Error: {error}</div>;
  }

  // Handle case where fetching/calculation resulted in no data
  // Use moodStats state (null initial, [] no data/error, array success)
  if (moodStats === null || moodStats.length === 0) {
    console.log("[MoodForecast RENDER] Displaying Empty State: moodStats is null or empty array.");
    // Provide a slightly more informative message if possible
    const emptyMessage = analysisSource // If we know we tried but failed
      ? `Could not get enough audio details from your ${analysisSource.toLowerCase()} to generate a forecast.`
      : "Not enough recent listening data to generate a forecast! Spin some more tracks and check back.";
    return <div className="mood-forecast-container empty-state">{emptyMessage} Try listening to more music.</div>;
  }

  // --- Render calculated stats (only if moodStats is a non-empty array) ---
  console.log(`[MoodForecast RENDER] Displaying Mood Stats based on ${analysisSource}`);
  const topMood = moodStats[0];
  const secondMood = moodStats[1] || { value: 0, label: '-', color: '#888' };

  return (
    <div className="mood-forecast-container">
      {/* Optionally indicate the source */}
      <h2 className="mood-forecast-title">🎧 Your Vibe Forecast <span className="mood-source-indicator">(Based on {analysisSource})</span></h2>


      <div className="mood-bars">
        {moodStats.map((mood) => (
          <div key={mood.label} className="mood-bar-item">
            <span className="mood-bar-label">{mood.label}</span>
            <div className="mood-bar-progress-track">
              <div
                className="mood-bar-progress-fill"
                style={{
                  width: `${mood.value}%`,
                  backgroundColor: mood.color
                }}
              ></div>
            </div>
            <span className="mood-bar-percentage">{mood.value}%</span>
          </div>
        ))}
      </div>

      <p className="forecast-sentence">{forecastSentence}</p>

      {/* ... rest of JSX remains the same ... */}
       <div className="mood-actions">
        <button className="mood-action-button amplify">Amplify</button>
        <button className="mood-action-button stabilize">Stabilize</button>
        <button className="mood-action-button curveball">Vibe Curveball</button>
      </div>

      <div className="genre-breakdown">
        <p>Top Moods: <strong>{topMood.value}% {topMood.label.split(' ').pop()}</strong>{moodStats.length > 1 ? `, ${secondMood.value}% ${secondMood.label.split(' ').pop()}` : ''}</p>
      </div>

      <div className="share-compare-actions">
        <button className="share-compare-button primary">Share Mood Card</button>
        <button className="share-compare-button">Compare with Friends</button>
      </div>
    </div>
  );
};

export default MoodForecast;