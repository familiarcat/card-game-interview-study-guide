'use client'

import { useState } from 'react'

export default function Home() {
  const [activeSection, setActiveSection] = useState('study')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [timer, setTimer] = useState(300) // 5 minutes for timed challenge
  const [isTimedChallengeActive, setIsTimedChallengeActive] = useState(false)
  const [showHint, setShowHint] = useState(false)
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

  const sections = [
    { id: 'study', label: '📚 Study Guide', icon: '📚' },
    { id: 'practice', label: '🧪 Practice Tests', icon: '🧪' },
    { id: 'live', label: '💻 Live Coding', icon: '💻' },
    { id: 'timed', label: '⏱️ Timed Challenge', icon: '⏱️' },
    { id: 'review', label: '📖 Code Review', icon: '📖' }
  ]

  // Enhanced Practice Test Questions with Hints
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
      hint: "Think about the ranking system - Aces are the highest value in poker. What number represents the highest rank?"
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
      hint: "You want to transform each element in the array, not filter or reduce. Which method creates a new array with transformed values?"
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
      hint: "Think about the word 'flush' - it's about uniformity. What aspect of the cards needs to be uniform?"
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

  // Code Review Examples
  const codeReviewExamples = [
    {
      title: "Hand Evaluation Function",
      code: `function evaluateHand(hand) {
  const values = hand.map(card => card[0]);
  const suits = hand.map(card => card[1]);
  
  // Check for flush
  const isFlush = suits.every(suit => suit === suits[0]);
  
  // Check for straight
  const sortedValues = values.sort((a, b) => a - b);
  const isStraight = sortedValues.every((val, i) => 
    i === 0 || val === sortedValues[i-1] + 1
  );
  
  if (isFlush && isStraight) return "Royal Flush";
  if (isFlush) return "Flush";
  if (isStraight) return "Straight";
  return "High Card";
}`,
      issues: [
        "Missing validation for hand size",
        "No handling for Ace-low straight (A,2,3,4,5)",
        "Inefficient sorting on every call",
        "Missing return for other hand types"
      ],
      improvements: [
        "Add input validation: if (hand.length !== 5) throw new Error('Invalid hand size')",
        "Handle Ace-low straight: check if [14,2,3,4,5] is consecutive",
        "Cache sorted values or pass pre-sorted array",
        "Add complete hand type detection (pairs, three of a kind, etc.)"
      ]
    },
    {
      title: "Card Comparison Function",
      code: `function compareCards(card1, card2) {
  if (card1[0] > card2[0]) return 1;
  if (card1[0] < card2[0]) return -1;
  if (card1[1] > card2[1]) return 1;
  if (card1[1] < card2[1]) return -1;
  return 0;
}`,
      issues: [
        "Suit comparison is incorrect (suits don't have ranking)",
        "Missing null/undefined checks",
        "No validation of card format",
        "Inconsistent return values"
      ],
      improvements: [
        "Remove suit comparison - only compare values",
        "Add input validation: if (!card1 || !card2) throw new Error('Invalid cards')",
        "Validate card format: if (!Array.isArray(card) || card.length !== 2) throw new Error('Invalid card format')",
        "Ensure consistent return: 1 (greater), -1 (less), 0 (equal)"
      ]
    }
  ]

  // Functions
  const handleAnswer = (selectedOption: number) => {
    const question = practiceQuestions[currentQuestion]
    if (selectedOption === question.correct) {
      setScore(score + 1)
    }
    
    if (currentQuestion < practiceQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResults(true)
    }
  }

  const resetPracticeTest = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowResults(false)
    setShowHint(false)
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
                  <pre><code className="javascript">{`// Standard representations you'll encounter:
 
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
                  <pre><code className="javascript">{`// 1. Extract values only
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
                  <div className="code-header">Core Hand Evaluation Logic</div>
                  <pre><code className="javascript">{`function evaluateHand(hand) {
  if (!hand || hand.length !== 5) return [0];
  
  const values = hand.map(card => card[0]).sort((a, b) => b - a);
  const suits = hand.map(card => card[1]);
  
  const valueCounts = getValueCounts(values);
  const suitCounts = getSuitCounts(suits);
  const counts = Object.values(valueCounts).sort((a, b) => b - a);
  
  const isFlush = Object.keys(suitCounts).length === 1;
  const isStraight = isStraight(values);
  
  // Return [handType, primaryValue, ...kickers]
  if (isFlush && isStraight) return [8, Math.max(...values)];
  if (counts[0] === 4) return [7, getValueByCount(valueCounts, 4)];
  if (counts[0] === 3 && counts[1] === 2) return [6, getValueByCount(valueCounts, 3)];
  if (isFlush) return [5, ...values];
  if (isStraight) return [4, Math.max(...values)];
  if (counts[0] === 3) return [3, getValueByCount(valueCounts, 3)];
  if (counts[0] === 2 && counts[1] === 2) return [2, ...getTwoPairValues(valueCounts)];
  if (counts[0] === 2) return [1, getValueByCount(valueCounts, 2)];
  return [0, ...values];
}`}</code></pre>
                </div>
              </div>

              <div className="concept-card">
                <h3>🔄 Combination Generation</h3>
                <div className="code-block">
                  <div className="code-header">Finding Best Hand from Multiple Cards</div>
                  <pre><code className="javascript">{`function findBestHand(cards, handSize = 5) {
  if (cards.length < handSize) return null;
  
  const combinations = getCombinations(cards, handSize);
  let bestHand = null;
  let bestScore = [-1];
  
  for (const combo of combinations) {
    const score = evaluateHand(combo);
    if (compareHands(score, bestScore) > 0) {
      bestHand = combo;
      bestScore = score;
    }
  }
  
  return { hand: bestHand, score: bestScore };
}

function getCombinations(arr, r) {
  if (r === 1) return arr.map(item => [item]);
  
  const result = [];
  arr.forEach((item, i) => {
    const rest = arr.slice(i + 1);
    const combos = getCombinations(rest, r - 1);
    combos.forEach(combo => result.push([item, ...combo]));
  });
  return result;
}`}</code></pre>
                </div>
              </div>

              <div className="concept-card">
                <h3>⚖️ Hand Comparison</h3>
                <div className="code-block">
                  <div className="code-header">Comparing Two Hand Scores</div>
                  <pre><code className="javascript">{`function compareHands(hand1Score, hand2Score) {
  const maxLength = Math.max(hand1Score.length, hand2Score.length);
  
  for (let i = 0; i < maxLength; i++) {
    const val1 = hand1Score[i] || 0;
    const val2 = hand2Score[i] || 0;
    
    if (val1 > val2) return 1;
    if (val1 < val2) return -1;
  }
  
  return 0; // Tie
}`}</code></pre>
                </div>
              </div>

              <div className="concept-card">
                <h3>🎲 Utility Functions</h3>
                <div className="code-block">
                  <div className="code-header">Essential Helper Functions</div>
                  <pre><code className="javascript">{`// Create standard deck
function createDeck() {
  const suits = ['S', 'H', 'D', 'C'];
  const values = [2,3,4,5,6,7,8,9,10,11,12,13,14];
  return suits.flatMap(suit => values.map(value => [value, suit]));
}

// Shuffle deck using Fisher-Yates
function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Check for straight (including Ace-low)
function isStraight(values) {
  const unique = [...new Set(values)].sort((a, b) => a - b);
  if (unique.length !== 5) return false;
  
  // Check regular straight
  for (let i = 1; i < unique.length; i++) {
    if (unique[i] - unique[i-1] !== 1) {
      // Check Ace-low straight (A,2,3,4,5)
      if (unique.join(',') === '2,3,4,5,14') return true;
      return false;
    }
  }
  return true;
}`}</code></pre>
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
                  <h3>Question {currentQuestion + 1} of {practiceQuestions.length}</h3>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${((currentQuestion + 1) / practiceQuestions.length) * 100}%`}}
                    ></div>
                  </div>
                </div>

                <div className="question-content">
                  <p className="question-text">{practiceQuestions[currentQuestion].question}</p>
                  
                  <div className="options">
                    {practiceQuestions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        className="option-btn"
                        onClick={() => handleAnswer(index)}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </button>
                    ))}
                  </div>

                  <div className="hint-section">
                    <button className="hint-btn" onClick={getHint}>
                      💡 Need a hint?
                    </button>
                    {showHint && (
                      <div className="hint-content">
                        <strong>Hint:</strong> {practiceQuestions[currentQuestion].hint}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="results">
                <h3>🎉 Practice Test Complete!</h3>
                <p>Your Score: <strong>{score}</strong> out of <strong>{practiceQuestions.length}</strong></p>
                <p>Percentage: <strong>{Math.round((score / practiceQuestions.length) * 100)}%</strong></p>
                
                <div className="score-feedback">
                  {score === practiceQuestions.length && <p>🏆 Perfect! You&apos;re ready for any interview!</p>}
                  {score >= practiceQuestions.length * 0.8 && <p>🎯 Excellent! You have a strong foundation.</p>}
                  {score >= practiceQuestions.length * 0.6 && <p>👍 Good work! Review the concepts you missed.</p>}
                  {score < practiceQuestions.length * 0.6 && <p>📚 Keep studying! Focus on the fundamentals.</p>}
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
                    <pre><code className="javascript">{liveCodingChallenges[currentLiveChallenge].solution}</code></pre>
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
                    <pre><code className="javascript">{example.code}</code></pre>
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
      </main>
    </div>
  )
}
