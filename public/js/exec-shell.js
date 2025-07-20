// public/js/exec-shell.js
// Handles CodeMirror, timer, and shell form submission for exec-shell.html

// CodeMirror setup
var editor = CodeMirror.fromTextArea(document.getElementById('command'), {
    mode: 'shell',
    theme: 'material-darker',
    lineNumbers: true,
    autofocus: true,
});
const runBtn = document.getElementById('run-btn');
editor.on('change', function() {
    runBtn.disabled = !editor.getValue().trim();
});

// Timer logic
let timerInterval, startTime;
function startTimer() {
    document.getElementById('exec-timer').style.display = 'flex';
    document.getElementById('timer-spinner').style.display = '';
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        document.getElementById('timer-value').textContent = elapsed.toFixed(2) + 's';
    }, 50);
}
function stopTimer() {
    clearInterval(timerInterval);
    document.getElementById('timer-spinner').style.display = 'none';
}

document.getElementById('shellForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const command = editor.getValue();
    const resultEl = document.getElementById('result');
    resultEl.classList.remove('error');
    resultEl.textContent = 'Executing...';
    startTimer();
    try {
        const res = await fetch('/api/exec-shell', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command })
        });
        const data = await res.json();
        stopTimer();
        if (res.ok) {
            resultEl.textContent = (data.stdout || '') + (data.stderr ? '\n' + data.stderr : '');
        } else {
            resultEl.textContent = 'Error: ' + (data.error || 'Unknown error');
            resultEl.classList.add('error');
        }
    } catch (err) {
        stopTimer();
        resultEl.textContent = 'Error: ' + err.message;
        resultEl.classList.add('error');
    }
});
