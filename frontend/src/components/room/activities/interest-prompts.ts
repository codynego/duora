const PROMPTS: Record<string, string[]> = {
  'food & places': [
    'What is a meal you would travel back to eat again, and what made it memorable?',
    'What place in your city would you confidently recommend to a visitor?',
    'What food do you think is better when shared than eaten alone?',
    'What is one small food ritual that makes an ordinary day better?',
  ],
  music: [
    'What song can change your mood in under a minute?',
    'What artist or album feels tied to a very specific season of your life?',
    'What is a song you would play to introduce someone to your taste?',
    'What kind of music makes a space instantly feel more like you?',
  ],
  'film & tv': [
    'What film or show do you wish you could watch again for the first time?',
    'What fictional character would be the most fun to have dinner with?',
    'What is a show you think deserves far more attention?',
    'What is one scene from a film or series that has stayed with you?',
  ],
  books: [
    'What book changed how you see something, even in a small way?',
    'What kind of story can always pull you in?',
    'What book would you happily lend to someone you just met?',
    'What fictional world would you visit for one ordinary day?',
  ],
  'creative things': [
    'What is something you love making even when nobody else sees it?',
    'What creative skill would you try if you had one free month?',
    'What is the last thing you made that surprised you?',
    'Where do your best ideas tend to show up?',
  ],
  fitness: [
    'What kind of movement makes you feel most like yourself?',
    'What helps you stay motivated when a routine stops being exciting?',
    'What is a physical challenge you would like to try at least once?',
    'What does a genuinely good rest day look like to you?',
  ],
  travel: [
    'What trip taught you something unexpected about yourself?',
    'Are you more excited by a detailed itinerary or a completely open day?',
    'What place would you revisit just to experience its everyday life?',
    'What is one travel moment that still feels vivid to you?',
  ],
  games: [
    'What makes a game genuinely fun even when you are losing?',
    'What game brings out a side of you people might not expect?',
    'Would you rather master one difficult game or always discover new ones?',
    'What is your ideal game-night atmosphere?',
  ],
};

export function interestPrompt(interests: string[] | undefined, index: number) {
  const tags = (interests ?? []).map((interest) => interest.toLowerCase());
  const matching = tags.flatMap((tag) => PROMPTS[tag] ?? []);
  return matching.length ? matching[index % matching.length] : null;
}
