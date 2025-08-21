// Card Game Study Guide - Interactive JavaScript

class CardGameStudyGuide {
    constructor() {
        this.currentSection = 'study';
        this.timer = null;
        this.timeRemaining = 600; // 10 minutes in seconds
        this.isTimerRunning = false;
        this.analyzer = new CardGameAnalyzer();
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupPracticeTests();
        this.setupTimedChallenge();
        this.setupCodeHighlighting();
        this.setupDebugFeatures();
    }

    // Navigation System
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.content-section');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetSection = btn.dataset.section;
                this.switchSection(targetSection);
            });
        });
    }

    switchSection(sectionName) {
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === sectionName) {
                btn.classList.add('active');
            }
        });

        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            
            // Re-apply syntax highlighting after section switch
            setTimeout(() => {
                this.setupCodeHighlighting();
            }, 100);
        }

        // Stop timer if switching away from timed challenge
        if (sectionName !== 'timed' && this.isTimerRunning) {
            this.stopTimer();
        }
    }

    // Practice Tests System
    setupPracticeTests() {
        const optionButtons = document.querySelectorAll('.option-btn');
        
        optionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleAnswer(e.target);
            });
        });
    }

    handleAnswer(selectedButton) {
        const question = selectedButton.closest('.test-question');
        const options = question.querySelectorAll('.option-btn');
        const explanation = question.querySelector('.explanation');
        
        // Disable all options
        options.forEach(option => {
            option.disabled = true;
            option.style.pointerEvents = 'none';
        });

        // Mark correct/incorrect
        options.forEach(option => {
            if (option.dataset.correct === 'true') {
                option.classList.add('correct');
            } else if (option === selectedButton && option.dataset.correct === 'false') {
                option.classList.add('incorrect');
            }
        });

        // Show explanation
        explanation.classList.remove('hidden');

        // Add success/error styling to question
        if (selectedButton.dataset.correct === 'true') {
            question.classList.add('success');
        } else {
            question.classList.add('error');
        }
    }

    // Timed Challenge System
    setupTimedChallenge() {
        const startBtn = document.querySelector('.start-btn');
        const resetBtn = document.querySelector('.reset-btn');
        const challengeCode = document.getElementById('challenge-code');

        startBtn.addEventListener('click', () => {
            this.startTimer();
        });

        resetBtn.addEventListener('click', () => {
            this.resetChallenge();
        });

        // Auto-save code every 30 seconds
        setInterval(() => {
            if (this.isTimerRunning) {
                localStorage.setItem('challengeCode', challengeCode.value);
            }
        }, 30000);

        // Load saved code if available
        const savedCode = localStorage.getItem('challengeCode');
        if (savedCode) {
            challengeCode.value = savedCode;
        }
    }

    startTimer() {
        if (this.isTimerRunning) return;

        this.isTimerRunning = true;
        const startBtn = document.querySelector('.start-btn');
        const resetBtn = document.querySelector('.reset-btn');
        const challengeCode = document.getElementById('challenge-code');

        startBtn.classList.add('hidden');
        resetBtn.classList.remove('hidden');
        challengeCode.focus();

        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();

            if (this.timeRemaining <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isTimerRunning = false;
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const timeDisplay = document.querySelector('.time-remaining');
        
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Color coding for time
        if (this.timeRemaining <= 60) { // Last minute
            timeDisplay.style.color = '#f44747'; // Red
        } else if (this.timeRemaining <= 180) { // Last 3 minutes
            timeDisplay.style.color = '#d7ba7d'; // Warning
        }
    }

    timeUp() {
        this.stopTimer();
        this.showResults();
        
        const timeDisplay = document.querySelector('.time-remaining');
        timeDisplay.textContent = 'TIME\'S UP!';
        timeDisplay.style.color = '#f44747';
        
        // Disable code editor
        const challengeCode = document.getElementById('challenge-code');
        challengeCode.disabled = true;
        challengeCode.style.opacity = '0.6';
    }

    resetChallenge() {
        this.stopTimer();
        this.timeRemaining = 600;
        this.updateTimerDisplay();
        
        const startBtn = document.querySelector('.start-btn');
        const resetBtn = document.querySelector('.reset-btn');
        const challengeCode = document.getElementById('challenge-code');
        const results = document.querySelector('.challenge-results');

        startBtn.classList.remove('hidden');
        resetBtn.classList.add('hidden');
        challengeCode.disabled = false;
        challengeCode.style.opacity = '1';
        results.classList.add('hidden');
        
        // Clear saved code
        localStorage.removeItem('challengeCode');
        challengeCode.value = '';
    }

    showResults() {
        const results = document.querySelector('.challenge-results');
        const testResults = document.getElementById('test-results');
        const challengeCode = document.getElementById('challenge-code').value;

        if (!challengeCode.trim()) {
            testResults.innerHTML = '<p style="color: #f44747;">No code submitted!</p>';
            results.classList.remove('hidden');
            return;
        }

        try {
            // Create a safe evaluation environment
            const testResults = this.runTests(challengeCode);
            this.displayResults(testResults);
        } catch (error) {
            testResults.innerHTML = `<p style="color: #f44747;">Error: ${error.message}</p>`;
        }

        results.classList.remove('hidden');
    }

    runTests(code) {
        const results = [];
        
        try {
            // Create a function from the code
            const evaluateHand = new Function('hand', code);
            
            // Test cases
            const testCases = [
                {
                    name: 'Royal Flush',
                    input: [[14,'S'], [13,'S'], [12,'S'], [11,'S'], [10,'S']],
                    expected: [8, 14],
                    description: 'Should return [8, 14] for Royal Flush'
                },
                {
                    name: 'Four of a Kind',
                    input: [[14,'S'], [14,'H'], [14,'D'], [14,'C'], [10,'S']],
                    expected: [7, 14, 10],
                    description: 'Should return [7, 14, 10] for Four of a Kind'
                },
                {
                    name: 'Full House',
                    input: [[14,'S'], [14,'H'], [14,'D'], [10,'C'], [10,'S']],
                    expected: [6, 14, 10],
                    description: 'Should return [6, 14, 10] for Full House'
                },
                {
                    name: 'Flush',
                    input: [[14,'S'], [12,'S'], [10,'S'], [8,'S'], [6,'S']],
                    expected: [5, 14, 12, 10, 8, 6],
                    description: 'Should return [5, 14, 12, 10, 8, 6] for Flush'
                },
                {
                    name: 'Straight',
                    input: [[14,'S'], [13,'H'], [12,'D'], [11,'C'], [10,'S']],
                    expected: [4, 14],
                    description: 'Should return [4, 14] for Straight'
                },
                {
                    name: 'Invalid Input',
                    input: null,
                    expected: [0],
                    description: 'Should handle invalid input gracefully'
                }
            ];

            testCases.forEach((testCase, index) => {
                try {
                    const result = evaluateHand(testCase.input);
                    const passed = this.arraysEqual(result, testCase.expected);
                    
                    results.push({
                        name: testCase.name,
                        passed,
                        input: testCase.input,
                        expected: testCase.expected,
                        actual: result,
                        description: testCase.description
                    });
                } catch (error) {
                    results.push({
                        name: testCase.name,
                        passed: false,
                        error: error.message,
                        description: testCase.description
                    });
                }
            });

        } catch (error) {
            results.push({
                name: 'Code Compilation',
                passed: false,
                error: error.message,
                description: 'Code failed to compile'
            });
        }

        return results;
    }

    arraysEqual(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) return false;
        if (a.length !== b.length) return false;
        
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    displayResults(results) {
        const testResults = document.getElementById('test-results');
        let html = '<div class="test-results-summary">';
        
        const passed = results.filter(r => r.passed).length;
        const total = results.length;
        
        html += `<h4>Test Results: ${passed}/${total} Passed</h4>`;
        
        results.forEach(result => {
            const statusClass = result.passed ? 'success' : 'error';
            const statusIcon = result.passed ? '✅' : '❌';
            
            html += `<div class="test-result ${statusClass}">`;
            html += `<h5>${statusIcon} ${result.name}</h5>`;
            html += `<p>${result.description}</p>`;
            
            if (result.error) {
                html += `<p class="error-message">Error: ${result.error}</p>`;
            } else if (!result.passed) {
                html += `<p>Expected: [${result.expected.join(', ')}]</p>`;
                html += `<p>Actual: [${result.actual.join(', ')}]</p>`;
            }
            
            html += '</div>';
        });
        
        html += '</div>';
        testResults.innerHTML = html;
    }

    // Code Syntax Highlighting
    setupCodeHighlighting() {
        // Basic syntax highlighting for code blocks
        const codeBlocks = document.querySelectorAll('pre code.javascript');
        
        console.log(`Found ${codeBlocks.length} JavaScript code blocks to highlight`);
        
        if (codeBlocks.length === 0) {
            console.warn('No JavaScript code blocks found!');
            // Try alternative selectors
            const altBlocks = document.querySelectorAll('code');
            console.log(`Found ${altBlocks.length} total code blocks`);
            altBlocks.forEach((block, index) => {
                console.log(`Code block ${index + 1}:`, block.className, block.textContent.substring(0, 50));
            });
        }
        
        codeBlocks.forEach((block, index) => {
            console.log(`Highlighting code block ${index + 1}:`, block.textContent.substring(0, 50));
            this.highlightSyntax(block);
        });
        
        // Also highlight code blocks that might be added dynamically
        this.observeCodeBlocks();
    }
    
    setupDebugFeatures() {
        const debugBtn = document.getElementById('debug-highlight');
        const testBtn = document.getElementById('test-highlight');
        
        if (debugBtn) {
            debugBtn.addEventListener('click', () => {
                console.log('🔍 Debug: Manually triggering syntax highlighting...');
                this.setupCodeHighlighting();
            });
        }
        
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                console.log('🧪 Test: Creating test code block...');
                this.createTestCodeBlock();
            });
        }
        
        // Add a simple test button to verify highlighting works
        const simpleTestBtn = document.createElement('button');
        simpleTestBtn.textContent = '🧪 Simple Test';
        simpleTestBtn.style.cssText = 'background: #4ec9b0; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;';
        simpleTestBtn.addEventListener('click', () => {
            console.log('🧪 Simple Test: Testing basic highlighting...');
            this.testBasicHighlighting();
        });
        
        // Insert after the existing buttons
        const nav = document.querySelector('.app-nav');
        if (nav) {
            nav.appendChild(simpleTestBtn);
        }
    }
    
    testBasicHighlighting() {
        // Create a comprehensive test element matching VSCode Dark theme
        const testDiv = document.createElement('div');
        testDiv.innerHTML = `
            <pre><code class="javascript">class CardGameAnalyzer {
  constructor() {
    this.HAND_RANKS = {
      STRAIGHT_FLUSH: 8,
      FOUR_OF_A_KIND: 7,
      FULL_HOUSE: 6
    };
  }

  evaluateHand(hand) {
    if (!hand || hand.length !== 5) return [this.HAND_RANKS.HIGH_CARD];
    
    const values = hand.map(card => card[0]).sort((a, b) => b - a);
    const suits = hand.map(card => card[1]);
    
    // Return hand strength vector [type, highCard, kickers...]
    if (isFlush && isStraight) return [8, Math.max(...values)];
    
    return [0, ...values];
  }
}</code></pre>
        `;
        testDiv.style.position = 'fixed';
        testDiv.style.top = '10px';
        testDiv.style.right = '10px';
        testDiv.style.background = '#1e1e1e';
        testDiv.style.padding = '20px';
        testDiv.style.border = '2px solid #3c3c3c';
        testDiv.style.borderRadius = '8px';
        testDiv.style.zIndex = '9999';
        testDiv.style.maxWidth = '500px';
        testDiv.style.fontFamily = 'Consolas, Monaco, monospace';
        testDiv.style.fontSize = '14px';
        testDiv.style.lineHeight = '1.4';
        
        document.body.appendChild(testDiv);
        
        // Test highlighting
        const testCode = testDiv.querySelector('code.javascript');
        if (testCode) {
            console.log('Testing comprehensive highlighting...');
            this.highlightSyntax(testCode);
            
            // Remove after 10 seconds
            setTimeout(() => {
                document.body.removeChild(testDiv);
            }, 10000);
        }
    }
    
    createTestCodeBlock() {
        // Create a test code block to verify highlighting works
        const testSection = document.querySelector('.study-content');
        if (testSection) {
            const testCard = document.createElement('div');
            testCard.className = 'concept-card';
            testCard.innerHTML = `
                <h3>🧪 Test Code Block</h3>
                <div class="code-block">
                    <div class="code-header">Test JavaScript Code</div>
                    <pre><code class="javascript">// This is a test comment
const testFunction = () => {
  const numbers = [1, 2, 3, 4, 5];
  return numbers.map(n => n * 2);
};

console.log("Hello World");
const result = testFunction();</code></pre>
                </div>
            `;
            
            testSection.appendChild(testCard);
            
            // Highlight the new code block
            setTimeout(() => {
                const newCodeBlock = testCard.querySelector('pre code.javascript');
                if (newCodeBlock) {
                    console.log('Highlighting new test code block...');
                    this.highlightSyntax(newCodeBlock);
                    
                    // Verify highlighting worked
                    const spans = newCodeBlock.querySelectorAll('span');
                    console.log(`Test code block has ${spans.length} highlighted elements`);
                    spans.forEach((span, i) => {
                        if (i < 3) console.log(`Span ${i}: class="${span.className}", text="${span.textContent}"`);
                    });
                }
            }, 100);
        }
    }
    
    observeCodeBlocks() {
        // Use MutationObserver to highlight new code blocks
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const newCodeBlocks = node.querySelectorAll ? node.querySelectorAll('pre code.javascript') : [];
                        newCodeBlocks.forEach(block => {
                            this.highlightSyntax(block);
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    highlightSyntax(codeBlock) {
        if (!codeBlock || !codeBlock.textContent) {
            console.log('Code block is empty or invalid');
            return;
        }
        
        // Get the raw text content
        let code = codeBlock.textContent;
        console.log('Original code:', code.substring(0, 100) + '...');
        
        // Create a new document fragment to avoid HTML escaping issues
        const fragment = document.createDocumentFragment();
        
        // Comprehensive token types matching VSCode Dark theme
        const keywords = [
            'class', 'constructor', 'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 
            'return', 'this', 'new', 'typeof', 'instanceof', 'in', 'of', 'try', 'catch', 'finally', 
            'throw', 'switch', 'case', 'default', 'break', 'continue', 'do', 'with', 'yield', 
            'async', 'await', 'static', 'extends', 'super', 'import', 'export', 'from', 'as'
        ];
        
        const builtinFunctions = [
            'map', 'filter', 'reduce', 'forEach', 'slice', 'splice', 'push', 'pop', 'shift', 'unshift', 
            'join', 'split', 'sort', 'reverse', 'indexOf', 'lastIndexOf', 'includes', 'find', 'findIndex', 
            'some', 'every', 'flatMap', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'eval', 'setTimeout', 
            'setInterval', 'clearTimeout', 'clearInterval'
        ];
        
        const builtinObjects = [
            'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'Math', 'JSON', 'Promise', 
            'RegExp', 'Error', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Symbol', 'Proxy', 'Reflect'
        ];
        
        const builtinProperties = [
            'length', 'prototype', 'constructor', 'name', 'message', 'stack', 'valueOf', 'toString'
        ];
        
        // Process the code line by line for better comment handling
        const lines = code.split('\n');
        
        lines.forEach((line, lineIndex) => {
            let i = 0;
            const lineFragment = document.createDocumentFragment();
            
            while (i < line.length) {
                let token = '';
                let tokenType = 'text';
                
                // Check for comments (single line)
                if (line.substring(i, i + 2) === '//') {
                    token = line.substring(i);
                    tokenType = 'comment';
                    i = line.length; // End of line
                }
                // Check for strings (both single and double quotes)
                else if (line[i] === "'" || line[i] === '"') {
                    const quote = line[i];
                    token = quote;
                    i++;
                    while (i < line.length && line[i] !== quote) {
                        token += line[i];
                        i++;
                    }
                    if (i < line.length) {
                        token += line[i];
                        i++;
                    }
                    tokenType = 'string';
                }
                // Check for template literals
                else if (line.substring(i, i + 2) === '`') {
                    token = '`';
                    i += 2;
                    while (i < line.length && line.substring(i, i + 2) !== '`') {
                        token += line[i];
                        i++;
                    }
                    if (i < line.length) {
                        token += '`';
                        i += 2;
                    }
                    tokenType = 'string';
                }
                // Check for numbers (including decimals and hex)
                else if (/\d/.test(line[i])) {
                    while (i < line.length && /[\d.]/.test(line[i])) {
                        token += line[i];
                        i++;
                    }
                    tokenType = 'number';
                }
                // Check for identifiers (keywords, functions, variables)
                else if (/[a-zA-Z_$]/.test(line[i])) {
                    while (i < line.length && /[a-zA-Z0-9_$]/.test(line[i])) {
                        token += line[i];
                        i++;
                    }
                    
                    if (keywords.includes(token)) {
                        tokenType = 'keyword';
                    } else if (builtinFunctions.includes(token)) {
                        tokenType = 'function';
                    } else if (builtinObjects.includes(token)) {
                        tokenType = 'class';
                    } else if (builtinProperties.includes(token)) {
                        tokenType = 'property';
                    } else if (token.length > 1) {
                        // Check if it's a function call pattern
                        if (i < line.length && line[i] === '(') {
                            tokenType = 'function';
                        } else {
                            tokenType = 'variable';
                        }
                    }
                }
                // Check for operators and punctuation
                else if (/[+\-*/%=<>!&|^~?:]/.test(line[i])) {
                    // Handle multi-character operators
                    if (line.substring(i, i + 2) === '===' || line.substring(i, i + 2) === '!==' || 
                        line.substring(i, i + 2) === '&&' || line.substring(i, i + 2) === '||' ||
                        line.substring(i, i + 2) === '=>' || line.substring(i, i + 2) === '++' ||
                        line.substring(i, i + 2) === '--' || line.substring(i, i + 2) === '**') {
                        token = line.substring(i, i + 2);
                        i += 2;
                    } else {
                        token = line[i];
                        i++;
                    }
                    tokenType = 'operator';
                }
                // Other characters (punctuation, brackets, etc.)
                else {
                    token = line[i];
                    i++;
                    tokenType = 'punctuation';
                }
                
                // Create the appropriate span element
                if (tokenType === 'text') {
                    lineFragment.appendChild(document.createTextNode(token));
                } else {
                    const span = document.createElement('span');
                    span.className = tokenType;
                    span.textContent = token;
                    lineFragment.appendChild(span);
                }
            }
            
            // Add the line to the fragment
            fragment.appendChild(lineFragment);
            
            // Add line break (except for the last line)
            if (lineIndex < lines.length - 1) {
                fragment.appendChild(document.createTextNode('\n'));
            }
        });
        
        // Clear the code block and append the fragment
        codeBlock.innerHTML = '';
        codeBlock.appendChild(fragment);
        
        // Verify highlighting was applied
        const highlightedElements = codeBlock.querySelectorAll('span');
        console.log(`Applied highlighting to ${highlightedElements.length} elements`);
        
        // Debug: log what we actually inserted
        highlightedElements.forEach((span, index) => {
            if (index < 10) { // Log first 10 for debugging
                console.log(`Span ${index}: class="${span.className}", text="${span.textContent}"`);
            }
        });
    }
}

// CardGameAnalyzer Class (Reference Implementation)
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
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing study guide...');
    
    // Wait a bit more to ensure everything is ready
    setTimeout(() => {
        const studyGuide = new CardGameStudyGuide();
        
        // Make instance globally accessible for debugging
        window.studyGuideInstance = studyGuide;
        
        // Add some interactive features
        console.log('🎯 Card Game Study Guide loaded successfully!');
        console.log('📚 Navigate through the sections to study, practice, and challenge yourself.');
        console.log('⏱️ Try the 10-minute timed challenge to test your skills!');
        
        // Force a re-render and then apply highlighting
        setTimeout(() => {
            console.log('Applying syntax highlighting...');
            studyGuide.setupCodeHighlighting();
        }, 500);
        
    }, 300);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + 1-4 for quick navigation
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const sections = ['study', 'practice', 'timed', 'review'];
        const sectionIndex = parseInt(e.key) - 1;
        if (sections[sectionIndex]) {
            document.querySelector(`[data-section="${sections[sectionIndex]}"]`).click();
        }
    }
    
    // Space to start/stop timer in timed challenge
    if (e.code === 'Space' && document.getElementById('timed').classList.contains('active')) {
        e.preventDefault();
        if (document.querySelector('.start-btn:not(.hidden)')) {
            document.querySelector('.start-btn').click();
        } else if (document.querySelector('.reset-btn:not(.hidden)')) {
            document.querySelector('.reset-btn').click();
        }
    }
});

// Add progress tracking
class ProgressTracker {
    constructor() {
        this.progress = JSON.parse(localStorage.getItem('studyProgress')) || {
            completedTests: 0,
            totalTests: 0,
            bestTime: null,
            studyTime: 0
        };
        
        this.startTime = Date.now();
        this.updateProgress();
    }
    
    updateProgress() {
        // Update study time
        const currentTime = Date.now();
        this.progress.studyTime += currentTime - this.startTime;
        this.startTime = currentTime;
        
        localStorage.setItem('studyProgress', JSON.stringify(this.progress));
    }
    
    completeTest(correct, total) {
        this.progress.completedTests += correct;
        this.progress.totalTests += total;
        this.updateProgress();
    }
    
    setBestTime(time) {
        if (!this.progress.bestTime || time < this.progress.bestTime) {
            this.progress.bestTime = time;
            this.updateProgress();
        }
    }
}

// Initialize progress tracking
const progressTracker = new ProgressTracker();

// Update progress every minute
setInterval(() => {
    progressTracker.updateProgress();
}, 60000);


