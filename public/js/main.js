document.addEventListener('DOMContentLoaded', function() {
    const infoBubble = document.getElementById('infoBubble');
    const goalInput = document.getElementById('goal');
    const sendButton = document.getElementById('sendButton');

    function updateSendButtonState() {
        if (goalInput.value.trim() !== '') {
            sendButton.disabled = false;
        } else {
            sendButton.disabled = true;
        }
    }

    document.getElementById('goalForm').addEventListener('submit', function(e) {
        const goal = goalInput.value.trim();
        if (goal === '') {
            e.preventDefault();
            infoBubble.style.display = 'block';
        } else {
            infoBubble.style.display = 'none';
            e.preventDefault();
            sendGoal();
        }
    });

    // Prevent form submission when Ctrl + Enter is pressed
    document.getElementById('goalForm').addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && event.ctrlKey) {
            event.preventDefault();
            // Trigger the send button instead
            document.querySelector('button[type="submit"]').click();
        }
    });

    document.getElementById('goalForm').addEventListener('input', function() {
        if (goalInput.value.trim() !== '') {
            infoBubble.style.display = 'none';
        }
        updateSendButtonState();
    });

    // Initial state
    updateSendButtonState();
});

async function sendGoal() {
    const goal = document.getElementById('goal').value.trim();
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = 'Working...';

    const res = await fetch('/api/goal', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ goal })
    });
    const data = await res.json();
    if (data.html) {
        // Render full HTML page in an iframe for isolation
        resultContainer.innerHTML = '<iframe id="html-result-frame" style="width:100%;height:70vh;border:none;"></iframe>';
        const iframe = document.getElementById('html-result-frame');
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(data.html);
        iframe.contentWindow.document.close();
    } else if (data.error) {
        resultContainer.innerText = `Error: ${data.error}`;
    } else {
        resultContainer.innerText = data.message;
    }
}