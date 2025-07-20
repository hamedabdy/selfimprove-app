// Client-side script for exec-js.html
// Moved from inline <script> in exec-js.html

// Initialize CodeMirror editor
const editor = CodeMirror.fromTextArea(document.getElementById('js-code'), {
    mode: 'javascript',
    theme: 'material-darker',
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    autofocus: true,
    lineWrapping: true
});

const runBtn = document.getElementById('run-btn');
const timerBox = document.getElementById('exec-timer');
const timerValue = document.getElementById('timer-value');
const timerSpinner = document.getElementById('timer-spinner');
let timerInterval = null;
let timerStart = null;

// Enable/disable Run button based on editor content
function updateRunBtnState() {
    const code = editor.getValue();
    runBtn.disabled = !code.trim();
}

// Linting with JSLint
function lintCode(code) {
    if (typeof JSLint !== 'undefined') {
        const lintResult = JSLint(code);
        const lintBox = document.getElementById('lint-result');
        if (!lintResult.ok) {
            let errors = lintResult.warnings.map(w => `Line ${w.line}, Col ${w.column}: ${w.message}`);
            lintBox.innerHTML = '<b>JSLint Warnings:</b><br>' + errors.join('<br>');
            lintBox.classList.remove('d-none');
        } else {
            lintBox.innerHTML = '<b>No JSLint warnings.</b>';
            lintBox.classList.remove('d-none');
        }
    }
}

// Timer functions
function startTimer() {
    timerStart = performance.now();
    timerValue.textContent = '0.00s';
    timerBox.style.display = 'flex';
    timerSpinner.style.display = 'inline-block';
    timerInterval = setInterval(() => {
        const elapsed = (performance.now() - timerStart) / 1000;
        timerValue.textContent = elapsed.toFixed(2) + 's';
    }, 50);
}
function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    timerBox.style.display = 'none';
    timerSpinner.style.display = 'none';
}

editor.on('change', () => {
    lintCode(editor.getValue());
    updateRunBtnState();
});

// Initial state
updateRunBtnState();

document.getElementById('js-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const code = editor.getValue();
    const resultEl = document.getElementById('result');
    resultEl.textContent = 'Running...';
    startTimer();
    runBtn.disabled = true;
    try {
        const response = await fetch('/api/exec-js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        const data = await response.json();
        if (response.ok) {
            let output = '';
            if (data.logs && data.logs.length) {
                output += data.logs.join('\n');
            }
            resultEl.textContent = output;
            resultEl.className = 'result-box';
        } else {
            resultEl.textContent = data.error || 'Unknown error';
            resultEl.className = 'result-box error';
        }
    } catch (err) {
        resultEl.textContent = 'Request failed: ' + err.message;
        resultEl.className = 'result-box error';
    } finally {
        stopTimer();
        updateRunBtnState();
    }
});
// Initial lint
lintCode(editor.getValue());
