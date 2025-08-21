// Complete Card Game Interview Solution
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
    for (let i = 0; i < maxLength; i++) {
      const val1 = hand1Score[i] || 0;
      const val2 = hand2Score[i] || 0;
      if (val1 > val2) return 1;
      if (val1 < val2) return -1;
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
    return suits.reduce((acc, suit) => {
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
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CardGameAnalyzer;
}

// Jest Test Suite
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
      expect(result[0]).toBe(analyzer.HAND_RANKS.THREE_OF_A_KIND);
      expect(result[1]).toBe(14);
    });

    test('evaluates two pair correctly', () => {
      const hand = [[14,'S'], [14,'H'], [10,'D'], [10,'C'], [8,'S']];
      const result = analyzer.evaluateHand(hand);
      expect(result[0]).toBe(analyzer.HAND_RANKS.TWO_PAIR);
      expect(result[1]).toBe(14); // Higher pair
      expect(result[2]).toBe(10); // Lower pair
      expect(result[3]).toBe(8);  // Kicker
    });

    test('evaluates one pair correctly', () => {
      const hand = [[14,'S'], [14,'H'], [12,'D'], [10,'C'], [8,'S']];
      const result = analyzer.evaluateHand(hand);
      expect(result[0]).toBe(analyzer.HAND_RANKS.PAIR);
      expect(result[1]).toBe(14); // Pair value
    });

    test('evaluates high card correctly', () => {
      const hand = [[14,'S'], [12,'H'], [10,'D'], [8,'C'], [6,'S']];
      const result = analyzer.evaluateHand(hand);
      expect(result[0]).toBe(analyzer.HAND_RANKS.HIGH_CARD);
      expect(result.slice(1)).toEqual([14, 12, 10, 8, 6]);
    });
  });

  describe('Hand Comparison', () => {
    test('compares different hand ranks correctly', () => {
      const flush = analyzer.evaluateHand([[14,'S'], [12,'S'], [10,'S'], [8,'S'], [6,'S']]);
      const straight = analyzer.evaluateHand([[14,'H'], [13,'D'], [12,'C'], [11,'S'], [10,'H']]);
      expect(analyzer.compareHands(flush, straight)).toBe(1);
    });

    test('compares same hand ranks by high cards', () => {
      const highFlush = analyzer.evaluateHand([[14,'S'], [13,'S'], [11,'S'], [9,'S'], [7,'S']]);
      const lowFlush = analyzer.evaluateHand([[14,'H'], [13,'H'], [11,'H'], [9,'H'], [6,'H']]);
      expect(analyzer.compareHands(highFlush, lowFlush)).toBe(1);
    });

    test('identifies ties correctly', () => {
      const hand1 = analyzer.evaluateHand([[14,'S'], [13,'H'], [12,'D'], [11,'C'], [10,'S']]);
      const hand2 = analyzer.evaluateHand([[14,'H'], [13,'D'], [12,'C'], [11,'S'], [10,'H']]);
      expect(analyzer.compareHands(hand1, hand2)).toBe(0);
    });
  });

  describe('Best Hand Selection', () => {
    test('finds best hand from 7 cards', () => {
      const cards = [
        [14,'S'], [13,'S'], [12,'S'], [11,'S'], [10,'S'], // Royal flush
        [9,'H'], [8,'H'] // Extra cards
      ];
      const result = analyzer.findBestHand(cards, 5);
      expect(result.score[0]).toBe(analyzer.HAND_RANKS.STRAIGHT_FLUSH);
      expect(result.hand).toHaveLength(5);
    });

    test('returns null for insufficient cards', () => {
      const cards = [[14,'S'], [13,'H'], [12,'D']];
      const result = analyzer.findBestHand(cards, 5);
      expect(result).toBeNull();
    });
  });

  describe('Dealing Hands', () => {
    test('deals correct number of hands', () => {
      const result = analyzer.dealOptimalHands(deck, 4, 5);
      expect(result).toHaveLength(4);
      expect(result[0].hand).toHaveLength(5);
      expect(result[0]).toHaveProperty('score');
      expect(result[0]).toHaveProperty('rank');
    });

    test('returns null for insufficient deck', () => {
      const smallDeck = deck.slice(0, 10);
      const result = analyzer.dealOptimalHands(smallDeck, 4, 5);
      expect(result).toBeNull();
    });
  });

  describe('Utility Functions', () => {
    test('creates standard deck', () => {
      expect(deck).toHaveLength(52);
      expect(deck.filter(card => card[0] === 14)).toHaveLength(4); // 4 Aces
    });

    test('shuffles deck properly', () => {
      const originalDeck = analyzer.createDeck();
      const shuffled = analyzer.shuffleDeck(originalDeck);
      expect(shuffled).toHaveLength(52);
      expect(shuffled).not.toEqual(originalDeck); // Should be different order
    });

    test('identifies straights correctly', () => {
      expect(analyzer.isStraight([14, 13, 12, 11, 10])).toBe(true);
      expect(analyzer.isStraight([14, 5, 4, 3, 2])).toBe(true); // Ace-low
      expect(analyzer.isStraight([14, 13, 11, 10, 9])).toBe(false);
    });

    test('parses card strings correctly', () => {
      expect(analyzer.parseCard('AS')).toEqual([14, 'S']);
      expect(analyzer.parseCard('KH')).toEqual([13, 'H']);
      expect(analyzer.parseCard('10D')).toEqual([10, 'D']);
      expect(analyzer.parseCard('2C')).toEqual([2, 'C']);
    });
  });
});