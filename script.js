// --- THEME LOGIC ---
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    } else {
        icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    }
}
// --- EPSILON INSERTION LOGIC ---
function insertEpsilon() {
    const input = document.getElementById('grammar-input');
    
    // Get current cursor position
    const start = input.selectionStart;
    const end = input.selectionEnd;
    
    // Insert 'ε' at the cursor position (replaces highlighted text if any)
    input.setRangeText('ε', start, end, 'end');
    
    // Bring focus back to the textarea so the user can keep typing immediately
    input.focus();
}
// --- 1. CORE DATA STRUCTURES ---
class Grammar {
    constructor() {
        this.rules = new Map();
        this.startSymbol = null;
        this.terminals = new Set();
        this.nonTerminals = new Set();
    }

    clone() {
        const g = new Grammar();
        g.startSymbol = this.startSymbol;
        g.terminals = new Set(this.terminals);
        g.nonTerminals = new Set(this.nonTerminals);
        for (let [nt, prods] of this.rules) {
            g.rules.set(nt, prods.map(p => [...p]));
        }
        return g;
    }

    addRule(lhs, rhsArray) {
        if (!this.rules.has(lhs)) this.rules.set(lhs, []);
        this.nonTerminals.add(lhs);
        
        const exists = this.rules.get(lhs).some(p => p.join(' ') === rhsArray.join(' '));
        if (!exists) {
            this.rules.get(lhs).push(rhsArray);
        }
        
        rhsArray.forEach(sym => {
            if (sym !== 'eps' && sym !== 'ε') {
                if (isTerminal(sym)) this.terminals.add(sym);
                else this.nonTerminals.add(sym);
            }
        });
    }
}

const isTerminal = (sym) => /^[a-z0-9\W_]$/.test(sym) && sym !== 'eps' && sym !== 'ε';
const isNonTerminal = (sym) => /^[A-Z][0-9]*_?[A-Z0-9]*$/.test(sym) || sym.startsWith('S0') || sym.startsWith('Z_') || sym.startsWith('X_') || sym.startsWith('P_');

function parseGrammar(text) {
    const lines = text.trim().split('\n');
    const g = new Grammar();
    
    lines.forEach(line => {
        if (!line.trim() || line.trim().startsWith('//')) return;
        
        let parts = line.split(/->|→/);
        if (parts.length !== 2) throw new Error(`Invalid syntax: ${line}. Use '->' or '→'`);
        
        let lhs = parts[0].trim();
        if (!isNonTerminal(lhs)) throw new Error(`LHS must be a non-terminal: ${lhs}`);
        if (!g.startSymbol) g.startSymbol = lhs;
        
        let rawRhs = parts[1].split('|');
        rawRhs.forEach(rhsStr => {
            // Updated Tokenizer: Extracts 'eps', 'ε', Variables, or single characters
            let symbols = rhsStr.match(/(eps|ε|[A-Z][0-9_]*|[^\s])/g) || [];
            
            // Normalize 'eps' to 'ε' universally
            symbols = symbols.map(sym => sym === 'eps' ? 'ε' : sym);
            
            if(symbols.length === 0) symbols = ['ε'];
            g.addRule(lhs, symbols);
        });
    });
    if (!g.startSymbol) throw new Error("Grammar is empty.");
    return g;
}

// --- 2. CHOMSKY NORMAL FORM (CNF) ALGORITHM ---
function* cnfGenerator(initialGrammar) {
    let g = initialGrammar.clone();
    yield { step: "Parsed Input", grammar: g.clone() };

    let needsNewStart = false;
    for (let [nt, prods] of g.rules) {
        for(let p of prods) {
            if(p.includes(g.startSymbol)) { needsNewStart = true; break; }
        }
    }
    if(needsNewStart) {
        let tempRules = new Map();
        tempRules.set('S0', [[g.startSymbol]]);
        for(let [k,v] of g.rules) tempRules.set(k, v);
        g.rules = tempRules;
        g.startSymbol = 'S0';
        g.nonTerminals.add('S0');
        yield { step: "Isolated Start Symbol", grammar: g.clone() };
    }

    let nullable = new Set();
    let changed = true;
    while(changed) {
        changed = false;
        for (let [nt, prods] of g.rules) {
            if (nullable.has(nt)) continue;
            for (let p of prods) {
                if (p.length === 1 && (p[0] === 'eps' || p[0] === 'ε')) {
                    nullable.add(nt); changed = true; break;
                }
                if (p.every(sym => nullable.has(sym))) {
                    nullable.add(nt); changed = true; break;
                }
            }
        }
    }

    for (let [nt, prods] of g.rules) {
        let newProds = [];
        for (let p of prods) {
            if (p.length === 1 && (p[0] === 'eps' || p[0] === 'ε')) continue; 
            let nullableIndices = [];
            p.forEach((sym, idx) => { if(nullable.has(sym)) nullableIndices.push(idx); });
            let combinations = 1 << nullableIndices.length;
            for (let mask = 0; mask < combinations; mask++) {
                let newP = [];
                for (let i = 0; i < p.length; i++) {
                    let nullIdx = nullableIndices.indexOf(i);
                    if (nullIdx !== -1) {
                        if ((mask & (1 << nullIdx)) === 0) newP.push(p[i]);
                    } else {
                        newP.push(p[i]);
                    }
                }
                if (newP.length > 0) newProds.push(newP);
            }
        }
        g.rules.set(nt, newProds);
    }
    for (let [nt, prods] of g.rules) {
        g.rules.set(nt, Array.from(new Set(prods.map(JSON.stringify))).map(JSON.parse));
    }
    if(nullable.has(g.startSymbol)) g.addRule(g.startSymbol, ['ε']);
    yield { step: "Eliminated Epsilons", grammar: g.clone() };

    for (let nt of g.nonTerminals) {
        let reachable = new Set([nt]);
        let queue = [nt];
        while(queue.length > 0) {
            let curr = queue.shift();
            let prods = g.rules.get(curr) || [];
            for (let p of prods) {
                if (p.length === 1 && g.nonTerminals.has(p[0]) && !reachable.has(p[0])) {
                    reachable.add(p[0]);
                    queue.push(p[0]);
                }
            }
        }
        let newProds = g.rules.get(nt) ? g.rules.get(nt).filter(p => p.length !== 1 || !g.nonTerminals.has(p[0])) : [];
        for (let r of reachable) {
            if (r === nt) continue;
            let rProds = g.rules.get(r) || [];
            for(let p of rProds) {
                if (p.length !== 1 || !g.nonTerminals.has(p[0])) newProds.push(p);
            }
        }
        g.rules.set(nt, newProds);
    }
    for (let [nt, prods] of g.rules) {
        g.rules.set(nt, Array.from(new Set(prods.map(JSON.stringify))).map(JSON.parse));
    }
    yield { step: "Eliminated Unit Rules", grammar: g.clone() };

    let generating = new Set(['eps', 'ε', ...g.terminals]);
    changed = true;
    while(changed) {
        changed = false;
        for (let [nt, prods] of g.rules) {
            if(generating.has(nt)) continue;
            for (let p of prods) {
                if (p.every(sym => generating.has(sym) || isTerminal(sym))) {
                    generating.add(nt); changed = true; break;
                }
            }
        }
    }
    for (let nt of g.nonTerminals) {
        if (!generating.has(nt)) g.rules.delete(nt);
        else g.rules.set(nt, g.rules.get(nt).filter(p => p.every(sym => generating.has(sym) || isTerminal(sym))));
    }
    
    let reachable = new Set([g.startSymbol]);
    let rQueue = [g.startSymbol];
    while(rQueue.length > 0) {
        let curr = rQueue.shift();
        let prods = g.rules.get(curr) || [];
        for(let p of prods) {
            for(let sym of p) {
                if(g.nonTerminals.has(sym) && !reachable.has(sym)) {
                    reachable.add(sym); rQueue.push(sym);
                }
            }
        }
    }
    for (let [nt, prods] of g.rules) {
        if(!reachable.has(nt)) g.rules.delete(nt);
    }
    g.nonTerminals = new Set([...g.rules.keys()]);
    yield { step: "Eliminated Useless", grammar: g.clone() };

    let termMap = new Map();
    for (let [nt, prods] of g.rules) {
        let newProds = [];
        for (let p of prods) {
            if (p.length > 1) {
                let newP = p.map(sym => {
                    if (isTerminal(sym)) {
                        if (!termMap.has(sym)) {
                            let newV = `X_${sym}`;
                            termMap.set(sym, newV);
                            g.nonTerminals.add(newV);
                        }
                        return termMap.get(sym);
                    }
                    return sym;
                });
                newProds.push(newP);
            } else {
                newProds.push(p);
            }
        }
        g.rules.set(nt, newProds);
    }
    for (let [term, newV] of termMap) {
        g.rules.set(newV, [[term]]);
    }
    yield { step: "Isolated Terminals", grammar: g.clone() };

    let pIdx = 1;
    let finalRules = new Map();
    for(let [nt, prods] of g.rules) {
        let finalProds = [];
        for(let p of prods) {
            if(p.length > 2) {
                let remainder = [...p];
                let first = remainder.shift();
                let currentVar = `P_${pIdx++}`;
                finalProds.push([first, currentVar]);
                g.nonTerminals.add(currentVar);
                
                while(remainder.length > 2) {
                    let nextFirst = remainder.shift();
                    let nextVar = `P_${pIdx++}`;
                    g.nonTerminals.add(nextVar);
                    if(!finalRules.has(currentVar)) finalRules.set(currentVar, []);
                    finalRules.get(currentVar).push([nextFirst, nextVar]);
                    currentVar = nextVar;
                }
                if(!finalRules.has(currentVar)) finalRules.set(currentVar, []);
                finalRules.get(currentVar).push(remainder);
                
            } else {
                finalProds.push(p);
            }
        }
        finalRules.set(nt, finalProds);
    }
    g.rules = finalRules;
    
    yield { step: "Binarized Rules (CNF)", grammar: g.clone() };
    return g;
}

// --- 3. GREIBACH NORMAL FORM (GNF) ALGORITHM (INDEPENDENT) ---
function* gnfGenerator(initialGrammar) {
    let g = initialGrammar.clone();
    yield { step: "Parsed Input", grammar: g.clone() };

    let needsNewStart = false;
    for (let [nt, prods] of g.rules) {
        for(let p of prods) {
            if(p.includes(g.startSymbol)) { needsNewStart = true; break; }
        }
    }
    if(needsNewStart) {
        let tempRules = new Map();
        tempRules.set('S0', [[g.startSymbol]]);
        for(let [k,v] of g.rules) tempRules.set(k, v);
        g.rules = tempRules;
        g.startSymbol = 'S0';
        g.nonTerminals.add('S0');
        yield { step: "Prep: Isolate Start", grammar: g.clone() };
    }

    let nullable = new Set();
    let changed = true;
    while(changed) {
        changed = false;
        for (let [nt, prods] of g.rules) {
            if (nullable.has(nt)) continue;
            for (let p of prods) {
                if (p.length === 1 && (p[0] === 'eps' || p[0] === 'ε')) {
                    nullable.add(nt); changed = true; break;
                }
                if (p.every(sym => nullable.has(sym))) {
                    nullable.add(nt); changed = true; break;
                }
            }
        }
    }

    for (let [nt, prods] of g.rules) {
        let newProds = [];
        for (let p of prods) {
            if (p.length === 1 && (p[0] === 'eps' || p[0] === 'ε')) continue; 
            let nullableIndices = [];
            p.forEach((sym, idx) => { if(nullable.has(sym)) nullableIndices.push(idx); });
            let combinations = 1 << nullableIndices.length;
            for (let mask = 0; mask < combinations; mask++) {
                let newP = [];
                for (let i = 0; i < p.length; i++) {
                    let nullIdx = nullableIndices.indexOf(i);
                    if (nullIdx !== -1) {
                        if ((mask & (1 << nullIdx)) === 0) newP.push(p[i]);
                    } else {
                        newP.push(p[i]);
                    }
                }
                if (newP.length > 0) newProds.push(newP);
            }
        }
        g.rules.set(nt, newProds);
    }
    for (let [nt, prods] of g.rules) {
        g.rules.set(nt, Array.from(new Set(prods.map(JSON.stringify))).map(JSON.parse));
    }
    if(nullable.has(g.startSymbol)) g.addRule(g.startSymbol, ['ε']);
    yield { step: "Prep: Eliminated Epsilons", grammar: g.clone() };

    for (let nt of g.nonTerminals) {
        let reachable = new Set([nt]);
        let queue = [nt];
        while(queue.length > 0) {
            let curr = queue.shift();
            let prods = g.rules.get(curr) || [];
            for (let p of prods) {
                if (p.length === 1 && g.nonTerminals.has(p[0]) && !reachable.has(p[0])) {
                    reachable.add(p[0]);
                    queue.push(p[0]);
                }
            }
        }
        let newProds = g.rules.get(nt) ? g.rules.get(nt).filter(p => p.length !== 1 || !g.nonTerminals.has(p[0])) : [];
        for (let r of reachable) {
            if (r === nt) continue;
            let rProds = g.rules.get(r) || [];
            for(let p of rProds) {
                if (p.length !== 1 || !g.nonTerminals.has(p[0])) newProds.push(p);
            }
        }
        g.rules.set(nt, newProds);
    }
    for (let [nt, prods] of g.rules) {
        g.rules.set(nt, Array.from(new Set(prods.map(JSON.stringify))).map(JSON.parse));
    }
    yield { step: "Prep: Eliminated Units", grammar: g.clone() };

    let generating = new Set(['eps', 'ε', ...g.terminals]);
    changed = true;
    while(changed) {
        changed = false;
        for (let [nt, prods] of g.rules) {
            if(generating.has(nt)) continue;
            for (let p of prods) {
                if (p.every(sym => generating.has(sym) || isTerminal(sym))) {
                    generating.add(nt); changed = true; break;
                }
            }
        }
    }
    for (let nt of g.nonTerminals) {
        if (!generating.has(nt)) g.rules.delete(nt);
        else g.rules.set(nt, g.rules.get(nt).filter(p => p.every(sym => generating.has(sym) || isTerminal(sym))));
    }
    let reachable = new Set([g.startSymbol]);
    let rQueue = [g.startSymbol];
    while(rQueue.length > 0) {
        let curr = rQueue.shift();
        let prods = g.rules.get(curr) || [];
        for(let p of prods) {
            for(let sym of p) {
                if(g.nonTerminals.has(sym) && !reachable.has(sym)) {
                    reachable.add(sym); rQueue.push(sym);
                }
            }
        }
    }
    for (let [nt, prods] of g.rules) {
        if(!reachable.has(nt)) g.rules.delete(nt);
    }
    g.nonTerminals = new Set([...g.rules.keys()]);
    yield { step: "Prep: Eliminated Useless", grammar: g.clone() };

    let orderArr = Array.from(g.nonTerminals).filter(nt => g.rules.has(nt));
    orderArr = orderArr.filter(nt => nt !== g.startSymbol);
    orderArr.unshift(g.startSymbol);
    
    let orderMap = new Map();
    orderArr.forEach((nt, idx) => orderMap.set(nt, idx + 1));
    yield { step: "GNF: Ordered Variables", grammar: g.clone() };

    for (let i = 0; i < orderArr.length; i++) {
        let Ai = orderArr[i];
        
        changed = true;
        while(changed) {
            changed = false;
            let newProds = [];
            for(let p of g.rules.get(Ai)) {
                let first = p[0];
                if (g.nonTerminals.has(first) && orderMap.has(first) && orderMap.get(first) < orderMap.get(Ai)) {
                    changed = true;
                    let subProds = g.rules.get(first) || [];
                    for (let sub of subProds) {
                        newProds.push([...sub, ...p.slice(1)]);
                    }
                } else {
                    newProds.push(p);
                }
            }
            g.rules.set(Ai, newProds);
        }

        let recursive = [];
        let nonRecursive = [];
        for(let p of g.rules.get(Ai)) {
            if (p[0] === Ai) recursive.push(p.slice(1));
            else nonRecursive.push(p);
        }

        if (recursive.length > 0) {
            let Zi = `Z_${Ai}`;
            g.nonTerminals.add(Zi);
            let newAiProds = [];
            let newZiProds = [];

            for(let nr of nonRecursive) {
                newAiProds.push([...nr]);
                newAiProds.push([...nr, Zi]);
            }
            if (nonRecursive.length === 0) newAiProds.push([Zi]);

            for(let r of recursive) {
                newZiProds.push([...r]);
                newZiProds.push([...r, Zi]);
            }

            g.rules.set(Ai, newAiProds);
            g.rules.set(Zi, newZiProds);
            yield { step: `GNF: Resolved Recursion ${Ai}`, grammar: g.clone() };
        }
    }

    for (let i = orderArr.length - 1; i >= 0; i--) {
        let Ai = orderArr[i];
        let newProds = [];
        for (let p of g.rules.get(Ai)) {
            let first = p[0];
            if (g.nonTerminals.has(first) && orderMap.has(first) && orderMap.get(first) > orderMap.get(Ai)) {
                let subProds = g.rules.get(first) || [];
                for (let sub of subProds) {
                    newProds.push([...sub, ...p.slice(1)]);
                }
            } else {
                newProds.push(p);
            }
        }
        g.rules.set(Ai, newProds);
    }
    yield { step: "GNF: Backward Substitution", grammar: g.clone() };

    let zVars = Array.from(g.nonTerminals).filter(nt => nt.startsWith('Z_'));
    for (let Zi of zVars) {
        let newProds = [];
        for (let p of g.rules.get(Zi)) {
            let first = p[0];
            if (g.nonTerminals.has(first) && orderMap.has(first)) {
                let subProds = g.rules.get(first) || [];
                for (let sub of subProds) {
                    newProds.push([...sub, ...p.slice(1)]);
                }
            } else {
                newProds.push(p);
            }
        }
        g.rules.set(Zi, newProds);
    }

    let termMap = new Map();
    for (let [nt, prods] of g.rules) {
        let newProds = [];
        for (let p of prods) {
            if (p.length > 1) {
                let newP = [p[0]]; 
                for(let i = 1; i < p.length; i++) {
                    let sym = p[i];
                    if (isTerminal(sym)) {
                        if (!termMap.has(sym)) {
                            let newV = `X_${sym}`;
                            termMap.set(sym, newV);
                            g.nonTerminals.add(newV);
                        }
                        newP.push(termMap.get(sym));
                    } else {
                        newP.push(sym);
                    }
                }
                newProds.push(newP);
            } else {
                newProds.push(p);
            }
        }
        g.rules.set(nt, newProds);
    }
    for (let [term, newV] of termMap) {
        g.rules.set(newV, [[term]]);
    }

    yield { step: "GNF Achieved", grammar: g.clone() };
    return g;
}

// --- 4. UI CONTROLLER ---
let currentGenerator = null;

function renderGrammar(g) {
    const out = document.getElementById('grammar-output');
    out.innerHTML = '';
    
    let delay = 0;
    for (let [nt, prods] of g.rules) {
        if (prods.length === 0) continue;
        
        const row = document.createElement('div');
        row.className = 'rule-row';
        row.style.animationDelay = `${delay}s`;
        delay += 0.05;

        const lhsDiv = document.createElement('div');
        lhsDiv.className = `r-lhs ${getSymbolClass(nt)}`;
        lhsDiv.textContent = nt;

        const arrowDiv = document.createElement('div');
        arrowDiv.className = 'r-arrow';
        arrowDiv.innerHTML = '→';

        const rhsDiv = document.createElement('div');
        rhsDiv.className = 'r-rhs';

        prods.forEach((p, idx) => {
            const prodSpan = document.createElement('span');
            prodSpan.className = 'production';
            p.forEach(sym => {
                const s = document.createElement('span');
                s.className = getSymbolClass(sym);
                s.textContent = sym === 'eps' ? 'ε' : sym;
                prodSpan.appendChild(s);
            });
            
            rhsDiv.appendChild(prodSpan);
            if (idx < prods.length - 1) {
                const pipe = document.createElement('span');
                pipe.className = 'pipe';
                pipe.textContent = '|';
                rhsDiv.appendChild(pipe);
            }
        });

        row.appendChild(lhsDiv);
        row.appendChild(arrowDiv);
        row.appendChild(rhsDiv);
        out.appendChild(row);
    }
}

function getSymbolClass(sym) {
    if (isTerminal(sym)) return 'syn-t';
    if (sym.startsWith('S0') || sym.startsWith('Z_') || sym.startsWith('X_') || sym.startsWith('P_')) return 'syn-new';
    return 'syn-nt';
}

function buildStepper(stepsData) {
    const container = document.getElementById('stepper');
    container.innerHTML = '';
    stepsData.forEach((text, idx) => {
        const step = document.createElement('div');
        step.className = `step-item ${idx === 0 ? 'active' : ''}`;
        
        const dot = document.createElement('div');
        dot.className = 'step-dot';
        dot.textContent = idx + 1;

        const label = document.createElement('div');
        label.className = 'step-label';
        label.textContent = text;

        step.appendChild(dot);
        step.appendChild(label);
        container.appendChild(step);
    });
}

function updateStepper(index) {
    const steps = document.querySelectorAll('.step-item');
    steps.forEach((el, idx) => {
        el.classList.remove('active', 'completed');
        if (idx < index) el.classList.add('completed');
        if (idx === index) el.classList.add('active');
    });
}

function startConversion(type) {
    const text = document.getElementById('grammar-input').value;
    const err = document.getElementById('error-output');
    err.textContent = '';
    
    try {
        const initialGrammar = parseGrammar(text);
        
        if (type === 'CNF') {
            currentGenerator = cnfGenerator(initialGrammar);
            buildStepper([
                "Parse Input",
                "Isolate Start Symbol",
                "Eliminate Epsilons",
                "Eliminate Unit Rules",
                "Eliminate Useless",
                "Isolate Terminals",
                "Binarize Rules (CNF)"
            ]);
        } else if (type === 'GNF') {
            currentGenerator = gnfGenerator(initialGrammar);
            buildStepper([
                "Parse Input",
                "Prep: Isolate Start",
                "Prep: Remove Epsilons",
                "Prep: Remove Units",
                "Prep: Remove Useless",
                "GNF: Order Variables",
                "GNF: Resolve Recursion",
                "GNF: Backward Sub",
                "GNF Achieved"
            ]);
        }
        
        document.getElementById('btn-next').disabled = false;
        document.getElementById('btn-run-all').disabled = false;
        document.getElementById('btn-reset').disabled = false;
        
        window.stepCounter = 0;
        nextStep();

    } catch (e) {
        err.textContent = e.message;
    }
}

function nextStep() {
    if (!currentGenerator) return;
    try {
        const res = currentGenerator.next();
        if (res.done) {
            document.getElementById('btn-next').disabled = true;
            document.getElementById('btn-run-all').disabled = true;
            updateStepper(document.querySelectorAll('.step-item').length);
            return;
        }
        
        renderGrammar(res.value.grammar);
        updateStepper(window.stepCounter++);
        
        const editor = document.getElementById('grammar-output');
        editor.scrollTop = 0; 
        
    } catch (e) {
        document.getElementById('error-output').textContent = "Error: " + e.message;
    }
}

function runAll() {
    const btnNext = document.getElementById('btn-next');
    const interval = setInterval(() => {
        if (btnNext.disabled) {
            clearInterval(interval);
        } else {
            nextStep();
        }
    }, 300); 
}

function resetUI() {
    currentGenerator = null;
    document.getElementById('grammar-output').innerHTML = `
        <div style="color: var(--syntax-arrow); text-align: center; margin-top: 3rem; font-style: italic; font-size: 0.95rem;">
            // Reset complete. Awaiting new instructions...
        </div>
    `;
    document.getElementById('stepper').innerHTML = `
        <div style="color: var(--text-muted); text-align: center; font-size: 0.85rem; margin-top: 1rem;">
            Select a target normal form to begin.
        </div>
    `;
    document.getElementById('btn-next').disabled = true;
    document.getElementById('btn-run-all').disabled = true;
    document.getElementById('btn-reset').disabled = true;
    document.getElementById('error-output').textContent = '';
}