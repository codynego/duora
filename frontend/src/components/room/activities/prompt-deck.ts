export function shuffledDeck<T>(items: T[], seed = 1): T[] {
  const deck = [...items];
  let value = seed || 1;

  for (let index = deck.length - 1; index > 0; index -= 1) {
    value = (value * 1_664_525 + 1_013_904_223) >>> 0;
    const swapIndex = value % (index + 1);
    [deck[index], deck[swapIndex]] = [deck[swapIndex], deck[index]];
  }

  return deck;
}

const PROGRESS_KEY = 'duora-talk-deck-progress';
const SEEDS_KEY = 'duora-talk-deck-seeds';

function readProgress(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const value = window.localStorage.getItem(PROGRESS_KEY);
    return value ? JSON.parse(value) as Record<string, number> : {};
  } catch {
    return {};
  }
}

function readSeeds(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const value = window.localStorage.getItem(SEEDS_KEY);
    return value ? JSON.parse(value) as Record<string, number> : {};
  } catch {
    return {};
  }
}

export function getSavedDeckIndex(deckId: string, deckLength: number) {
  const savedIndex = readProgress()[deckId];
  return typeof savedIndex === 'number' && deckLength > 0 ? savedIndex % deckLength : 0;
}

export function saveDeckIndex(deckId: string, index: number, deckLength: number) {
  if (typeof window === 'undefined' || deckLength <= 0) return;
  try {
    const progress = readProgress();
    progress[deckId] = index % deckLength;
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Local storage can be unavailable; the room state still works.
  }
}

export function getSavedDeckSeed(deckId: string) {
  const seed = readSeeds()[deckId];
  return typeof seed === 'number' ? seed : null;
}

export function saveDeckSeed(deckId: string, seed: number) {
  if (typeof window === 'undefined') return;
  try {
    const seeds = readSeeds();
    seeds[deckId] = seed;
    window.localStorage.setItem(SEEDS_KEY, JSON.stringify(seeds));
  } catch {
    // Local storage can be unavailable; the room state still works.
  }
}
