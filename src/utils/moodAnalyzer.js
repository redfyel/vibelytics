// src/utils/moodAnalyzer.js

// --- Mood Definitions (ADJUST THESE THRESHOLDS!) ---
const MOOD_THRESHOLDS = {
    HAPPY: { valenceMin: 0.65, energyMin: 0.5 },
    SAD: { valenceMax: 0.35, energyMax: 0.5 },
    HYPE: { energyMin: 0.75, danceabilityMin: 0.6 },
    MELLOW: { energyMax: 0.4 }, // Tracks not classified as Sad
    // CHAOTIC: { energyMin: 0.9 }, // Example for chaotic
  };

  // Map mood labels to colors and potentially icons
  export const MOOD_DETAILS = {
    '😄 Happy': { color: '#facc15' },
    '💧 Sad': { color: '#60a5fa' },
    '⚡ Hype': { color: '#f472b6' },
    '🌙 Mellow': { color: '#38bdf8' },
    // '🔥 Chaotic': { color: '#f87171' },
    '❓ Mixed': { color: '#9ca3af' } // Fallback color
  };

  /**
   * Classifies a track's mood based on its audio features.
   * Order of checks matters! Hype override others, Mellow is fallback low energy.
   * @param {object} features - Spotify audio features object.
   * @returns {string} The classified mood label.
   */
  function classifyTrackMood(features) {
    if (!features) return '❓ Mixed'; // Or 'Unknown'

    const { valence, energy, danceability } = features;

    // Check Hype first due to high energy dominance
    if (energy >= MOOD_THRESHOLDS.HYPE.energyMin && danceability >= MOOD_THRESHOLDS.HYPE.danceabilityMin) {
      return '⚡ Hype';
    }
    // Check Happy
    if (valence >= MOOD_THRESHOLDS.HAPPY.valenceMin && energy >= MOOD_THRESHOLDS.HAPPY.energyMin) {
      return '😄 Happy';
    }
    // Check Sad (low valence AND low energy)
    if (valence <= MOOD_THRESHOLDS.SAD.valenceMax && energy <= MOOD_THRESHOLDS.SAD.energyMax) {
      return '💧 Sad';
    }
    // Check Mellow (low energy, but wasn't sad)
    if (energy <= MOOD_THRESHOLDS.MELLOW.energyMax) {
      return '🌙 Mellow';
    }
    // Add Chaotic check if defined
    // if (energy >= MOOD_THRESHOLDS.CHAOTIC.energyMin) {
    //   return '🔥 Chaotic';
    // }

    // Default fallback
    return '❓ Mixed';
  }

  /**
   * Calculates mood percentages from a list of audio feature objects.
   * @param {Array<object>} audioFeaturesList - List of audio features.
   * @returns {Array<{label: string, value: number, color: string}>} Sorted mood stats.
   */
  export function calculateMoodStats(audioFeaturesList) {
    const moodCounts = {};
    // Initialize counts for all defined moods + Mixed
    Object.keys(MOOD_DETAILS).forEach(label => { moodCounts[label] = 0; });

    const validFeatures = audioFeaturesList.filter(f => f); // Ensure no null features
    const totalTracks = validFeatures.length;

    if (totalTracks === 0) {
      return []; // Return empty array if no valid features
    }

    // Count moods
    validFeatures.forEach(features => {
      const moodLabel = classifyTrackMood(features);
      if (moodCounts.hasOwnProperty(moodLabel)) {
        moodCounts[moodLabel]++;
      } else {
          // This case should ideally not happen if classifyTrackMood is exhaustive
          if (!moodCounts['❓ Mixed']) moodCounts['❓ Mixed'] = 0; // Safety
          moodCounts['❓ Mixed']++;
      }
    });

    // Calculate percentages and format
    const moodStats = Object.entries(moodCounts)
      .map(([label, count]) => ({
        label,
        value: Math.round((count / totalTracks) * 100),
        color: MOOD_DETAILS[label]?.color || '#888' // Get color from details map
      }))
      .filter(mood => mood.value > 0) // Only include moods with > 0%
      .sort((a, b) => b.value - a.value); // Sort descending

    return moodStats;
  }

  // Optional: Function to generate the forecast sentence dynamically
  export function generateForecastSentence(moodStats) {
      if (!moodStats || moodStats.length === 0) {
          return "Listen to more music to get your vibe forecast!";
      }
      const topMood = moodStats[0];
      const secondMood = moodStats.length > 1 ? moodStats[1] : null;

      let sentence = `You've been mostly feeling ${topMood.label.split(' ')[1].toLowerCase()}. `;

      // Simple logic based on top mood
      switch (topMood.label) {
          case '😄 Happy': sentence += "Keep the good vibes going, or maybe find something Mellow?"; break;
          case '🌙 Mellow': sentence += "Stay chill, or maybe energize with some Hype tracks?"; break;
          case '⚡ Hype': sentence += "You're full of energy! Keep it up or find some balance?"; break;
          case '💧 Sad': sentence += "It's okay to feel blue. Maybe find some comforting Happy tunes?"; break;
          case '❓ Mixed': sentence += "Your vibes are diverse! Explore more or focus on a mood?"; break;
          default: sentence += "Keep exploring different vibes!";
      }
      return `“${sentence}”`;
  }

  