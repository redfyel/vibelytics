// src/components/MoodForecast.jsx
import React, { useState, useEffect } from 'react';
import { getRecentlyPlayedTracks, getAudioFeaturesForTracks, getTopTracks } from '../services/spotifyService';
import { calculateMoodStats, generateForecastSentence } from '../utils/moodAnalyzer';

// Example simple components for loading/error/empty states (replace with your actual components)
const LoadingSpinner = () => <div className="mood-forecast-container loading-state">Calculating your vibes...</div>;
const ErrorMessage = ({ message }) => <div className="mood-forecast-container error-state">Error: {message}</div>;
const EmptyStateComponent = ({ message }) => <div className="mood-forecast-container empty-state">{message} Try listening to more music.</div>;


const MoodForecast = () => {
  const [moodStats, setMoodStats] = useState(null); // null: initial, []: no data/error, array: success
  const [forecastSentence, setForecastSentence] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Changed to hold Error object or null
  const [analysisSource, setAnalysisSource] = useState(''); // 'recent' or 'top'

  useEffect(() => {
    const fetchAndAnalyzeMood = async () => {
      setIsLoading(true);
      setError(null); // Reset error state
      setMoodStats(null); // Reset mood stats
      setForecastSentence('');
      setAnalysisSource('');
      console.log("[MoodForecast START] Starting fetchAndAnalyzeMood...");

      let finalFeatures = [];
      let trackSourceUsed = 'none'; // Keep track of which source was attempted

      try {
        // --- Step 1: Try Recently Played Tracks ---
        console.log("[MoodForecast STEP 1] Attempting getRecentlyPlayedTracks...");
        const recentTracks = await getRecentlyPlayedTracks(50);
        console.log(`[MoodForecast STEP 1 RESULT] Found ${recentTracks?.length ?? 0} recent tracks.`);

        if (recentTracks && recentTracks.length > 0) {
          trackSourceUsed = 'recent'; // Mark that we attempted recent tracks
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
              // Don't set error here, fallback logic will run
            }
          } else {
             console.warn("[MoodForecast STEP 1 WARN] Recent tracks found, but none had valid IDs.");
          }
        } else {
          console.log("[MoodForecast STEP 1 FAILED] No recent tracks found. Will try top tracks directly.");
        }

        // --- Step 2: Try Top Tracks (if needed) ---
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
                // If both recent and top failed to get features, this path leads to the final check below
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
            setMoodStats(calculatedStats); // Success state
            setForecastSentence(generateForecastSentence(calculatedStats));
            console.log("[MoodForecast STEP 5] Analysis successful.");
          } else {
            console.warn("[MoodForecast STEP 4 FAILED/EMPTY] Mood calculation resulted in empty stats.");
            setMoodStats([]); // Set empty state
          }
        } else {
          // This case means neither recent nor top tracks yielded analysable features,
          // OR the calls to get tracks themselves failed.
          console.error("[MoodForecast FINAL] No valid audio features obtained or calculable from any source.");
          setMoodStats([]); // Set empty state explicitly if no features were ever found
        }

      // *** UPDATED CATCH BLOCK ***
      } catch (err) {
          console.error("[MoodForecast ERROR] Error during overall process:", err);
          // Set the error state here
          if (err.response && err.response.status === 403) {
               // Specific message for permission issues
               setError(new Error('Permission denied by Spotify. Please try reconnecting your account.'));
          } else if (err instanceof Error) {
               // Use the error object directly if it's already an Error
               setError(err);
          } else {
               // Fallback for unknown errors or non-Error throws
               const message = err?.message || (typeof err === 'string' ? err : 'An unknown error occurred while fetching mood data.');
               setError(new Error(message));
          }
          // Set moodStats to empty array when an error occurs during fetching/analysis
          // This differentiates from the initial `null` state before fetching starts.
          // The render logic will prioritize showing the error message over the empty state.
          setMoodStats([]);
      // *** END UPDATED CATCH BLOCK ***

      // *** UPDATED FINALLY BLOCK ***
      } finally {
          setIsLoading(false); // Ensure loading is always turned off
          console.log("[MoodForecast END] fetchAndAnalyzeMood finished.");
      }
      // *** END UPDATED FINALLY BLOCK ***
    };

    fetchAndAnalyzeMood();
  }, []); // Fetch only on mount

  // --- Render Logic ---

  console.log("[MoodForecast RENDER] Component rendering...");
  console.log("[MoodForecast RENDER STATE] isLoading:", isLoading, "error:", error, "moodStats:", moodStats);

  // *** UPDATED RENDER LOGIC ORDER ***

  // 1. Show loading state first
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // 2. Show error message if an error occurred (takes precedence over empty state)
  if (error) {
    return <ErrorMessage message={error.message} />; // Display the error message
  }

  // 3. Show empty state if loading is done, there's no error, but moodStats is null or empty
  if (moodStats === null || moodStats.length === 0) {
    console.log("[MoodForecast RENDER] Displaying Empty State: moodStats is null or empty array.");
    // Determine a helpful empty message based on whether we know which source was attempted
    const emptyMessage = analysisSource // If we know we tried but failed
      ? `Could not get enough audio details from your ${analysisSource.toLowerCase()} to generate a forecast.`
      : "Not enough listening data found to generate a forecast!"; // More generic if no source was even attempted successfully
    return <EmptyStateComponent message={emptyMessage} />;
  }

  // 4. Render the actual mood forecast if loading is done, no error, and moodStats has data
  console.log(`[MoodForecast RENDER] Displaying Mood Stats based on ${analysisSource}`);
  const topMood = moodStats[0];
  const secondMood = moodStats[1] || { value: 0, label: '-', color: '#888' }; // Graceful fallback if < 2 moods

  return (
    <div className="mood-forecast-container">
      <h2 className="mood-forecast-title">🎧 Your Vibelytics <span className="mood-source-indicator">(Based on {analysisSource})</span></h2>

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