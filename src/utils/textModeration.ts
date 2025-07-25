const offensiveWords = [
  'con', 'connard', 'connasse', 'salope', 'pute', 'putain',
  'merde', 'enculé', 'bâtard', 'nique', 'ta race', 'fdp',
  // English
  'fuck', 'shit', 'bitch', 'asshole', 'cunt',
];

const violentWords = [
  'tuer', 'massacre', 'suicide', 'bombe', 'meurtre', 'poignarder', 'frapper',
  // English
  'kill', 'murder', 'bomb', 'attack', 'shoot',
];

const sexualWords = [
  'sexe', 'porn', 'xxx', 'nu', 'nue',
  // English
  'sex', 'porn', 'naked',
];

// Regex for personal info
const phoneRegex = /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
const addressRegex = /(\d{1,5}\s+[\w\s]{1,}\s+(rue|avenue|boulevard|chemin|impasse))/gi;
const ageRegex = /(j'ai.*ans|âge|date de naissance|né le)/gi;

const buildRegex = (words: string[]) => new RegExp(`\\b(${words.join('|')})\\b`, 'gi');

const offensiveRegex = buildRegex(offensiveWords);
const violentRegex = buildRegex(violentWords);
const sexualRegex = buildRegex(sexualWords);

export const isTextInappropriate = (text: string): boolean => {
  if (offensiveRegex.test(text)) return true;
  if (violentRegex.test(text)) return true;
  if (sexualRegex.test(text)) return true;
  if (phoneRegex.test(text)) return true;
  if (emailRegex.test(text)) return true;
  if (addressRegex.test(text)) return true;
  if (ageRegex.test(text)) return true;
  return false;
}; 