# Card Game Vector Analysis - Interview Crash Course

## 🎯 Goal: Master in 24 Hours, Execute in 10 Minutes

### Phase 1: Core Concepts (30 minutes)

#### Card Representation Patterns
```javascript
// Standard representations you'll encounter:
const card1 = [14, 'S']; // [value, suit] - Ace of Spades
const card2 = {value: 14, suit: 'S'}; // Object notation
const card3 = 'AS'; // String notation (convert to vector)

// Hand as multidimensional array:
const hand = [[14,'S'], [13,'H'], [12,'D'], [11,'C'], [10,'S']];
```

#### Key Vector Operations
```javascript
// 1. Extract values only
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
}, {});
```

### Phase 2: Essential Algorithms (45 minutes)

#### Algorithm 1: Hand Evaluation
```javascript
function evaluateHand(hand) {
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
}
```

#### Algorithm 2: Optimal Hand Selection
```javascript
function findBestHand(cards, handSize = 5) {
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
}
```

### Phase 3: Common Interview Variants (30 minutes)

#### Variant 1: Compare Two Hands
```javascript
function compareHands(hand1Score, hand2Score) {
  for (let i = 0; i < Math.max(hand1Score.length, hand2Score.length); i++) {
    const val1 = hand1Score[i] || 0;
    const val2 = hand2Score[i] || 0;
    if (val1 > val2) return 1;
    if (val1 < val2) return -1;
  }
  return 0; // Tie
}
```

#### Variant 2: Deal Optimal Hands to N Players
```javascript
function dealOptimalHands(deck, numPlayers, handSize = 5) {
  const players = Array(numPlayers).fill().map(() => []);
  const remainingCards = [...deck];
  
  // Deal one card at a time to maintain fairness
  for (let round = 0; round < handSize; round++) {
    for (let player = 0; player < numPlayers; player++) {
      if (remainingCards.length === 0) break;
      
      // Find best card for this player's current hand
      const bestCardIndex = findBestCardForHand(
        players[player], 
        remainingCards, 
        handSize - round - 1
      );
      
      players[player].push(remainingCards.splice(bestCardIndex, 1)[0]);
    }
  }
  
  return players.map(hand => ({
    hand,
    score: evaluateHand(hand)
  }));
}
```

### Phase 4: Utility Functions (15 minutes)

```javascript
// Helper functions you'll need to memorize:
const isConsecutive = (values) => {
  const sorted = [...new Set(values)].sort((a, b) => a - b);
  if (sorted.length < 5) return false;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i-1] !== 1) return false;
  }
  return true;
};

const getValueByCount = (counts, target) => {
  return parseInt(Object.keys(counts).find(key => counts[key] === target));
};

const createDeck = () => {
  const suits = ['S', 'H', 'D', 'C'];
  const values = [2,3,4,5,6,7,8,9,10,11,12,13,14]; // J=11, Q=12, K=13, A=14
  return suits.flatMap(suit => values.map(value => [value, suit]));
};

const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
```

### Phase 5: Jest Testing Framework (20 minutes)

#### Complete Test Suite Template
```javascript
describe('Card Game Analysis', () => {
  let deck;
  
  beforeEach(() => {
    deck = createDeck();
  });

  describe('Hand Evaluation', () => {
    test('identifies straight flush', () => {
      const hand = [[14,'S'], [13,'S'], [12,'S'], [11,'S'], [10,'S']];
      const result = evaluateHand(hand);
      expect(result[0]).toBe(8); // Straight flush
      expect(result[1]).toBe(14); // Ace high
    });

    test('identifies four of a kind', () => {
      const hand = [[14,'S'], [14,'H'], [14,'D'], [14,'C'], [10,'S']];
      const result = evaluateHand(hand);
      expect(result[0]).toBe(7); // Four of a kind
      expect(result[1]).toBe(14); // Aces
    });

    test('identifies full house', () => {
      const hand = [[14,'S'], [14,'H'], [14,'D'], [10,'C'], [10,'S']];
      const result = evaluateHand(hand);
      expect(result[0]).toBe(6); // Full house
      expect(result[1]).toBe(14); // Aces over tens
    });
  });

  describe('Hand Comparison', () => {
    test('compares different hand types', () => {
      const flush = [[14,'S'], [12,'S'], [10,'S'], [8,'S'], [6,'S']];
      const straight = [[14,'S'], [13,'H'], [12,'D'], [11,'C'], [10,'S']];
      
      const flushScore = evaluateHand(flush);
      const straightScore = evaluateHand(straight);
      
      expect(compareHands(flushScore, straightScore)).toBe(1);
    });

    test('compares same hand types', () => {
      const highFlush = [[14,'S'], [13,'S'], [11,'S'], [9,'S'], [7,'S']];
      const lowFlush = [[14,'H'], [13,'H'], [11,'H'], [9,'H'], [6,'H']];
      
      const highScore = evaluateHand(highFlush);
      const lowScore = evaluateHand(lowFlush);
      
      expect(compareHands(highScore, lowScore)).toBe(1);
    });
  });

  describe('Optimal Hand Selection', () => {
    test('finds best 5-card hand from 7 cards', () => {
      const cards = [
        [14,'S'], [13,'S'], [12,'S'], [11,'S'], [10,'S'], // Royal flush
        [9,'H'], [8,'H'] // Weaker cards
      ];
      
      const result = findBestHand(cards, 5);
      expect(result.score[0]).toBe(8); // Straight flush
      expect(result.hand.length).toBe(5);
    });

    test('handles edge cases with insufficient cards', () => {
      const cards = [[14,'S'], [13,'H'], [12,'D']];
      const result = findBestHand(cards, 5);
      expect(result).toBeNull();
    });
  });
});
```

### Phase 6: 10-Minute Implementation Strategy

#### Time Allocation:
- **Minutes 1-2**: Set up basic structure and card representation
- **Minutes 3-5**: Implement hand evaluation core logic
- **Minutes 6-7**: Add comparison and utility functions
- **Minutes 8-9**: Implement main algorithm (optimal hand/dealing)
- **Minute 10**: Quick test and edge case fixes

#### Memory Aids:
1. **Hand Rankings**: Royal(8) > 4Kind(7) > Full(6) > Flush(5) > Straight(4) > 3Kind(3) > 2Pair(2) > Pair(1) > High(0)
2. **Vector Pattern**: `[handType, primaryValue, ...kickers]`
3. **Reduction Pattern**: Always use reduce for counting/grouping
4. **Combination Pattern**: Recursive with slice(i+1)

### Study Schedule:

#### Tonight (2-3 hours):
1. **30 min**: Read through concepts, understand patterns
2. **45 min**: Practice each algorithm separately 
3. **30 min**: Run through Jest tests, understand expectations
4. **30 min**: Time yourself doing complete implementations
5. **15 min**: Review common gotchas and edge cases

#### Tomorrow Morning (1 hour):
1. **20 min**: Speed implementation practice (aim for 8 minutes)
2. **20 min**: Review edge cases and error handling
3. **20 min**: Mock interview simulation - solve blind

#### Just Before Interview (15 minutes):
- Review hand rankings and vector patterns
- Practice the combination generation algorithm (most commonly forgotten)
- Mentally rehearse the Jest test structure

## 🚨 Common Gotchas to Avoid:
1. **Off-by-one errors** in combinations
2. **Forgetting to handle Ace-low straights** (A,2,3,4,5)
3. **Not sorting values consistently** (always sort descending for comparison)
4. **Mixing up suit vs value** in card[0] vs card[1]
5. **Edge cases**: Empty hands, duplicate cards, insufficient cards