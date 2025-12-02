// Global functions for the app

async function createProfile() {
    const username = document.getElementById('username').value;
    const displayName = document.getElementById('displayName').value;
    
    if (!username || !displayName) {
        alert('Please fill all fields');
        return;
    }
    
    // In real app, you'd save to database
    const link = `${window.location.origin}/send/${username}`;
    
    document.getElementById('linkResult').innerHTML = `
        <strong>Your link:</strong><br>
        <code>${link}</code><br><br>
        Share this on Instagram, WhatsApp, etc.
    `;
}

function goToSend() {
    const username = document.getElementById('sendTo').value;
    if (username) {
        window.location.href = `/send/${username}`;
    } else {
        alert('Enter a username');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Anonymous Messenger loaded');
});
