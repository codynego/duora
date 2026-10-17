import { GameQuestion } from '../../../shared/types.js';

export const QUESTIONS_DATABASE: GameQuestion[] = [
  // --- THIS OR THAT (Banter & Vibe) ---
  {
    id: 'tot-1',
    gameType: 'this-or-that',
    prompt: 'Ideal first date energy:',
    intensityLevel: 1,
    stage: ['single', 'talking'],
    options: [
      { id: 'a', label: 'Cozy coffee shop & deep conversation', emoji: '☕' },
      { id: 'b', label: 'Cocktails, rooftop & loud music', emoji: '🍸' }
    ]
  },
  {
    id: 'tot-2',
    gameType: 'this-or-that',
    prompt: 'Who should pay on the first date?',
    intensityLevel: 1,
    stage: ['single', 'talking'],
    options: [
      { id: 'a', label: 'Whoever asked the other out', emoji: '💳' },
      { id: 'b', label: 'Strict 50/50 split', emoji: '🤝' },
      { id: 'c', label: 'The guy should handle it chivalrously', emoji: '🌹' }
    ]
  },
  {
    id: 'tot-3',
    gameType: 'this-or-that',
    prompt: 'Texting behavior in the talking stage:',
    intensityLevel: 1,
    stage: ['single', 'talking'],
    options: [
      { id: 'a', label: 'Rapid replies within 5 minutes', emoji: '⚡' },
      { id: 'b', label: 'Busy all day, thoughtful 10pm voice note', emoji: '🎙️' }
    ]
  },
  {
    id: 'tot-4',
    gameType: 'this-or-that',
    prompt: 'Handling disagreement:',
    intensityLevel: 2,
    stage: ['talking', 'together'],
    options: [
      { id: 'a', label: 'Talk it out immediately, do not sleep angry', emoji: '🗣️' },
      { id: 'b', label: 'Cool down alone for 2 hours before discussing', emoji: '🧘' }
    ]
  },
  {
    id: 'tot-5',
    gameType: 'this-or-that',
    prompt: 'Spontaneous getaway or Planned luxury vacation?',
    intensityLevel: 2,
    stage: ['talking', 'together'],
    options: [
      { id: 'a', label: 'Road trip packed in 30 minutes, no itinerary', emoji: '🚗' },
      { id: 'b', label: 'Resort booked 3 months in advance with daily schedule', emoji: '🏖️' }
    ]
  },
  {
    id: 'tot-6',
    gameType: 'this-or-that',
    prompt: 'Sharing phone passcodes with your partner:',
    intensityLevel: 2,
    stage: ['talking', 'together'],
    options: [
      { id: 'a', label: 'Open book: we know each other’s codes', emoji: '🔓' },
      { id: 'b', label: 'Healthy boundary: private space is healthy', emoji: '🔒' }
    ]
  },
  {
    id: 'tot-7',
    gameType: 'this-or-that',
    prompt: 'Late night craving move:',
    intensityLevel: 1,
    stage: ['single', 'talking', 'together'],
    options: [
      { id: 'a', label: 'Ordering spicy suya & cold soda at 1am', emoji: '🥩' },
      { id: 'b', label: 'Sweet ice cream tub in bed bingeing Netflix', emoji: '🍦' }
    ]
  },

  // --- PREDICT ME (Psychological & Fun) ---
  {
    id: 'pred-1',
    gameType: 'predict-me',
    prompt: 'What is my secret biggest pet peeve on a date?',
    predictPrompt: 'What do you think is their biggest pet peeve?',
    intensityLevel: 1,
    stage: ['single', 'talking', 'together'],
    options: [
      { id: 'a', label: 'Checking phone during conversation', emoji: '📱' },
      { id: 'b', label: 'Being rude to the waiter/server', emoji: '😒' },
      { id: 'c', label: 'Arriving 45 minutes late without a text', emoji: '⏳' },
      { id: 'd', label: 'Bragging about exes or money', emoji: '💸' }
    ]
  },
  {
    id: 'pred-2',
    gameType: 'predict-me',
    prompt: 'My ultimate love language is:',
    predictPrompt: 'Guess their primary love language:',
    intensityLevel: 2,
    stage: ['talking', 'together'],
    options: [
      { id: 'a', label: 'Words of Affirmation & random sweet texts', emoji: '💬' },
      { id: 'b', label: 'Quality Time & undivided attention', emoji: '⏳' },
      { id: 'c', label: 'Physical Touch & cuddles', emoji: '🫂' },
      { id: 'd', label: 'Acts of Service (bringing food, solving problems)', emoji: '🍳' },
      { id: 'e', label: 'Thoughtful unexpected gifts', emoji: '🎁' }
    ]
  },
  {
    id: 'pred-3',
    gameType: 'predict-me',
    prompt: 'If I won $100,000 tomorrow, my first move:',
    predictPrompt: 'What would they do first with $100,000?',
    intensityLevel: 1,
    stage: ['single', 'talking', 'together'],
    options: [
      { id: 'a', label: 'Book a luxury first-class world tour', emoji: '✈️' },
      { id: 'b', label: 'Quietly invest 90% and act broke', emoji: '📈' },
      { id: 'c', label: 'Buy dream car/designer shopping spree', emoji: '🏎️' },
      { id: 'd', label: 'Throw an unforgettable party for friends', emoji: '🎉' }
    ]
  },
  {
    id: 'pred-4',
    gameType: 'predict-me',
    prompt: 'In a heated movie theater or long flight, I am:',
    predictPrompt: 'How do they behave in a movie or long flight?',
    intensityLevel: 1,
    stage: ['talking', 'together'],
    options: [
      { id: 'a', label: 'Sound asleep before takeoff / opening credits', emoji: '😴' },
      { id: 'b', label: 'Whispering running commentary and theories', emoji: '🍿' },
      { id: 'c', label: 'Laser-focused, do not disturb me', emoji: '🤫' }
    ]
  },

  // --- TRUTH OR DARE (Escalating Romance / Banter) ---
  {
    id: 'tod-1',
    gameType: 'truth-or-dare',
    prompt: 'Truth: What was your very first impression when you saw me or my profile?',
    intensityLevel: 1,
    stage: ['single', 'talking', 'together'],
    options: [
      { id: 'a', label: 'Instant attraction / curious about you', emoji: '👀' },
      { id: 'b', label: 'Thought you looked intimidating or mysterious', emoji: '😎' },
      { id: 'c', label: 'Loved your style and smile', emoji: '✨' },
      { id: 'd', label: 'I was skeptical until we started talking', emoji: '🤔' }
    ]
  },
  {
    id: 'tod-2',
    gameType: 'truth-or-dare',
    prompt: 'Dare: Send a 10-second voice note singing the chorus of your favorite romantic song right now.',
    intensityLevel: 2,
    stage: ['single', 'talking', 'together'],
    options: [
      { id: 'a', label: 'Challenge Accepted! (Recording...)', emoji: '🎤' },
      { id: 'b', label: 'I forfeit! I take a penalty truth question', emoji: '🏳️' }
    ]
  },
  {
    id: 'tod-3',
    gameType: 'truth-or-dare',
    prompt: 'Truth: What is one secret flirty green flag that makes you instantly attracted to someone?',
    intensityLevel: 2,
    stage: ['single', 'talking', 'together'],
    options: [
      { id: 'a', label: 'Smelling incredibly good (niche fragrance)', emoji: '🌸' },
      { id: 'b', label: 'Effortless witty humor and playful teasing', emoji: '😏' },
      { id: 'c', label: 'Clear emotional maturity & active listening', emoji: '🧠' },
      { id: 'd', label: 'Confidence without arrogance', emoji: '🔥' }
    ]
  },

  // --- CHOOSE YOUR MOVE (Flirting & Dating Scenarios) ---
  {
    id: 'cym-1',
    gameType: 'choose-your-move',
    prompt: 'Scenario: We are at a crowded lounge and eye contact locks across the room. What is your move?',
    intensityLevel: 1,
    stage: ['single', 'talking'],
    options: [
      { id: 'a', label: 'Smile, raise my glass, and wait for you to approach', emoji: '🥂' },
      { id: 'b', label: 'Walk directly over and say a bold witty icebreaker', emoji: '🚶' },
      { id: 'c', label: 'Send a drink to your table via the bartender with a napkin note', emoji: '🍸' },
      { id: 'd', label: 'Get nervous, look away quickly, then look back 3 seconds later', emoji: '🙈' }
    ]
  },
  {
    id: 'cym-2',
    gameType: 'choose-your-move',
    prompt: 'Scenario: The date went amazingly well. It’s 11:30 PM outside their place. What is the parting move?',
    intensityLevel: 2,
    stage: ['single', 'talking'],
    options: [
      { id: 'a', label: 'Warm hug + "Text me when you are inside"', emoji: '🫂' },
      { id: 'b', label: 'Slow romantic kiss on the cheek / lips', emoji: '💋' },
      { id: 'c', label: 'Suggest grabbing one quick dessert/nightcap upstairs', emoji: '🌙' },
      { id: 'd', label: 'Playful banter: "Admit it, you had the time of your life"', emoji: '😉' }
    ]
  }
];

export function getQuestionsForGame(gameType: string, stage: string, limit = 5): GameQuestion[] {
  const filtered = QUESTIONS_DATABASE.filter(q => {
    const matchesType = q.gameType === gameType;
    const matchesStage = !q.stage || q.stage.includes(stage as any);
    return matchesType && matchesStage;
  });

  // If specific filter returned too few, fallback to any for that gameType
  const pool = filtered.length >= limit ? filtered : QUESTIONS_DATABASE.filter(q => q.gameType === gameType);

  // Shuffle array
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}
