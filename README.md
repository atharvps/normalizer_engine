<div align="center">

<br/>

```
███╗   ██╗ ██████╗ ██████╗ ███╗   ███╗ █████╗ ██╗     ██╗███████╗███████╗██████╗
████╗  ██║██╔═══██╗██╔══██╗████╗ ████║██╔══██╗██║     ██║╚══███╔╝██╔════╝██╔══██╗
██╔██╗ ██║██║   ██║██████╔╝██╔████╔██║███████║██║     ██║  ███╔╝ █████╗  ██████╔╝
██║╚██╗██║██║   ██║██╔══██╗██║╚██╔╝██║██╔══██║██║     ██║ ███╔╝  ██╔══╝  ██╔══██╗
██║ ╚████║╚██████╔╝██║  ██║██║ ╚═╝ ██║██║  ██║███████╗██║███████╗███████╗██║  ██║
╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
███████╗███╗   ██╗ ██████╗ ██╗███╗   ██╗███████╗
██╔════╝████╗  ██║██╔════╝ ██║████╗  ██║██╔════╝
█████╗  ██╔██╗ ██║██║  ███╗██║██╔██╗ ██║█████╗
██╔══╝  ██║╚██╗██║██║   ██║██║██║╚██╗██║██╔══╝
███████╗██║ ╚████║╚██████╔╝██║██║ ╚████║███████╗
╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚══════╝
```

<br/>

**A sleek, step-by-step CFG → CNF & GNF transformation engine.**  
Visual. Interactive. Yours.

<br/>

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![No Dependencies](https://img.shields.io/badge/Dependencies-Zero-14b8a6?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)

<br/>

</div>

---

## ✦ What is This?

**Normalizer Engine** is a browser-based tool that transforms any **Context-Free Grammar (CFG)** into either **Chomsky Normal Form (CNF)** or **Greibach Normal Form (GNF)** — one transparent step at a time.

No installations. No back-end. No black boxes. Just paste your grammar, hit a button, and *watch the theory come to life*.

---

## ✦ Features

| Feature | Description |
|---|---|
| 🔁 **CNF Conversion** | Full 7-step pipeline: start isolation → ε-elimination → unit rules → useless symbols → terminal isolation → binarization |
| 🔁 **GNF Conversion** | 9-step pipeline including variable ordering, direct/indirect left-recursion resolution via Zi substitution, and backward substitution |
| 🧩 **Step-by-Step Mode** | Advance one transformation at a time with the **Next →** button |
| ⚡ **Run All Mode** | Auto-advance through all steps with animated timing |
| 🎨 **Syntax Highlighting** | Color-coded non-terminals, terminals, and newly introduced symbols |
| 🌗 **Dark / Light Theme** | One-click toggle — dark (teal-green) and light (aqua-teal) modes |
| ε **Epsilon Insertion** | Click the ε button to insert the epsilon character directly into the textarea |
| 📐 **IDE-style Output** | Grammar renders in a code-editor window with animated rule rows |
| ♻️ **Reset** | Clear state and start fresh without refreshing the page |

---

## ✦ Screenshots

> *Dark Mode — CNF Transformation in Progress*

```
┌─────────────────────────────────────────────────────────────────┐
│  ◉ ◎ ◎   Normalizer Engine                    CFG Transformations│
├──────────────────────────┬──────────────────────────────────────┤
│  Input CFG        [ε]    │  Transformation Process              │
│ ┌────────────────────┐   │  ◉ 1. Parse Input       S → ...      │
│ │ S -> A B C | eps   │   │  ● 2. Isolate Start     S0→ ...      │
│ │ A -> a A | eps     │   │  ○ 3. Elim. Epsilons                 │
│ │ B -> b B | eps     │   │  ○ 4. Elim. Unit Rules               │
│ │ C -> c C | c       │   │  ○ 5. Elim. Useless                  │
│ └────────────────────┘   │  ○ 6. Isolate Terminals              │
│                           │  ○ 7. Binarize Rules                 │
│  [To CNF]  [To GNF]      │  [Next →] [Run All ⚡] [⟳]          │
└──────────────────────────┴──────────────────────────────────────┘
```

---

## ✦ Getting Started

Zero setup. Seriously.

```bash
# Clone the repo
git clone https://github.com/your-username/normalizer-engine.git

# Open in your browser
cd normalizer-engine
open index.html
```

Or just **drag `index.html`** into any browser window. That's it.

---

## ✦ Grammar Input Format

Write your grammar using the following conventions:

```
S -> A B C | eps
A -> a A | eps
B -> b B | eps
C -> c C | c
```

| Rule | Convention |
|---|---|
| **Non-terminals** | Single uppercase letter: `S`, `A`, `B` |
| **Terminals** | Lowercase letters or digits: `a`, `b`, `0` |
| **Productions** | Separated by pipe `\|` |
| **Epsilon** | Write `eps` or click the **ε** button to insert `ε` directly |
| **Arrow** | Use `->` or `→` |
| **First Rule** | The LHS of the first rule is treated as the start symbol |

### Example Grammars

**Balanced parentheses:**
```
S -> ( S ) | eps
```

**Simple arithmetic:**
```
E -> E + T | T
T -> T * F | F
F -> ( E ) | a
```

**Left-recursive (GNF will resolve this):**
```
A -> A a | b
```

---

## ✦ CNF Transformation Pipeline

Chomsky Normal Form requires every rule to be of the form `A → BC` or `A → a`.

```
Input Grammar
     │
     ▼
[Step 1] Parse & Validate
     │
     ▼
[Step 2] Isolate Start Symbol
         Add S0 → S if S appears on any RHS
     │
     ▼
[Step 3] Eliminate ε-Productions
         Find all nullable variables; expand combinations
     │
     ▼
[Step 4] Eliminate Unit Rules
         Replace A → B chains with their transitive closures
     │
     ▼
[Step 5] Eliminate Useless Symbols
         Remove non-generating & unreachable symbols
     │
     ▼
[Step 6] Isolate Terminals
         Wrap terminals in new rules: T_a → a
     │
     ▼
[Step 7] Binarize Long Rules
         Break A → B C D into A → B X_1, X_1 → C D
     │
     ▼
  ✓ CNF
```

---

## ✦ GNF Transformation Pipeline

Greibach Normal Form requires every rule to start with a terminal: `A → a α`.

```
Input Grammar
     │
     ▼
[Steps 1–5] Full CNF Preparation (same as above)
     │
     ▼
[Step 6] Order Variables
         Assign indices A₁, A₂, ... Aₙ to enforce ordering
     │
     ▼
[Step 7] Resolve Left Recursion
         For each Aᵢ → Aⱼ α where j ≤ i:
           Substitute and eliminate using Zᵢ variables
     │
     ▼
[Step 8] Backward Substitution
         Work backwards so every rule starts with a terminal
     │
     ▼
[Step 9] Wrap Remaining Terminals
         Introduce X_a → a for terminals in longer rules
     │
     ▼
  ✓ GNF
```

---

## ✦ Syntax Highlighting Legend

| Color | Meaning |
|---|---|
| 🟠 **Orange** | Original non-terminal (e.g. `S`, `A`, `B`) |
| 🟢 **Green** | Terminal symbol (e.g. `a`, `b`, `c`) |
| 🟣 **Purple** | Newly introduced symbol (e.g. `S0`, `Z_A`, `X_a`) |
| ⬜ **Gray** | Arrows `→` and pipe separators `\|` |

---

## ✦ Project Structure

```
normalizer-engine/
│
├── index.html        ← App shell, layout, navbar, footer
├── style.css         ← Theming, glassmorphism, animations, syntax colors
└── script.js         ← Grammar parser, CNF engine, GNF engine, UI controller
```

### `script.js` Architecture

```
script.js
├── Theme & Epsilon Logic     toggleTheme(), insertEpsilon()
│
├── Core Data Structures
│   ├── class Grammar         rules Map, terminals/nonTerminals Sets
│   └── parseGrammar()        Tokenizes lines, validates LHS/RHS
│
├── CNF Engine
│   └── cnfGenerator()        ES6 Generator — yields {step, grammar} at each stage
│
├── GNF Engine
│   └── gnfGenerator()        ES6 Generator — yields {step, grammar} at each stage
│
└── UI Controller
    ├── renderGrammar()        Builds animated rule rows in the editor window
    ├── buildStepper()         Constructs the step list panel
    ├── updateStepper()        Marks steps active / completed
    ├── startConversion()      Parses input, creates generator, enables buttons
    ├── nextStep()             Advances one yield from the generator
    ├── runAll()               setInterval loop calling nextStep()
    └── resetUI()              Clears all state and re-disables buttons
```

---

## ✦ Browser Compatibility

| Browser | Support |
|---|---|
| Chrome / Edge | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Mobile (iOS / Android) | ✅ Responsive layout |

Requires ES2018+ (generators, spread, `Map`/`Set`). No polyfills needed for any modern browser.



## ✦ Credits

<div align="center">

Developed by **ATHARV PRATAP SINGH** `(2024UCS1610)`

Under the guidance of **Prof. Geetanjali Rathi**

<br/>



</div>

---

<div align="center">

**[⬆ Back to top](#)**

<br/>

*If this helped you understand CFG normalizations, consider leaving a ⭐*

</div>
