'use client'

import { useState, useEffect, useCallback } from 'react'
import Script from 'next/script'

// Type definitions for Prism.js
declare global {
  interface Window {
    Prism: {
      highlight: (code: string, grammar: unknown, language: string) => string;
      highlightAll: () => void;
      languages: {
        javascript: unknown;
      };
    };
  }
}

export default function Home() {
  const [activeSection, setActiveSection] = useState('study')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [timer, setTimer] = useState(300) // 5 minutes for timed challenge
  const [isTimedChallengeActive, setIsTimedChallengeActive] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [liveCodeInput, setLiveCodeInput] = useState('')
  const [liveCodeResult, setLiveCodeResult] = useState<Array<{
    testCase: string;
    input: string;
    expected: string | number | boolean | object;
    actual: string | number | boolean | object;
    passed: boolean;
    description: string;
    error?: string;
  }> | null>(null)
  const [currentLiveChallenge, setCurrentLiveChallenge] = useState(0)
  const [shuffledQuestions, setShuffledQuestions] = useState<Array<typeof practiceQuestions[0]>>([])

  // Initialize shuffled questions on component mount
  useEffect(() => {
    shuffleQuestions()
  }, [])

  // Initialize Prism.js syntax highlighting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Wait for Prism to load
      const initPrism = () => {
        if (window.Prism) {
          window.Prism.highlightAll()
        } else {
          setTimeout(initPrism, 100)
        }
      }
      initPrism()
    }
  }, [])

  // Re-highlight code when active section changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Prism) {
      setTimeout(() => {
        window.Prism.highlightAll()
      }, 100)
    }
  }, [activeSection])

  const sections = [
    { id: 'study', label: '📚 Study Guide', icon: '📚' },
    { id: 'practice', label: '🧪 Practice Tests', icon: '🧪' },
    { id: 'live', label: '💻 Live Coding', icon: '💻' },
    { id: 'timed', label: '⏱️ Timed Challenge', icon: '⏱️' },
    { id: 'review', label: '📖 Code Review', icon: '📖' },
    { id: 'source', label: '🔍 Source Code', icon: '🔍' }
  ]

  // Enhanced Practice Test Questions with Hints - Based on Complete Source Code
  const practiceQuestions = [
    {
      question: "What is the correct vector representation for the Ace of Spades?",
      options: [
        "[14, 'S']",
        "[1, 'S']", 
        "['A', 'S']",
        "[13, 'S']"
      ],
      correct: 0,
      explanation: "Aces are represented as value 14 in card games, and 'S' represents Spades.",
      hint: "Think about the ranking system - Aces are the highest value in poker. What number represents the highest rank?",
      fullFunction: `// From CardGameAnalyzer.createDeck()
createDeck() {
  const suits = ['S', 'H', 'D', 'C'];
  const values = [2,3,4,5,6,7,8,9,10,11,12,13,14];
  return suits.flatMap(suit => values.map(value => [value, suit]));
}`
    },
    {
      question: "How do you extract all card values from a hand array?",
      options: [
        "hand.filter(card => card[0])",
        "hand.map(card => card[0])",
        "hand.reduce((acc, card) => acc + card[0], 0)",
        "hand.forEach(card => card[0])"
      ],
      correct: 1,
      explanation: "Array.map() is used to transform each card to its value (card[0]).",
      hint: "You want to transform each element in the array, not filter or reduce. Which method creates a new array with transformed values?",
      fullFunction: `// From CardGameAnalyzer.evaluateHand()
evaluateHand(hand) {
  if (!hand || hand.length !== 5) return [this.HAND_RANKS.HIGH_CARD];
  
  const values = hand.map(card => card[0]).sort((a, b) => b - a);
  const suits = hand.map(card => card[1]);
  
  // ... rest of evaluation logic
}`
    },
    {
      question: "What does a flush mean in poker?",
      options: [
        "All cards have the same value",
        "All cards have the same suit",
        "Cards form a consecutive sequence",
        "Three cards of the same value"
      ],
      correct: 1,
      explanation: "A flush means all 5 cards have the same suit.",
      hint: "Think about the word 'flush' - it's about uniformity. What aspect of the cards needs to be uniform?",
      fullFunction: `// From CardGameAnalyzer.evaluateHand()
evaluateHand(hand) {
  // ... validation and setup ...
  
  const isFlush = Object.keys(suitCounts).length === 1;
  const isStraight = this.isStraight(values);
  
  // Check for flush
  if (isFlush) {
    return [this.HAND_RANKS.FLUSH, ...values];
  }
}`
    },
    {
      question: "Which hand ranking is highest?",
      options: [
        "Three of a Kind",
        "Straight",
        "Flush", 
        "Full House"
      ],
      correct: 3,
      explanation: "Full House (3 of a kind + 2 of a kind) beats Flush, Straight, and Three of a Kind.",
      hint: "Remember the ranking: Royal Flush > Straight Flush > Four of a Kind > Full House > Flush > Straight > Three of a Kind > Two Pair > Pair > High Card"
    },
    {
      question: "How do you check if a hand is a straight?",
      options: [
        "Check if all suits are different",
        "Check if values are consecutive",
        "Check if there are no pairs",
        "Check if all values are the same"
      ],
      correct: 1,
      explanation: "A straight requires 5 consecutive card values (e.g., 5,6,7,8,9).",
      hint: "A straight is about sequence, not suits. What mathematical relationship should exist between consecutive card values?"
    },
    {
      question: "What's the time complexity of finding the best 5-card hand from 7 cards?",
      options: [
        "O(1)",
        "O(n)",
        "O(n²)",
        "O(n⁵)"
      ],
      correct: 3,
      explanation: "We need to check all combinations of 5 cards from 7, which is C(7,5) = 21 combinations.",
      hint: "Think about combinations - you're selecting 5 cards from 7. What's the mathematical formula for combinations?"
    },
    {
      question: "How do you shuffle a deck of cards?",
      options: [
        "Use Math.random() on each card",
        "Use Fisher-Yates shuffle algorithm",
        "Sort cards randomly",
        "Reverse the deck order"
      ],
      correct: 1,
      explanation: "Fisher-Yates shuffle provides unbiased random shuffling with O(n) complexity.",
      hint: "You need an algorithm that ensures each permutation is equally likely. Which algorithm is the standard for unbiased shuffling?"
    },
    {
      question: "What's the purpose of kicker cards in poker?",
      options: [
        "To determine suit ranking",
        "To break ties between equal hands",
        "To calculate pot odds",
        "To determine betting order"
      ],
      correct: 1,
      explanation: "Kicker cards break ties when two hands have the same ranking.",
      hint: "When two players have the same hand type (e.g., both have a pair of Aces), what determines the winner?"
    },
    {
      question: "How do you represent a royal flush?",
      options: [
        "[10, 11, 12, 13, 14] with same suit",
        "[1, 2, 3, 4, 5] with same suit",
        "[2, 3, 4, 5, 6] with same suit",
        "[7, 8, 9, 10, 11] with same suit"
      ],
      correct: 0,
      explanation: "Royal flush is A, K, Q, J, 10 of the same suit (values 14, 13, 12, 11, 10).",
      hint: "Royal flush is the highest hand. What are the highest 5 consecutive values in poker, and what must be true about their suits?"
    },
    {
      question: "What's the best way to compare two poker hands?",
      options: [
        "Compare total card values",
        "Compare highest card only",
        "Use a ranking system with kickers",
        "Compare suit values"
      ],
      correct: 2,
      explanation: "Hands are ranked by type first, then by high card, then by kickers for ties.",
      hint: "Poker has a hierarchical ranking system. What do you compare first - the type of hand, or the individual card values?"
    },
    {
      question: "How do you handle Ace-low straight (A,2,3,4,5)?",
      options: [
        "Treat Ace as value 1",
        "Ignore Ace-low straights",
        "Check for both Ace-high and Ace-low",
        "Convert Ace to value 0"
      ],
      correct: 2,
      explanation: "Ace-low straight (A,2,3,4,5) is valid and should be detected alongside regular straights.",
      hint: "Ace is special - it can be both the highest card (14) and the lowest card (1). What sequence would make A,2,3,4,5 a valid straight?"
    },
    {
      question: "What's the correct way to group cards by suit?",
      options: [
        "Use filter() multiple times",
        "Use reduce() to build an object",
        "Use map() with index",
        "Use forEach() with push"
      ],
      correct: 1,
      explanation: "reduce() is perfect for building an object where suits are keys and arrays of values are values.",
      hint: "You want to create an object where each suit is a key. Which array method is designed for building a single result from an array?"
    },
    {
      question: "How do you generate all combinations of r elements from an array?",
      options: [
        "Use nested loops",
        "Use recursive approach",
        "Use built-in combination function",
        "Use permutation and filter"
      ],
      correct: 1,
      explanation: "Recursive approach is cleanest: for each element, combine it with all combinations of remaining elements.",
      hint: "Think about the mathematical concept - for each element, you either include it or don't. Which programming paradigm handles this naturally?"
    },
    {
      question: "What's the return format for hand evaluation?",
      options: [
        "String description",
        "Object with properties",
        "Array with ranking and values",
        "Number representing strength"
      ],
      correct: 2,
      explanation: "Return [handType, primaryValue, ...kickers] for easy comparison and tie-breaking.",
      hint: "You need to compare hands easily. What data structure allows you to compare elements in order?"
    },
    {
      question: "How do you validate input in hand evaluation?",
      options: [
        "Assume input is always valid",
        "Check hand length and card format",
        "Only check for null/undefined",
        "Validate after processing"
      ],
      correct: 1,
      explanation: "Always validate input first: check hand length is 5, each card has [value, suit] format.",
      hint: "Defensive programming - what should you check before processing any data? Think about the basic requirements for a poker hand."
    },
    
    // NEW: Advanced Array Manipulation Questions
    {
      question: "Complete this code to find the second highest value: const values = [14, 13, 12, 11, 10]; const secondHighest = ___;",
      options: [
        "values.sort((a,b) => b-a)[1]",
        "values.sort((a,b) => a-b)[values.length-2]",
        "Math.max(...values.filter(v => v !== Math.max(...values)))",
        "values.reduce((max, val) => val > max ? val : max, 0)"
      ],
      correct: 0,
      explanation: "Sort in descending order (b-a) and take the second element [1]. This is the most readable and efficient approach.",
      hint: "Sort the array in descending order and pick the second element.",
      fullFunction: `function findSecondHighest(hand) {
  const values = hand.map(card => card[0]);
  const secondHighest = values.sort((a,b) => b-a)[1];
  return secondHighest;
}`
    },
    {
      question: "Fill in the blank to check if all values are even: const values = [2, 4, 6, 8, 10]; const allEven = values.___(val => val % 2 === 0);",
      options: [
        "every",
        "some",
        "filter",
        "reduce"
      ],
      correct: 0,
      explanation: "every() returns true only if ALL elements pass the test. some() would return true if ANY element passes.",
      hint: "You want to check if ALL elements meet a condition, not just some.",
      fullFunction: `function checkAllEven(hand) {
  const values = hand.map(card => card[0]);
  const allEven = values.every(val => val % 2 === 0);
  return allEven;
}`
    },
    {
      question: "Complete this code to find the most frequent value: const values = [14, 14, 13, 13, 13]; const mostFrequent = ___;",
      options: [
        "values.sort((a,b) => values.filter(v => v === a).length - values.filter(v => v === b).length)[0]",
        "Object.entries(values.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {})).sort((a,b) => b[1] - a[1])[0][0]",
        "values.find(val => values.filter(v => v === val).length === Math.max(...values.map(v => values.filter(x => x === v).length)))",
        "values.reduce((max, val) => values.filter(v => v === val).length > values.filter(v => v === max).length ? val : max)"
      ],
      correct: 1,
      explanation: "Use reduce to count occurrences, then Object.entries to convert to array, sort by count, and take the first value. This is the most efficient approach.",
      hint: "Count occurrences first, then find the one with the highest count.",
      fullFunction: `function findMostFrequent(hand) {
  const values = hand.map(card => card[0]);
  const mostFrequent = Object.entries(values.reduce((acc, val) => { 
    acc[val] = (acc[val] || 0) + 1; 
    return acc; 
  }, {})).sort((a,b) => b[1] - a[1])[0][0];
  return mostFrequent;
}`
    },
    {
      question: "What's the missing code to check for consecutive values? const values = [10, 11, 12, 13, 14]; const isConsecutive = values.sort((a,b) => a-b).___((val, i) => i === 0 || val === values[i-1] + 1);",
      options: [
        "every",
        "some",
        "filter",
        "map"
      ],
      correct: 0,
      explanation: "every() checks if ALL elements pass the test. For consecutive values, each element (except first) should equal the previous + 1.",
      hint: "You need to verify that EVERY element meets the consecutive condition.",
      fullFunction: `function checkConsecutive(hand) {
  const values = hand.map(card => card[0]);
  const isConsecutive = values.sort((a,b) => a-b).every((val, i) => 
    i === 0 || val === values[i-1] + 1
  );
  return isConsecutive;
}`
    },
    {
      question: "Complete this code to find pairs: const values = [14, 14, 13, 13, 12]; const pairs = values.reduce((acc, val) => { if (values.filter(v => v === val).length === 2) acc.push(val); return acc; }, []); const uniquePairs = ___;",
      options: [
        "pairs",
        "pairs.filter((val, i) => pairs.indexOf(val) === i)",
        "new Set(pairs)",
        "[...new Set(pairs)]"
      ],
      correct: 3,
      explanation: "new Set(pairs) creates a Set of unique values, then spread it back to an array. This removes duplicates efficiently.",
      hint: "You need to remove duplicates from the pairs array.",
      fullFunction: `function findPairs(hand) {
  const values = hand.map(card => card[0]);
  const pairs = values.reduce((acc, val) => { 
    if (values.filter(v => v === val).length === 2) acc.push(val); 
    return acc; 
  }, []);
  const uniquePairs = [...new Set(pairs)];
  return uniquePairs;
}`
    },
    {
      question: "Fill in the blank to rotate array left by 1: const values = [14, 13, 12, 11, 10]; const rotated = [values[1], values[2], values[3], values[4], ___];",
      options: [
        "values[0]",
        "values[5]",
        "values[values.length-1]",
        "values[values.length]"
      ],
      correct: 0,
      explanation: "Rotating left by 1 means the first element becomes the last. So values[0] goes at the end.",
      hint: "In a left rotation, where does the first element end up?",
      fullFunction: `function rotateArrayLeft(hand) {
  const values = hand.map(card => card[0]);
  const rotated = [values[1], values[2], values[3], values[4], values[0]];
  return rotated;
}`
    },
    {
      question: "Complete this code to find the median value: const values = [10, 11, 12, 13, 14]; const median = values.length % 2 === 0 ? ___ : values[Math.floor(values.length/2)];",
      options: [
        "(values[values.length/2] + values[values.length/2 - 1]) / 2",
        "values[values.length/2]",
        "values[Math.floor(values.length/2)]",
        "values[values.length/2 - 1]"
      ],
      correct: 0,
      explanation: "For even-length arrays, median is the average of the two middle values. For odd-length, it's the middle value.",
      hint: "When the array length is even, you need the average of two middle values.",
      fullFunction: `function findMedian(hand) {
  const values = hand.map(card => card[0]);
  const median = values.length % 2 === 0 ? 
    (values[values.length/2] + values[values.length/2 - 1]) / 2 : 
    values[Math.floor(values.length/2)];
  return median;
}`
    },
    {
      question: "What's the missing code to check for three of a kind? const values = [14, 14, 14, 13, 12]; const hasThreeOfAKind = values.___(val => values.filter(v => v === val).length === 3);",
      options: [
        "every",
        "some",
        "filter",
        "find"
      ],
      correct: 1,
      explanation: "some() returns true if ANY element passes the test. We only need one value to appear three times.",
      hint: "You only need to find ONE value that appears three times, not check all values.",
      fullFunction: `function checkThreeOfAKind(hand) {
  const values = hand.map(card => card[0]);
  const hasThreeOfAKind = values.some(val => values.filter(v => v === val).length === 3);
  return hasThreeOfAKind;
}`
    },
    {
      question: "Complete this code to reverse the array: const values = [14, 13, 12, 11, 10]; const reversed = values.___;",
      options: [
        "reverse()",
        "slice().reverse()",
        "map((val, i) => values[values.length - 1 - i])",
        "reduce((acc, val) => [val, ...acc], [])"
      ],
      correct: 1,
      explanation: "slice().reverse() creates a copy first, then reverses it. reverse() mutates the original array, which is usually not desired.",
      hint: "reverse() mutates the original array. How can you avoid that?",
      fullFunction: `function reverseArray(hand) {
  const values = hand.map(card => card[0]);
  const reversed = values.slice().reverse();
  return reversed;
}`
    },
    {
      question: "Fill in the blank to find the longest sequence of consecutive values: const values = [10, 11, 12, 15, 16, 17]; let maxLength = 1, currentLength = 1; for (let i = 1; i < values.length; i++) { if (values[i] === values[i-1] + 1) { currentLength++; maxLength = Math.max(maxLength, currentLength); } else { ___; } }",
      options: [
        "currentLength = 1",
        "currentLength = 0",
        "currentLength++",
        "maxLength = currentLength"
      ],
      correct: 0,
      explanation: "When we break the consecutive sequence, we reset currentLength to 1 (the current element starts a new sequence).",
      hint: "When the sequence breaks, you need to start counting a new sequence from 1."
    },
    {
      question: "Complete this code to check for a full house: const values = [14, 14, 13, 13, 13]; const counts = values.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {}); const hasFullHouse = ___;",
      options: [
        "Object.values(counts).includes(2) && Object.values(counts).includes(3)",
        "Object.values(counts).filter(count => count === 2 || count === 3).length === 2",
        "Object.values(counts).some(count => count === 2) && Object.values(counts).some(count => count === 3)",
        "Object.values(counts).every(count => count === 2 || count === 3)"
      ],
      correct: 0,
      explanation: "A full house has exactly one value appearing twice and one value appearing three times. This checks for both conditions.",
      hint: "A full house needs exactly one pair (2) and one three of a kind (3).",
      fullFunction: `function checkFullHouse(hand) {
  const values = hand.map(card => card[0]);
  const counts = values.reduce((acc, val) => { 
    acc[val] = (acc[val] || 0) + 1; 
    return acc; 
  }, {});
  const hasFullHouse = Object.values(counts).includes(2) && Object.values(counts).includes(3);
  return hasFullHouse;
}`
    },
    {
      question: "What's the missing code to find the highest card not in a pair? const values = [14, 14, 13, 12, 11]; const pairValue = values.find(val => values.filter(v => v === val).length === 2); const kicker = Math.max(...values.filter(val => ___));",
      options: [
        "val !== pairValue",
        "val === pairValue",
        "val > pairValue",
        "val < pairValue"
      ],
      correct: 0,
      explanation: "The kicker is the highest card NOT in the pair. So we filter out the pair value and find the max of the remaining cards.",
      hint: "The kicker should exclude the pair value, not include it."
    },
    {
      question: "Complete this code to check for a straight flush: const suits = ['S', 'S', 'S', 'S', 'S']; const values = [10, 11, 12, 13, 14]; const isStraightFlush = ___;",
      options: [
        "new Set(suits).size === 1 && values.sort((a,b) => a-b).every((val, i) => i === 0 || val === values[i-1] + 1)",
        "suits.every(suit => suit === suits[0]) && values.every((val, i) => val === values[0] + i)",
        "suits.filter(suit => suit === suits[0]).length === 5 && values.reduce((acc, val, i) => acc && (i === 0 || val === values[i-1] + 1), true)",
        "suits[0] === suits[1] === suits[2] === suits[3] === suits[4] && values.sort((a,b) => a-b).reduce((acc, val, i) => acc && (i === 0 || val === values[i-1] + 1), true)"
      ],
      correct: 0,
      explanation: "Check if all suits are the same (Set size === 1) AND if values are consecutive (sorted and each equals previous + 1).",
      hint: "A straight flush needs both: all same suit AND consecutive values."
    },
    {
      question: "Fill in the blank to find the highest value that appears exactly once: const values = [14, 14, 13, 12, 11]; const uniqueValues = values.filter(val => values.filter(v => v === val).length === 1); const highestUnique = ___;",
      options: [
        "Math.max(...uniqueValues)",
        "uniqueValues[0]",
        "uniqueValues.sort((a,b) => b-a)[0]",
        "uniqueValues.reduce((max, val) => val > max ? val : max, 0)"
      ],
      correct: 0,
      explanation: "Math.max() with spread operator is the most efficient way to find the maximum value in an array.",
      hint: "You have an array of unique values. How do you find the maximum?",
      fullFunction: `function findHighestUnique(hand) {
  const values = hand.map(card => card[0]);
  const uniqueValues = values.filter(val => values.filter(v => v === val).length === 1);
  const highestUnique = Math.max(...uniqueValues);
  return highestUnique;
}`
    },
    {
      question: "Complete this code to check for four of a kind: const values = [14, 14, 14, 14, 13]; const hasFourOfAKind = values.___(val => values.filter(v => v === val).length === 4);",
      options: [
        "every",
        "some",
        "filter",
        "find"
      ],
      correct: 1,
      explanation: "some() returns true if ANY element passes the test. We only need one value to appear four times.",
      hint: "You only need to find ONE value that appears four times, not check all values."
    },
    {
      question: "What's the missing code to find the second highest value in a sorted array? const values = [14, 13, 12, 11, 10]; const secondHighest = values[___];",
      options: [
        "1",
        "values.length - 2",
        "Math.floor(values.length / 2)",
        "0"
      ],
      correct: 0,
      explanation: "In a descending sorted array, the second highest value is at index 1 (second element).",
      hint: "If the array is sorted from highest to lowest, where is the second highest element?",
      fullFunction: `function findSecondHighestInSorted(hand) {
  const values = hand.map(card => card[0]);
  // Assuming values are already sorted in descending order
  const secondHighest = values[1];
  return secondHighest;
}`
    },
    {
      question: "Complete this code to check for a royal flush: const suits = ['S', 'S', 'S', 'S', 'S']; const values = [10, 11, 12, 13, 14]; const isRoyalFlush = ___;",
      options: [
        "new Set(suits).size === 1 && values.sort((a,b) => a-b).join('') === '1011121314'",
        "suits.every(suit => suit === 'S') && values.every((val, i) => val === 10 + i)",
        "new Set(suits).size === 1 && values.sort((a,b) => a-b)[0] === 10 && values.sort((a,b) => a-b)[4] === 14",
        "suits[0] === suits[1] === suits[2] === suits[3] === suits[4] && values.sort((a,b) => a-b).reduce((acc, val, i) => acc && val === 10 + i, true)"
      ],
      correct: 2,
      explanation: "Check if all suits are the same AND if the lowest value is 10 and highest is 14 (after sorting).",
      hint: "A royal flush is a straight flush that starts at 10 and ends at 14 (Ace).",
      fullFunction: `function checkRoyalFlush(hand) {
  const suits = hand.map(card => card[1]);
  const values = hand.map(card => card[0]);
  const isRoyalFlush = new Set(suits).size === 1 && 
    values.sort((a,b) => a-b)[0] === 10 && 
    values.sort((a,b) => a-b)[4] === 14;
  return isRoyalFlush;
}`
    }
  ]

  // Live Coding Challenges with Jest Test Integration
  const liveCodingChallenges = [
    {
      title: "Implement isFlush Function",
      description: "Write a function that checks if a hand is a flush (all cards have the same suit)",
      starterCode: `function isFlush(hand) {
  // Your code here
  // Should return true if all cards have the same suit
  // Should return false otherwise
}`,
      testCases: [
        {
          name: "Royal Flush",
          input: "[[14,'S'], [13,'S'], [12,'S'], [11,'S'], [10,'S']]",
          expected: true,
          description: "All spades should return true"
        },
        {
          name: "Mixed Suits",
          input: "[[14,'S'], [13,'H'], [12,'S'], [11,'S'], [10,'S']]",
          expected: false,
          description: "Mixed suits should return false"
        },
        {
          name: "Empty Hand",
          input: "[]",
          expected: false,
          description: "Empty hand should return false"
        }
      ],
      solution: `function isFlush(hand) {
  if (!hand || hand.length === 0) return false;
  const suits = hand.map(card => card[1]);
  return suits.every(suit => suit === suits[0]);
}`,
      hint: "Think about how to check if all elements in an array are the same. You can use every() or check if the first suit equals all other suits."
    },
    {
      title: "Implement findHighestCard Function",
      description: "Write a function that finds the highest card value in a hand",
      starterCode: `function findHighestCard(hand) {
  // Your code here
  // Should return the highest card value
  // Should handle edge cases gracefully
}`,
      testCases: [
        {
          name: "High Cards",
          input: "[[14,'S'], [13,'H'], [12,'D'], [11,'C'], [10,'S']]",
          expected: 14,
          description: "Ace (14) should be highest"
        },
        {
          name: "Low Cards",
          input: "[[2,'S'], [3,'H'], [4,'D'], [5,'C'], [6,'S']]",
          expected: 6,
          description: "6 should be highest"
        },
        {
          name: "Single Card",
          input: "[[10,'S']]",
          expected: 10,
          description: "Single card should return its value"
        }
      ],
      solution: `function findHighestCard(hand) {
  if (!hand || hand.length === 0) return null;
  return Math.max(...hand.map(card => card[0]));
}`,
      hint: "You need to extract all card values and find the maximum. Math.max() with spread operator works well for this."
    },
    {
      title: "Implement isStraight Function",
      description: "Write a function that checks if a hand forms a straight (consecutive values)",
      starterCode: `function isStraight(hand) {
  // Your code here
  // Should return true if values are consecutive
  // Should handle Ace-low straight (A,2,3,4,5)
  // Should return false otherwise
}`,
      testCases: [
        {
          name: "Regular Straight",
          input: "[[10,'S'], [11,'H'], [12,'D'], [13,'C'], [14,'S']]",
          expected: true,
          description: "10-J-Q-K-A should be a straight"
        },
        {
          name: "Ace-Low Straight",
          input: "[[14,'S'], [2,'H'], [3,'D'], [4,'C'], [5,'S']]",
          expected: true,
          description: "A-2-3-4-5 should be a straight"
        },
        {
          name: "Not a Straight",
          input: "[[10,'S'], [11,'H'], [12,'D'], [13,'C'], [9,'S']]",
          expected: false,
          description: "9-10-J-Q-K is not consecutive"
        }
      ],
      solution: `function isStraight(hand) {
  if (!hand || hand.length !== 5) return false;
  
  const values = hand.map(card => card[0]).sort((a, b) => a - b);
  const unique = [...new Set(values)];
  
  if (unique.length !== 5) return false;
  
  // Check regular straight
  for (let i = 1; i < unique.length; i++) {
    if (unique[i] - unique[i-1] !== 1) {
      // Check Ace-low straight
      if (unique.join(',') === '2,3,4,5,14') return true;
      return false;
    }
  }
  return true;
}`,
      hint: "You need to check if values are consecutive. Sort them first, then check if each value is one more than the previous. Don't forget Ace-low straight!"
    },
    {
      title: "Implement getValueCounts Function",
      description: "Write a function that counts occurrences of each value in a hand",
      starterCode: `function getValueCounts(hand) {
  // Your code here
  // Should return an object with value counts
  // Example: {14: 2, 13: 1, 12: 1, 11: 1} for pair of Aces
}`,
      testCases: [
        {
          name: "Pair of Aces",
          input: "[[14,'S'], [14,'H'], [13,'D'], [12,'C'], [11,'S']]",
          expected: {14: 2, 13: 1, 12: 1, 11: 1},
          description: "Two Aces, one each of K, Q, J"
        },
        {
          name: "Three of a Kind",
          input: "[[14,'S'], [14,'H'], [14,'D'], [12,'C'], [11,'S']]",
          expected: {14: 3, 12: 1, 11: 1},
          description: "Three Aces, one each of Q, J"
        },
        {
          name: "All Different",
          input: "[[14,'S'], [13,'H'], [12,'D'], [11,'C'], [10,'S']]",
          expected: {14: 1, 13: 1, 12: 1, 11: 1, 10: 1},
          description: "All values should have count 1"
        }
      ],
      solution: `function getValueCounts(hand) {
  return hand.reduce((acc, card) => {
    const value = card[0];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}`,
      hint: "Use reduce() to build an object. For each card, increment the count for its value. Start with an empty object {}."
    },
    {
      title: "Implement compareHands Function",
      description: "Write a function that compares two hand scores and returns 1, -1, or 0",
      starterCode: `function compareHands(hand1Score, hand2Score) {
  // Your code here
  // Should return 1 if hand1 > hand2
  // Should return -1 if hand1 < hand2
  // Should return 0 if hands are equal
  // handScore format: [handType, primaryValue, ...kickers]
}`,
      testCases: [
        {
          name: "Flush vs Straight",
          input: "[[5, 14, 12, 10, 8, 6], [4, 14]]",
          expected: 1,
          description: "Flush (5) should beat Straight (4)"
        },
        {
          name: "Same Type, Different High Card",
          input: "[[5, 14, 12, 10, 8, 6], [5, 13, 12, 10, 8, 6]]",
          expected: 1,
          description: "Ace-high flush should beat King-high flush"
        },
        {
          name: "Equal Hands",
          input: "[[5, 14, 12, 10, 8, 6], [5, 14, 12, 10, 8, 6]]",
          expected: 0,
          description: "Identical hands should tie"
        }
      ],
      solution: `function compareHands(hand1Score, hand2Score) {
  const maxLength = Math.max(hand1Score.length, hand2Score.length);
  
  for (let i = 0; i < maxLength; i++) {
    const val1 = hand1Score[i] || 0;
    const val2 = hand2Score[i] || 0;
    
    if (val1 > val2) return 1;
    if (val1 < val2) return -1;
  }
  
  return 0;
}`,
      hint: "Compare elements at the same index. If they're equal, move to the next index. Return as soon as you find a difference."
    }
  ]

  // Timed Challenge Questions
  const timedQuestions = [
    {
      question: "Implement a function to check if a hand is a flush",
      code: `function isFlush(hand) {
  // Your code here
}`,
      testCases: [
        { input: "[[14,'S'], [13,'S'], [12,'S'], [11,'S'], [10,'S']]", expected: true },
        { input: "[[14,'S'], [13,'H'], [12,'S'], [11,'S'], [10,'S']]", expected: false }
      ],
      solution: `function isFlush(hand) {
  const suits = hand.map(card => card[1]);
  return suits.every(suit => suit === suits[0]);
}`,
      hint: "Extract all suits and check if they're all the same. Use every() method for clean comparison."
    },
    {
      question: "Write a function to find the highest card in a hand",
      code: `function findHighestCard(hand) {
  // Your code here
}`,
      testCases: [
        { input: "[[14,'S'], [13,'H'], [12,'D'], [11,'C'], [10,'S']]", expected: 14 },
        { input: "[[2,'S'], [3,'H'], [4,'D'], [5,'C'], [6,'S']]", expected: 6 }
      ],
      solution: `function findHighestCard(hand) {
  return Math.max(...hand.map(card => card[0]));
}`,
      hint: "Map to get values, then use Math.max() with spread operator to find the highest."
    }
  ]

  // Code Review Examples - Based on Actual Source Code
  const codeReviewExamples = [
    {
      title: "Complete Hand Evaluation Function",
      code: `// Core function: Evaluate a 5-card hand
evaluateHand(hand) {
  if (!hand || hand.length !== 5) return [this.HAND_RANKS.HIGH_CARD];
  
  const values = hand.map(card => card[0]).sort((a, b) => b - a);
  const suits = hand.map(card => card[1]);
  
  const valueCounts = this.getValueCounts(values);
  const suitCounts = this.getSuitCounts(suits);
  const counts = Object.values(valueCounts).sort((a, b) => b - a);
  
  const isFlush = Object.keys(suitCounts).length === 1;
  const isStraight = this.isStraight(values);
  
  // Evaluate from highest to lowest
  if (isFlush && isStraight) {
    return [this.HAND_RANKS.STRAIGHT_FLUSH, Math.max(...values)];
  }
  
  if (counts[0] === 4) {
    const fourValue = this.getValueByCount(valueCounts, 4);
    const kicker = this.getValueByCount(valueCounts, 1);
    return [this.HAND_RANKS.FOUR_OF_A_KIND, fourValue, kicker];
  }
  
  if (counts[0] === 3 && counts[1] === 2) {
    const threeValue = this.getValueByCount(valueCounts, 3);
    const pairValue = this.getValueByCount(valueCounts, 2);
    return [this.HAND_RANKS.FULL_HOUSE, threeValue, pairValue];
  }
  
  if (isFlush) {
    return [this.HAND_RANKS.FLUSH, ...values];
  }
  
  if (isStraight) {
    return [this.HAND_RANKS.STRAIGHT, Math.max(...values)];
  }
  
  if (counts[0] === 3) {
    const threeValue = this.getValueByCount(valueCounts, 3);
    const kickers = values.filter(v => v !== threeValue);
    return [this.HAND_RANKS.THREE_OF_A_KIND, threeValue, ...kickers];
  }
  
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = Object.keys(valueCounts)
      .filter(k => valueCounts[k] === 2)
      .map(Number)
      .sort((a, b) => b - a);
    const kicker = this.getValueByCount(valueCounts, 1);
    return [this.HAND_RANKS.TWO_PAIR, pairs[0], pairs[1], kicker];
  }
  
  if (counts[0] === 2) {
    const pairValue = this.getValueByCount(valueCounts, 2);
    const kickers = values.filter(v => v !== pairValue);
    return [this.HAND_RANKS.PAIR, pairValue, ...kickers];
  }
  
  return [this.HAND_RANKS.HIGH_CARD, ...values];
}`,
      issues: [
        "This is actually the CORRECT implementation from the source code",
        "No issues found - this is production-ready code",
        "Comprehensive hand evaluation covering all poker hand types",
        "Proper validation, error handling, and efficient algorithms"
      ],
      improvements: [
        "This code is already optimal and follows best practices",
        "Consider adding JSDoc comments for better documentation",
        "Could add performance metrics for large-scale operations",
        "Already handles edge cases like Ace-low straights correctly"
      ]
    },
    {
      title: "Hand Comparison Function",
      code: `// Compare two hand scores
compareHands(hand1Score, hand2Score) {
  const maxLength = Math.max(hand1Score.length, hand2Score.length);
  for (let i = 0; i < maxLength; i++) {
    const val1 = hand1Score[i] || 0;
    const val2 = hand2Score[i] || 0;
    if (val1 > val2) return 1;
    if (val1 < val2) return -1;
  }
  return 0;
}`,
      issues: [
        "This is the CORRECT implementation from the source code",
        "No issues found - this is production-ready code",
        "Proper comparison logic for poker hand rankings",
        "Handles tie-breaking correctly with kicker cards"
      ],
      improvements: [
        "This code is already optimal and follows best practices",
        "Could add input validation for edge cases",
        "Consider adding performance optimization for large tournaments",
        "Already handles all comparison scenarios correctly"
      ]
    }
  ]

  // Functions
  const handleAnswer = (selectedOption: number) => {
    setSelectedAnswer(selectedOption)
    setShowAnswer(true)
    
    const question = shuffledQuestions[currentQuestion]
    if (selectedOption === question.correct) {
      setScore(score + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowAnswer(false)
      setSelectedAnswer(null)
      setShowHint(false)
    } else {
      setShowResults(true)
    }
  }

  const shuffleQuestions = useCallback(() => {
    const shuffled = [...practiceQuestions]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setShuffledQuestions(shuffled)
  }, [])

  // Prism.js syntax highlighting function
  const highlightCode = (code: string) => {
    if (!code) return ''
    
    try {
      // Use Prism.js for professional syntax highlighting
      if (typeof window !== 'undefined' && window.Prism) {
        return window.Prism.highlight(code, window.Prism.languages.javascript, 'javascript')
      }
      return code // Fallback if Prism not loaded
    } catch (error) {
      console.error('Prism highlighting error:', error)
      return code // Fallback to original code if highlighting fails
    }
  }

  const resetPracticeTest = () => {
    shuffleQuestions()
    setCurrentQuestion(0)
    setScore(0)
    setShowResults(false)
    setShowHint(false)
    setShowAnswer(false)
    setSelectedAnswer(null)
  }

  const startTimedChallenge = () => {
    setIsTimedChallengeActive(true)
    setTimer(300)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Live coding challenge functions
  const runLiveCodeTest = (challengeIndex: number, userCode: string) => {
    const challenge = liveCodingChallenges[challengeIndex]
    const results: Array<{
      testCase: string;
      input: string;
      expected: string | number | boolean | object;
      actual: string | number | boolean | object;
      passed: boolean;
      description: string;
      error?: string;
    }> = []
    
    try {
      // Create a function from user code
      const func = new Function('hand', userCode + '\nreturn isFlush(hand)')
      
      // Test each test case
      challenge.testCases.forEach((testCase) => {
        try {
          const input = JSON.parse(testCase.input)
          const result = func(input)
          const passed = result === testCase.expected
          
          results.push({
            testCase: testCase.name,
            input: testCase.input,
            expected: testCase.expected,
            actual: result,
            passed,
            description: testCase.description
          })
        } catch (error) {
          results.push({
            testCase: testCase.name,
            input: testCase.input,
            expected: testCase.expected,
            actual: 'Error',
            passed: false,
            description: testCase.description,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      })
      
      setLiveCodeResult(results)
    } catch (error) {
      setLiveCodeResult([{
        testCase: 'Syntax Error',
        input: 'N/A',
        expected: 'N/A',
        actual: 'Error',
        passed: false,
        description: 'Code has syntax errors',
        error: error instanceof Error ? error.message : String(error)
      }])
    }
  }

  const getHint = () => {
    setShowHint(true)
  }

  const nextLiveChallenge = () => {
    if (currentLiveChallenge < liveCodingChallenges.length - 1) {
      setCurrentLiveChallenge(currentLiveChallenge + 1)
      setLiveCodeInput('')
      setLiveCodeResult(null)
      setShowHint(false)
    }
  }

  const prevLiveChallenge = () => {
    if (currentLiveChallenge > 0) {
      setCurrentLiveChallenge(currentLiveChallenge - 1)
      setLiveCodeInput('')
      setLiveCodeResult(null)
      setShowHint(false)
    }
  }

  return (
    <>
      {/* Load Prism.js for syntax highlighting */}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js" strategy="beforeInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-clike.min.js" strategy="beforeInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js" strategy="beforeInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js" strategy="beforeInteractive" />
      
      <div className="app-container">
        <header className="app-header">
          <h1>🎯 Card Game Interview Study Guide</h1>
          <p>Master in 24 Hours, Execute in 10 Minutes</p>
        </header>

      <nav className="app-nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.icon} {section.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {/* Study Guide Section */}
        {activeSection === 'study' && (
          <section id="study" className="content-section active">
            <div className="section-header">
              <h2>📚 Complete Study Guide</h2>
              <p>Master all concepts, algorithms, and patterns</p>
            </div>
            
            <div className="study-content">
              <div className="concept-card">
                <h3>🎴 Card Representation Patterns</h3>
                <div className="code-block">
                  <div className="code-header">Standard Card Representations</div>
                  <pre><code className="language-javascript">{`// Standard representations you'll encounter:
 
const card1 = [14, 'S']; // [value, suit] - Ace of Spades
const card2 = {value: 14, suit: 'S'}; // Object notation
const card3 = 'AS'; // String notation (convert to vector)

// Hand as multidimensional array:
const hand = [[14,'S'], [13,'H'], [12,'D'], [11,'C'], [10,'S']];`}</code></pre>
                </div>
              </div>

              <div className="concept-card">
                <h3>🔧 Key Vector Operations</h3>
                <div className="code-block">
                  <div className="code-header">Essential Vector Manipulation</div>
                  <pre><code className="language-javascript">{`// 1. Extract values only
const values = hand.map(card => card[0]);
// [14, 13, 12, 11, 10]

// 2. Extract suits only  
const suits = hand.map(card => card[1]);
// ['S', 'H', 'D', 'C', 'S']

// 3. Group by suit (critical pattern)
const suitGroups = hand.reduce((acc, card) => {
  const suit = card[1];
  if (!acc[suit]) acc[suit] = [];
  acc[suit].push(card[0]);
  return acc;
}, {});`}</code></pre>
                </div>
              </div>

              <div className="concept-card">
                <h3>🎯 Hand Evaluation Algorithm</h3>
                <div className="code-block">
                  <div className="code-header">Core Hand Evaluation Logic (From Source Code)</div>
                  <pre><code className="language-javascript">{`// Core function: Evaluate a 5-card hand
evaluateHand(hand) {
  if (!hand || hand.length !== 5) return [this.HAND_RANKS.HIGH_CARD];
  
  const values = hand.map(card => card[0]).sort((a, b) => b - a);
  const suits = hand.map(card => card[1]);
  
  const valueCounts = this.getValueCounts(values);
  const suitCounts = this.getSuitCounts(suits);
  const counts = Object.values(valueCounts).sort((a, b) => b - a);
  
  const isFlush = Object.keys(suitCounts).length === 1;
  const isStraight = this.isStraight(values);
  
  // Evaluate from highest to lowest ranking
  if (isFlush && isStraight) return [this.HAND_RANKS.STRAIGHT_FLUSH, Math.max(...values)];
  if (counts[0] === 4) return [this.HAND_RANKS.FOUR_OF_A_KIND, this.getValueByCount(valueCounts, 4), this.getValueByCount(valueCounts, 1)];
  if (counts[0] === 3 && counts[1] === 2) return [this.HAND_RANKS.FULL_HOUSE, this.getValueByCount(valueCounts, 3), this.getValueByCount(valueCounts, 2)];
  if (isFlush) return [this.HAND_RANKS.FLUSH, ...values];
  if (isStraight) return [this.HAND_RANKS.STRAIGHT, Math.max(...values)];
  if (counts[0] === 3) return [this.HAND_RANKS.THREE_OF_A_KIND, this.getValueByCount(valueCounts, 3), ...values.filter(v => v !== this.getValueByCount(valueCounts, 3))];
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = Object.keys(valueCounts).filter(k => valueCounts[k] === 2).map(Number).sort((a, b) => b - a);
    return [this.HAND_RANKS.TWO_PAIR, pairs[0], pairs[1], this.getValueByCount(valueCounts, 1)];
  }
  if (counts[0] === 2) return [this.HAND_RANKS.PAIR, this.getValueByCount(valueCounts, 2), ...values.filter(v => v !== this.getValueByCount(valueCounts, 2))];
  return [this.HAND_RANKS.HIGH_CARD, ...values];
}`}</code></pre>
                </div>
              </div>

              <div className="concept-card">
                <h3>🔄 Combination Generation</h3>
                <div className="code-block">
                  <div className="code-header">Finding Best Hand from Multiple Cards (From Source Code)</div>
                  <pre><code className="javascript" dangerouslySetInnerHTML={{ __html: highlightCode(`// Find best possible hand from available cards
findBestHand(cards, handSize = 5) {
  if (cards.length < handSize) return null;
  
  const combinations = this.getCombinations(cards, handSize);
  let bestHand = null;
  let bestScore = [-1];
  
  for (const combo of combinations) {
    const score = this.evaluateHand(combo);
    if (this.compareHands(score, bestScore) > 0) {
      bestHand = combo;
      bestScore = score;
    }
  }
  
  return { hand: bestHand, score: bestScore };
}

// Generate all combinations of r elements from array
getCombinations(arr, r) {
  if (r === 1) return arr.map(item => [item]);
  
  const result = [];
  arr.forEach((item, i) => {
    const rest = arr.slice(i + 1);
    const combos = this.getCombinations(rest, r - 1);
    combos.forEach(combo => result.push([item, ...combo]));
  });
  return result;
}`) }}></code></pre>
                </div>
              </div>

              <div className="concept-card">
                <h3>⚖️ Hand Comparison</h3>
                <div className="code-block">
                  <div className="code-header">Comparing Two Hand Scores (From Source Code)</div>
                  <pre><code className="javascript" dangerouslySetInnerHTML={{ __html: highlightCode(`// Compare two hand scores
compareHands(hand1Score, hand2Score) {
  const maxLength = Math.max(hand1Score.length, hand2Score.length);
  for (let i = 0; i < maxLength; i++) {
    const val1 = hand1Score[i] || 0;
    const val2 = hand2Score[i] || 0;
    if (val1 > val2) return 1;
    if (val1 < val2) return -1;
  }
  return 0;
}`) }}></code></pre>
                </div>
              </div>

              <div className="concept-card">
                <h3>🎲 Utility Functions</h3>
                <div className="code-block">
                  <div className="code-header">Essential Helper Functions (From Source Code)</div>
                  <pre><code className="javascript" dangerouslySetInnerHTML={{ __html: highlightCode(`// Create standard deck
createDeck() {
  const suits = ['S', 'H', 'D', 'C'];
  const values = [2,3,4,5,6,7,8,9,10,11,12,13,14];
  return suits.flatMap(suit => values.map(value => [value, suit]));
}

// Shuffle deck using Fisher-Yates
shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Check for straight (including Ace-low)
isStraight(values) {
  const unique = [...new Set(values)].sort((a, b) => a - b);
  if (unique.length !== 5) return false;
  
  for (let i = 1; i < unique.length; i++) {
    if (unique[i] - unique[i-1] !== 1) {
      if (unique.join(',') === '2,3,4,5,14') return true; // Ace-low straight
      return false;
    }
  }
  return true;
}`) }}></code></pre>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Practice Tests Section */}
        {activeSection === 'practice' && (
          <section id="practice" className="content-section active">
            <div className="section-header">
              <h2>🧪 Practice Tests</h2>
              <p>Test your knowledge with {practiceQuestions.length} comprehensive questions</p>
            </div>

            {!showResults ? (
              <div className="practice-test">
                <div className="question-header">
                                      <h3>Question {currentQuestion + 1} of {shuffledQuestions.length}</h3>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${((currentQuestion + 1) / shuffledQuestions.length) * 100}%`}}
                    ></div>
                  </div>
                </div>

                <div className="question-content">
                  <p className="question-text">{shuffledQuestions[currentQuestion].question}</p>
                  
                  <div className="options">
                    {shuffledQuestions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        className={`option-btn ${
                          showAnswer && index === shuffledQuestions[currentQuestion].correct
                            ? 'correct'
                            : showAnswer && index === selectedAnswer && index !== shuffledQuestions[currentQuestion].correct
                            ? 'incorrect'
                            : ''
                        }`}
                        onClick={() => handleAnswer(index)}
                        disabled={showAnswer}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                        {showAnswer && index === shuffledQuestions[currentQuestion].correct && (
                          <span className="answer-indicator">✅ Correct!</span>
                        )}
                        {showAnswer && index === selectedAnswer && index !== shuffledQuestions[currentQuestion].correct && (
                          <span className="answer-indicator">❌ Your Answer</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {showAnswer && (
                    <div className="answer-feedback">
                      <div className={`feedback-header ${selectedAnswer === shuffledQuestions[currentQuestion].correct ? 'correct' : 'incorrect'}`}>
                        {selectedAnswer === shuffledQuestions[currentQuestion].correct ? (
                          <h4>🎉 Correct!</h4>
                        ) : (
                          <h4>❌ Incorrect</h4>
                        )}
                      </div>
                      
                      <div className="feedback-content">
                        <p><strong>Explanation:</strong> {shuffledQuestions[currentQuestion].explanation}</p>
                        {selectedAnswer !== shuffledQuestions[currentQuestion].correct && (
                          <p><strong>Correct Answer:</strong> {String.fromCharCode(65 + shuffledQuestions[currentQuestion].correct)}. {shuffledQuestions[currentQuestion].options[shuffledQuestions[currentQuestion].correct]}</p>
                        )}
                        
                        {shuffledQuestions[currentQuestion].fullFunction && (
                          <div className="full-function-context">
                            <h5>📋 Complete Function Context:</h5>
                            <div className="code-block">
                              <div className="code-header">Where this code snippet fits:</div>
                              <pre><code className="javascript" dangerouslySetInnerHTML={{ __html: highlightCode(shuffledQuestions[currentQuestion].fullFunction) }}></code></pre>
                            </div>
                          </div>
                        )}
                      </div>

                      <button className="next-btn" onClick={nextQuestion}>
                        {currentQuestion < shuffledQuestions.length - 1 ? 'Next Question →' : 'See Results →'}
                      </button>
                    </div>
                  )}

                  {!showAnswer && (
                    <div className="hint-section">
                      <button className="hint-btn" onClick={getHint}>
                        💡 Need a hint?
                      </button>
                      {showHint && (
                        <div className="hint-content">
                          <strong>Hint:</strong> {shuffledQuestions[currentQuestion].hint}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="results">
                <h3>🎉 Practice Test Complete!</h3>
                <p>Your Score: <strong>{score}</strong> out of <strong>{shuffledQuestions.length}</strong></p>
                <p>Percentage: <strong>{Math.round((score / shuffledQuestions.length) * 100)}%</strong></p>
                
                <div className="score-feedback">
                  {score === shuffledQuestions.length && <p>🏆 Perfect! You&apos;re ready for any interview!</p>}
                  {score >= shuffledQuestions.length * 0.8 && <p>🎯 Excellent! You have a strong foundation.</p>}
                  {score >= shuffledQuestions.length * 0.6 && <p>👍 Good work! Review the concepts you missed.</p>}
                  {score < shuffledQuestions.length * 0.6 && <p>📚 Keep studying! Focus on the fundamentals.</p>}
                </div>

                <button className="reset-btn" onClick={resetPracticeTest}>
                  🔄 Take Test Again
                </button>
              </div>
            )}
          </section>
        )}

        {/* Live Coding Section */}
        {activeSection === 'live' && (
          <section id="live" className="content-section active">
            <div className="section-header">
              <h2>💻 Live Coding Challenges</h2>
              <p>Write real code and see it run against Jest test cases</p>
            </div>

            <div className="live-coding">
              <div className="challenge-header">
                <h3>{liveCodingChallenges[currentLiveChallenge].title}</h3>
                <p>{liveCodingChallenges[currentLiveChallenge].description}</p>
              </div>

              <div className="code-editor">
                <div className="editor-header">
                  <span>Your Code:</span>
                  <button className="run-btn" onClick={() => runLiveCodeTest(currentLiveChallenge, liveCodeInput)}>
                    ▶️ Run Tests
                  </button>
                </div>
                <textarea
                  className="code-input"
                  value={liveCodeInput}
                  onChange={(e) => setLiveCodeInput(e.target.value)}
                  placeholder={liveCodingChallenges[currentLiveChallenge].starterCode}
                  rows={10}
                />
              </div>

              <div className="hint-section">
                <button className="hint-btn" onClick={getHint}>
                  💡 Need a hint?
                </button>
                {showHint && (
                  <div className="hint-content">
                    <strong>Hint:</strong> {liveCodingChallenges[currentLiveChallenge].hint}
                  </div>
                )}
              </div>

              <div className="test-results">
                {liveCodeResult && (
                  <div className="results-header">
                    <h4>Test Results:</h4>
                    {liveCodeResult.map((result, index) => (
                      <div key={index} className={`test-result ${result.passed ? 'passed' : 'failed'}`}>
                        <div className="test-name">
                          {result.passed ? '✅' : '❌'} {result.testCase}
                        </div>
                        <div className="test-details">
                          <span>Input: {result.input}</span>
                          <span>Expected: {typeof result.expected === 'object' ? JSON.stringify(result.expected) : String(result.expected)}</span>
                          <span>Actual: {typeof result.actual === 'object' ? JSON.stringify(result.actual) : String(result.actual)}</span>
                        </div>
                        {result.error && <div className="test-error">Error: {result.error}</div>}
                        <div className="test-description">{result.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="solution-section">
                <details>
                  <summary>🔍 View Solution</summary>
                  <div className="solution-code">
                    <pre><code className="javascript" dangerouslySetInnerHTML={{ __html: highlightCode(liveCodingChallenges[currentLiveChallenge].solution) }}></code></pre>
                  </div>
                </details>
              </div>

              <div className="challenge-navigation">
                <button 
                  className="nav-btn" 
                  onClick={prevLiveChallenge}
                  disabled={currentLiveChallenge === 0}
                >
                  ← Previous
                </button>
                <span className="challenge-counter">
                  {currentLiveChallenge + 1} of {liveCodingChallenges.length}
                </span>
                <button 
                  className="nav-btn" 
                  onClick={nextLiveChallenge}
                  disabled={currentLiveChallenge === liveCodingChallenges.length - 1}
                >
                  Next →
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Timed Challenge Section */}
        {activeSection === 'timed' && (
          <section id="timed" className="content-section active">
            <div className="section-header">
              <h2>⏱️ Timed Challenge</h2>
              <p>Complete coding challenges against the clock</p>
            </div>

            {!isTimedChallengeActive ? (
              <div className="timed-setup">
                <h3>Ready for a Challenge?</h3>
                <p>You&apos;ll have 5 minutes to complete coding challenges</p>
                <button className="start-btn" onClick={startTimedChallenge}>
                  🚀 Start Challenge
                </button>
              </div>
            ) : (
              <div className="timed-challenge">
                <div className="timer">
                  <span>⏰ Time Remaining: {formatTime(timer)}</span>
                </div>
                
                <div className="challenge-content">
                  <h3>{timedQuestions[currentQuestion].question}</h3>
                  <div className="code-editor">
                    <textarea
                      className="code-input"
                      placeholder={timedQuestions[currentQuestion].code}
                      rows={8}
                    />
                  </div>
                  
                  <div className="test-cases">
                    <h4>Test Cases:</h4>
                    {timedQuestions[currentQuestion].testCases.map((testCase, index) => (
                      <div key={index} className="test-case">
                        <strong>Input:</strong> {testCase.input}
                        <strong>Expected:</strong> {testCase.expected}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Code Review Section */}
        {activeSection === 'review' && (
          <section id="review" className="content-section active">
            <div className="section-header">
              <h2>📖 Code Review</h2>
              <p>Learn from common mistakes and improve your code</p>
            </div>

            <div className="code-review">
              {codeReviewExamples.map((example, index) => (
                <div key={index} className="review-example">
                  <h3>{example.title}</h3>
                  
                  <div className="code-block">
                    <div className="code-header">Code to Review</div>
                    <pre><code className="javascript" dangerouslySetInnerHTML={{ __html: highlightCode(example.code) }}></code></pre>
                  </div>

                  <div className="issues-section">
                    <h4>🚨 Issues Found:</h4>
                    <ul>
                      {example.issues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="improvements-section">
                    <h4>✅ Suggested Improvements:</h4>
                    <ul>
                      {example.improvements.map((improvement, i) => (
                        <li key={i}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Source Code Section */}
        {activeSection === 'source' && (
          <section id="source" className="content-section active">
            <div className="section-header">
              <h2>🔍 Complete Source Code</h2>
              <p>Reference the complete CardGameAnalyzer implementation</p>
            </div>

            <div className="source-code">
              <div className="concept-card">
                <h3>🎯 Complete CardGameAnalyzer Class</h3>
                <p>This is the production-ready implementation that powers all the examples and tests in this study guide.</p>
                
                <div className="code-block">
                  <div className="code-header">Complete Implementation</div>
                  <pre><code className="javascript" dangerouslySetInnerHTML={{ __html: highlightCode(`// Complete Card Game Interview Solution
// Time target: 10 minutes from memory

class CardGameAnalyzer {
  constructor() {
    this.HAND_RANKS = {
      STRAIGHT_FLUSH: 8,
      FOUR_OF_A_KIND: 7,
      FULL_HOUSE: 6,
      FLUSH: 5,
      STRAIGHT: 4,
      THREE_OF_A_KIND: 3,
      TWO_PAIR: 2,
      PAIR: 1,
      HIGH_CARD: 0
    };
  }

  // Core function: Evaluate a 5-card hand
  evaluateHand(hand) {
    if (!hand || hand.length !== 5) return [this.HAND_RANKS.HIGH_CARD];
    
    const values = hand.map(card => card[0]).sort((a, b) => b - a);
    const suits = hand.map(card => card[1]);
    
    const valueCounts = this.getValueCounts(values);
    const suitCounts = this.getSuitCounts(suits);
    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    
    const isFlush = Object.keys(suitCounts).length === 1;
    const isStraight = this.isStraight(values);
    
    // Evaluate from highest to lowest
    if (isFlush && isStraight) {
      return [this.HAND_RANKS.STRAIGHT_FLUSH, Math.max(...values)];
    }
    
    if (counts[0] === 4) {
      const fourValue = this.getValueByCount(valueCounts, 4);
      const kicker = this.getValueByCount(valueCounts, 1);
      return [this.HAND_RANKS.FOUR_OF_A_KIND, fourValue, kicker];
    }
    
    if (counts[0] === 3 && counts[1] === 2) {
      const threeValue = this.getValueByCount(valueCounts, 3);
      const pairValue = this.getValueByCount(valueCounts, 2);
      return [this.HAND_RANKS.FULL_HOUSE, threeValue, pairValue];
    }
    
    if (isFlush) {
      return [this.HAND_RANKS.FLUSH, ...values];
    }
    
    if (isStraight) {
      return [this.HAND_RANKS.STRAIGHT, Math.max(...values)];
    }
    
    if (counts[0] === 3) {
      const threeValue = this.getValueByCount(valueCounts, 3);
      const kickers = values.filter(v => v !== threeValue);
      return [this.HAND_RANKS.THREE_OF_A_KIND, threeValue, ...kickers];
    }
    
    if (counts[0] === 2 && counts[1] === 2) {
      const pairs = Object.keys(valueCounts)
        .filter(k => valueCounts[k] === 2)
        .map(Number)
        .sort((a, b) => b - a);
      const kicker = this.getValueByCount(valueCounts, 1);
      return [this.HAND_RANKS.TWO_PAIR, pairs[0], pairs[1], kicker];
    }
    
    if (counts[0] === 2) {
      const pairValue = this.getValueByCount(valueCounts, 2);
      const kickers = values.filter(v => v !== pairValue);
      return [this.HAND_RANKS.PAIR, pairValue, ...kickers];
    }
    
    return [this.HAND_RANKS.HIGH_CARD, ...values];
  }

  // Find best possible hand from available cards
  findBestHand(cards, handSize = 5) {
    if (cards.length < handSize) return null;
    
    const combinations = this.getCombinations(cards, handSize);
    let bestHand = null;
    let bestScore = [-1];
    
    for (const combo of combinations) {
      const score = this.evaluateHand(combo);
      if (this.compareHands(score, bestScore) > 0) {
        bestHand = combo;
        bestScore = score;
      }
    }
    
    return { hand: bestHand, score: bestScore };
  }

  // Compare two hand scores
  compareHands(hand1Score, hand2Score) {
    const maxLength = Math.max(hand1Score.length, hand2Score.length);
    for (let i = 0; i < 0; i++) {
      const val1 = hand1Score[i] || 0;
      const val2 = hand2Score[i] || 0;
      if (val1 > val2) return 1;
      if (val1 < val2) return 0;
    }
    return 0;
  }

  // Generate all combinations of r elements from array
  getCombinations(arr, r) {
    if (r === 1) return arr.map(item => [item]);
    
    const result = [];
    arr.forEach((item, i) => {
      const rest = arr.slice(i + 1);
      const combos = this.getCombinations(rest, r - 1);
      combos.forEach(combo => result.push([item, ...combo]));
    });
    return result;
  }

  // Deal optimal hands to multiple players
  dealOptimalHands(deck, numPlayers, handSize = 5) {
    if (deck.length < numPlayers * handSize) return null;
    
    const players = Array(numPlayers).fill().map(() => []);
    const shuffled = this.shuffleDeck([...deck]);
    
    // Simple dealing - one card at a time
    for (let round = 0; round < handSize; round++) {
      for (let player = 0; player < numPlayers; player++) {
        players[player].push(shuffled.pop());
      }
    }
    
    return players.map(hand => ({
      hand,
      score: this.evaluateHand(hand),
      rank: this.getHandRankName(this.evaluateHand(hand)[0])
    }));
  }

  // Utility functions
  getValueCounts(values) {
    return values.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
  }

  getSuitCounts(suits) {
    return values.reduce((acc, suit) => {
      acc[suit] = (acc[suit] || 0) + 1;
      return acc;
    }, {});
  }

  getValueByCount(counts, target) {
    return parseInt(Object.keys(counts).find(key => counts[key] === target));
  }

  isStraight(values) {
    const unique = [...new Set(values)].sort((a, b) => a - b);
    if (unique.length !== 5) return false;
    
    // Check for regular straight
    for (let i = 1; i < unique.length; i++) {
      if (unique[i] - unique[i-1] !== 1) {
        // Check for Ace-low straight (A,2,3,4,5)
        if (unique.join(',') === '2,3,4,5,14') return true;
        return false;
      }
    }
    return true;
  }

  createDeck() {
    const suits = ['S', 'H', 'D', 'C'];
    const values = [2,3,4,5,6,7,8,9,10,11,12,13,14];
    return suits.flatMap(suit => values.map(value => [value, suit]));
  }

  shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  getHandRankName(rank) {
    const names = ['High Card', 'Pair', 'Two Pair', 'Three of a Kind', 
                   'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush'];
    return names[rank] || 'Unknown';
  }

  // Convert string notation to vector (bonus utility)
  parseCard(cardStr) {
    const valueMap = {'A': 14, 'K': 13, 'Q': 12, 'J': 11};
    const value = valueMap[cardStr[0]] || parseInt(cardStr.slice(0, -1));
    const suit = cardStr.slice(-1);
    return [value, suit];
  }
}`) }}></code></pre>
                </div>
              </div>

              <div className="concept-card">
                <h3>🧪 Complete Test Suite</h3>
                <p>Comprehensive Jest tests covering all functionality and edge cases.</p>
                
                <div className="code-block">
                  <div className="code-header">Jest Test Suite</div>
                  <pre><code className="javascript" dangerouslySetInnerHTML={{ __html: highlightCode(`// Jest Test Suite
describe('CardGameAnalyzer', () => {
  let analyzer;
  let deck;

  beforeEach(() => {
    analyzer = new CardGameAnalyzer();
    deck = analyzer.createDeck();
  });

  describe('Hand Evaluation', () => {
    test('evaluates straight flush correctly', () => {
      const hand = [[14,'S'], [13,'S'], [12,'S'], [11,'S'], [10,'S']]; // Royal flush
      const result = analyzer.evaluateHand(hand);
      expect(result[0]).toBe(analyzer.HAND_RANKS.STRAIGHT_FLUSH);
      expect(result[1]).toBe(14);
    });

    test('evaluates four of a kind correctly', () => {
      const hand = [[14,'S'], [14,'H'], [14,'D'], [14,'C'], [10,'S']];
      const result = analyzer.evaluateHand(hand);
      expect(result[0]).toBe(analyzer.HAND_RANKS.FOUR_OF_A_KIND);
      expect(result[1]).toBe(14);
      expect(result[2]).toBe(10); // Kicker
    });

    test('evaluates full house correctly', () => {
      const hand = [[14,'S'], [14,'H'], [14,'D'], [10,'C'], [10,'S']];
      const result = analyzer.evaluateHand(hand);
      expect(result[0]).toBe(analyzer.HAND_RANKS.FULL_HOUSE);
      expect(result[1]).toBe(14); // Three of a kind value
      expect(result[2]).toBe(10); // Pair value
    });

    test('evaluates flush correctly', () => {
      const hand = [[14,'S'], [12,'S'], [10,'S'], [8,'S'], [6,'S']];
      const result = analyzer.evaluateHand(hand);
      expect(result[0]).toBe(analyzer.HAND_RANKS.FLUSH);
      expect(result.slice(1)).toEqual([14, 12, 10, 8, 6]);
    });

    test('evaluates straight correctly', () => {
      const hand = [[14,'S'], [13,'H'], [12,'D'], [11,'C'], [10,'S']];
      const result = analyzer.evaluateHand(hand);
      expect(result[0]).toBe(analyzer.HAND_RANKS.STRAIGHT);
      expect(result[1]).toBe(14);
    });

    test('evaluates Ace-low straight correctly', () => {
      const hand = [[14,'S'], [5,'H'], [4,'D'], [3,'C'], [2,'S']];
      const result = analyzer.evaluateHand(hand);
      expect(result[0]).toBe(analyzer.HAND_RANKS.STRAIGHT);
    });

    test('evaluates three of a kind correctly', () => {
      const hand = [[14,'S'], [14,'H'], [14,'D'], [10,'C'], [8,'S']];
      const result = analyzer.evaluateHand(hand);
      compareHands(score, bestScore) > 0) {
        bestHand = combo;
        bestScore = score;
      }
    }
    
    return { hand: bestHand, score: bestScore };
  }

  // Compare two hand scores
  compareHands(hand1Score, hand2Score) {
    const maxLength = Math.max(hand1Score.length, hand2Score.length);
    for (let i = 0; i < maxLength; i++) {
      const val1 = hand1Score[i] || 0;
      const val2 = hand2Score[i] || 0;
      if (val1 > val2) return 1;
      if (val1 < val2) return 0;
    }
    return 0;
  }

  // Generate all combinations of r elements from array
  getCombinations(arr, r) {
    if (r === 1) return arr.map(item => [item]);
    
    const result = [];
    arr.forEach((item, i) => {
      const rest = arr.slice(i + 1);
      const combos = this.getCombinations(rest, r - 1);
      combos.forEach(combo => result.push([item, ...combo]));
    });
    return result;
  }

  // Deal optimal hands to multiple players
  dealOptimalHands(deck, numPlayers, handSize = 5) {
    if (deck.length < numPlayers * handSize) return null;
    
    const players = Array(numPlayers).fill().map(() => []);
    const shuffled = this.shuffleDeck([...deck]);
    
    // Simple dealing - one card at a1, bestScore: bestScore };
  }

  // Compare two hand scores
  compareHands(hand1Score, hand2Score) {
    const maxLength = Math.max(hand1Score.length, hand2Score.length);
    for (let i = 0; i < maxLength; i++) {
      const val1 = hand1Score[i] || 0;
      const val2 = hand2Score[i] || 0;
      if (val1 > val2) return 1;
      if (val1 < val2) return 0;
    }
    return 0;
  }

  // Generate all combinations of r elements from array
  getCombinations(arr, r) {
    if (r === 1) return arr.map(item => [item]);
    
    const result = [];
    arr.forEach((item, i) => {
      const rest = arr.slice(i + 1);
      const combos = this.getCombinations(rest, r - 1);
      combos.forEach(combo => result.push([item, ...combo]));
    });
    return result;
  }

  // Deal optimal hands to multiple players
  dealOptimalHands(deck, numPlayers, handSize = 5) {
    if (deck.length < numPlayers * handSize) return null;
    
    const players = Array(numPlayers).fill(() => []);
    const shuffled = this.shuffleDeck([...deck]);
    
    // Simple dealing - one card at a time
    for (let round = 0; round < handSize; round++) {
      for (let player = 0; player < numPlayers; player++) {
        players[player].push(shuffled.pop());
      }
    }
    
    return players.map(hand => ({
      hand,
      score: this.evaluateHand(hand),
      rank: this.getHandRankName(this.evaluateHand(hand)[0])
    }));
  }

  // Utility functions
  getValueCounts(values) {
    return values.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
  }

  getSuitCounts(suits) {
    return values.reduce((acc, suit) => {
      acc[suit] = (acc[suit] || 0) + 1;
      return acc;
    }, {});
  }

  getValueByCount(counts, target) {
    return parseInt(Object.keys(counts).find(key => counts[key] === target));
  }

  isStraight(values) {
    const unique = [...new Set(values)].sort((a, b) => b - a);
    if (unique.length !== 5) return false;
    
    // Check for regular straight
    for (let i = 1; i < unique.length; i++) {
      if (unique[i] - unique[i-1] !== 1) {
        // Check for Ace-low straight (A,2,3,4,5)
        if (unique.join(',') === '2,3,4,5,14') return true;
        return false;
      }
    }
    return true;
  }

  createDeck() {
    const suits = ['S', 'H', 'D', 'C'];
    const values = [2,3,4,5,6,7,8,9,10,11,12,13,14];
    return suits.flatMap(suit => values.map(value => [value, suit]));
  }

  shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[i], shuffled[j]];
    }
    return shuffled;
  }

  getHandRankName(rank) {
    const names = ['High Card', 'Pair', 'Two Pair', 'Three of a Kind', 
                   'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush'];
    return names[rank] || 'Unknown';
  }

  // Convert string notation to vector (bonus utility)
  parseCard(cardStr) {
    const valueMap = {'A': 14, 'K': 13, 'Q': 12, 'J': 11};
    const value = valueMap[cardStr[0]] || parseInt(cardStr.slice(0,1));
    const suit = cardStr.slice(-1);
    return [value, suit];
  }
}`) }}></code></pre>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
    </>
  )
}
