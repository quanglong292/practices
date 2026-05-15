// ========================================================
// 📚 MUSIC PLAYER — LRU Cache Design (LeetCode #146 Medium)
// ========================================================
// Design a Music Player that maintains a "Recently Played"
// list using an LRU (Least Recently Used) Cache.
//
// Requirements:
// - play(songId)   → plays a song, moves it to most recent
// - getRecent()    → returns recently played songs in order
// - capacity limit → oldest song is evicted when full
//
// This is essentially an LRU Cache — a very common
// interview question that combines HashMap + Doubly Linked List.
//
// We'll use JS Map which maintains insertion order,
// making it perfect for LRU implementation.
// ========================================================

// ─────────────────────────────────────────────────────────
// APPROACH: Map as Ordered Cache — O(1) per operation
//
// JS Map remembers insertion order. To "move to recent":
//   1. Delete the key
//   2. Re-insert it (now it's the last/most recent)
//
// The FIRST entry in the Map = Least Recently Used
// The LAST entry in the Map = Most Recently Used
// ─────────────────────────────────────────────────────────
const createMusicPlayer = (capacity) => {
  const recentlyPlayed = new Map(); // songId → songName

  const songLibrary = {
    1: "Shape of You",
    2: "Blinding Lights",
    3: "Bohemian Rhapsody",
    4: "Hotel California",
    5: "Stairway to Heaven",
    6: "Imagine",
    7: "Lose Yourself",
  };

  const play = (songId) => {
    const songName = songLibrary[songId] || `Song #${songId}`;

    // If song is already in recent, delete it first
    // so we can re-insert it at the end (most recent)
    if (recentlyPlayed.has(songId)) {
      recentlyPlayed.delete(songId);
    }

    // Insert at the end (most recent position)
    recentlyPlayed.set(songId, songName);

    // If over capacity, remove the LEAST recently used
    // (the first entry in the Map)
    if (recentlyPlayed.size > capacity) {
      const oldestKey = recentlyPlayed.keys().next().value;
      recentlyPlayed.delete(oldestKey);
    }

    console.log(`▶ Now playing: "${songName}"`);
  };

  const getRecent = () => {
    // Convert to array, reverse so most recent is first
    return [...recentlyPlayed.values()].reverse();
  };

  const skip = () => {
    // Remove the most recently played song
    const entries = [...recentlyPlayed.entries()];
    if (entries.length === 0) {
      console.log("⏹ No songs to skip");
      return;
    }
    const [lastId, lastName] = entries[entries.length - 1];
    recentlyPlayed.delete(lastId);
    console.log(`⏭ Skipped: "${lastName}"`);
  };

  return { play, getRecent, skip };
};

// ─────────────────────────────────────────────────────────
// TEST CASES
// ─────────────────────────────────────────────────────────
console.log("=== Music Player (LRU Cache) ===\n");

const player = createMusicPlayer(3); // capacity = 3

player.play(1); // ▶ Shape of You
player.play(2); // ▶ Blinding Lights
player.play(3); // ▶ Bohemian Rhapsody
console.log("Recent:", player.getRecent());
// ["Bohemian Rhapsody", "Blinding Lights", "Shape of You"]

player.play(4); // ▶ Hotel California (evicts Shape of You)
console.log("Recent after eviction:", player.getRecent());
// ["Hotel California", "Bohemian Rhapsody", "Blinding Lights"]

player.play(2); // ▶ Blinding Lights (moved to most recent)
console.log("Recent after re-play:", player.getRecent());
// ["Blinding Lights", "Hotel California", "Bohemian Rhapsody"]

player.skip(); // ⏭ Skipped Blinding Lights
console.log("Recent after skip:", player.getRecent());
// ["Hotel California", "Bohemian Rhapsody"]
