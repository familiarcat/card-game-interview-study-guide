'use client'

import { useState } from 'react'

export default function Home() {
  const [activeSection, setActiveSection] = useState('study')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [timer, setTimer] = useState(300) // 5 minutes for timed challenge
  const [isTimedChallengeActive, setIsTimedChallengeActive] = useState(false)

  const sections = [
    { id: 'study', label: '📚 Study Guide', icon: '📚' },
    { id: 'practice', label: '🧪 Practice Tests', icon: '🧪' },
    { id: 'timed', label: '⏱️ Timed Challenge', icon: '⏱️' },
    { id: 'review', label: '📖 Code Review', icon: '📖' }
  ]

  // Practice Test Questions
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
      explanation: "Aces are represented as value 14 in card games, and 'S' represents Spades."
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
      explanation: "Array.map() is used to transform each card to its value (card[0])."
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
      explanation: "A flush means all 5 cards have the same suit."
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
      explanation: "Full House (3 of a kind + 2 of a kind) beats Flush, Straight, and Three of a Kind."
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
      explanation: "A straight requires 5 consecutive card values (e.g., 5,6,7,8,9)."
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
      explanation: "We need to check all combinations of 5 cards from 7, which is C(7,5) = 21 combinations."
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
      explanation: "Fisher-Yates shuffle provides unbiased random shuffling with O(n) complexity."
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
      explanation: "Kicker cards break ties when two hands have the same ranking."
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
      explanation: "Royal flush is A, K, Q, J, 10 of the same suit (values 14, 13, 12, 11, 10)."
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
      explanation: "Hands are ranked by type first, then by high card, then by kickers for ties."
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
}`
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
}`
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
  return 0;
}`,
      issues: [
        "No input validation",
        "Assumes card format without checking",
        "No error handling for invalid cards"
      ],
      improvements: [
        "Add validation: if (!Array.isArray(card1) || card1.length < 2) throw new Error('Invalid card format')",
        "Check card bounds: if (card1[0] < 2 || card1[0] > 14) throw new Error('Invalid card value')",
        "Add type checking and defensive programming"
      ]
    }
  ]

  const handleAnswer = (selectedAnswer: number) => {
    if (practiceQuestions[currentQuestion].correct === selectedAnswer) {
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
  }

  const startTimedChallenge = () => {
    setIsTimedChallengeActive(true)
    setTimer(300) // 5 minutes
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setIsTimedChallengeActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      <header className="app-header">
        <h1>🎯 Card Game Interview Study Guide</h1>
        <p>Master in 24 Hours, Execute in 10 Minutes</p>
      </header>

      <nav className="app-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
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
                <h3>⚡ Algorithm 1: Hand Evaluation</h3>
                <div className="code-block">
                  <div className="code-header">Core Hand Evaluation Logic</div>
                  <pre><code className="javascript">{`function evaluateHand(hand) {
  const values = hand.map(card => card[0]).sort((a, b) => b - a);
  const suits = hand.map(card => card[1]);
  const suitCounts = suits.reduce((acc, suit) => {
    acc[suit] = (acc[suit] || 0) + 1;
    return acc;
  }, {});
  
  const valueCounts = values.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  
  const counts = Object.values(valueCounts).sort((a, b) => b - a);
  const isFlush = Object.keys(suitCounts).length === 1;
  const isStraight = isConsecutive(values);
  
  // Return hand strength vector [type, highCard, kickers...]
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
                <h3>🎯 Algorithm 2: Optimal Hand Selection</h3>
                <div className="code-block">
                  <div className="code-header">Finding Best Hand from Available Cards</div>
                  <pre><code className="javascript">{`function findBestHand(cards, handSize = 5) {
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
                <h3>🔄 Algorithm 3: Hand Comparison</h3>
                <div className="code-block">
                  <div className="code-header">Comparing Two Hands for Winner</div>
                  <pre><code className="javascript">{`function compareHands(score1, score2) {
  // score format: [handType, highCard, kicker1, kicker2, ...]
  for (let i = 0; i < Math.max(score1.length, score2.length); i++) {
    const val1 = score1[i] || 0;
    const val2 = score2[i] || 0;
    if (val1 > val2) return 1;
    if (val1 < val2) return -1;
  }
  return 0; // Tie
}

// Usage example:
const hand1Score = [8, 14]; // Royal Flush, Ace high
const hand2Score = [7, 13]; // Four of a Kind, King high
const winner = compareHands(hand1Score, hand2Score); // Returns 1 (hand1 wins)`}</code></pre>
                </div>
              </div>

              <div className="concept-card">
                <h3>🎲 Algorithm 4: Deck Generation & Shuffling</h3>
                <div className="code-block">
                  <div className="code-header">Creating and Randomizing Card Decks</div>
                  <pre><code className="javascript">{`function generateDeck() {
  const suits = ['S', 'H', 'D', 'C'];
  const values = Array.from({length: 13}, (_, i) => i + 2); // 2-14 (Ace = 14)
  const deck = [];
  
  for (const suit of suits) {
    for (const value of values) {
      deck.push([value, suit]);
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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
              <p>Test your knowledge with {practiceQuestions.length} interactive questions</p>
            </div>
            
            {!showResults ? (
              <div className="concept-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>Question {currentQuestion + 1} of {practiceQuestions.length}</h3>
                  <div style={{ color: 'var(--vs-text-secondary)' }}>
                    Score: {score}/{currentQuestion}
                  </div>
                </div>
                
                <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                  {practiceQuestions[currentQuestion].question}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {practiceQuestions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      style={{
                        padding: '1rem',
                        textAlign: 'left',
                        backgroundColor: 'var(--vs-background)',
                        border: '1px solid var(--vs-focus-border)',
                        borderRadius: '6px',
                        color: 'var(--vs-text)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#3c3c3c'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--vs-background)'
                      }}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="concept-card">
                <h3>🎉 Practice Test Complete!</h3>
                <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                  Your Score: <strong>{score}/{practiceQuestions.length}</strong> 
                  ({Math.round((score / practiceQuestions.length) * 100)}%)
                </p>
                
                {score === practiceQuestions.length && (
                  <p style={{ color: 'var(--vs-text-info)', marginBottom: '1rem' }}>
                                         🏆 Perfect score! You&apos;re ready for any card game interview!
                  </p>
                )}
                
                {score >= practiceQuestions.length * 0.8 && (
                  <p style={{ color: 'var(--vs-text-info)', marginBottom: '1rem' }}>
                    🎯 Excellent! You have a strong understanding of card game concepts.
                  </p>
                )}
                
                {score < practiceQuestions.length * 0.6 && (
                  <p style={{ color: 'var(--vs-text-warning)', marginBottom: '1rem' }}>
                    📚 Keep studying! Review the study guide and try again.
                  </p>
                )}
                
                <button
                  onClick={resetPracticeTest}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--vs-focus-border)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  🔄 Take Test Again
                </button>
              </div>
            )}
          </section>
        )}

        {/* Timed Challenge Section */}
        {activeSection === 'timed' && (
          <section id="timed" className="content-section active">
            <div className="section-header">
              <h2>⏱️ Timed Challenge</h2>
              <p>Test your speed and accuracy under pressure</p>
            </div>
            
            {!isTimedChallengeActive ? (
              <div className="concept-card">
                <h3>Ready for the Challenge?</h3>
                <p style={{ color: 'var(--vs-text-secondary)', marginBottom: '1.5rem' }}>
                                     You&apos;ll have <strong>5 minutes</strong> to implement card game algorithms.
                  Each question requires you to write working code that passes the test cases.
                </p>
                
                <button
                  onClick={startTimedChallenge}
                  style={{
                    padding: '1rem 2rem',
                    backgroundColor: 'var(--vs-focus-border)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  🚀 Start Challenge
                </button>
              </div>
            ) : (
              <div className="concept-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>⏱️ Time Remaining: {formatTime(timer)}</h3>
                  <div style={{ 
                    color: timer < 60 ? 'var(--vs-text-error)' : 'var(--vs-text-secondary)',
                    fontSize: '1.1rem'
                  }}>
                    {Math.ceil(timer / 60)} minute{Math.ceil(timer / 60) !== 1 ? 's' : ''} left
                  </div>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Challenge Question:</h4>
                  <p style={{ marginBottom: '1rem' }}>
                    {timedQuestions[0].question}
                  </p>
                  
                  <div className="code-block">
                    <div className="code-header">Your Implementation</div>
                    <pre><code className="javascript">{timedQuestions[0].code}</code></pre>
                  </div>
                  
                  <div style={{ marginTop: '1rem' }}>
                    <h5>Test Cases:</h5>
                    {timedQuestions[0].testCases.map((testCase, index) => (
                      <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#2d2d30', borderRadius: '4px' }}>
                        <strong>Input:</strong> {testCase.input} → <strong>Expected:</strong> {testCase.expected.toString()}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: '#1e1e1e', 
                  border: '1px solid var(--vs-focus-border)',
                  borderRadius: '6px',
                  marginTop: '1rem'
                }}>
                  <h5 style={{ marginBottom: '0.5rem' }}>💡 Solution (reveal after attempt):</h5>
                  <details>
                    <summary style={{ cursor: 'pointer', color: 'var(--vs-text-link)' }}>
                      Click to reveal solution
                    </summary>
                    <pre style={{ marginTop: '0.5rem' }}><code className="javascript">{timedQuestions[0].solution}</code></pre>
                  </details>
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
              <p>Analyze and improve card game implementations</p>
            </div>
            
            {codeReviewExamples.map((example, index) => (
              <div key={index} className="concept-card">
                <h3>{example.title}</h3>
                
                <div className="code-block">
                  <div className="code-header">Code to Review</div>
                  <pre><code className="javascript">{example.code}</code></pre>
                </div>
                
                <div style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ color: 'var(--vs-text-error)', marginBottom: '1rem' }}>🚨 Issues Found:</h4>
                  <ul style={{ marginBottom: '1.5rem' }}>
                    {example.issues.map((issue, i) => (
                      <li key={i} style={{ marginBottom: '0.5rem', color: 'var(--vs-text)' }}>
                        {issue}
                      </li>
                    ))}
                  </ul>
                  
                  <h4 style={{ color: 'var(--vs-text-info)', marginBottom: '1rem' }}>✅ Suggested Improvements:</h4>
                  <ul>
                    {example.improvements.map((improvement, i) => (
                      <li key={i} style={{ marginBottom: '0.5rem', color: 'var(--vs-text)' }}>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </>
  )
}
