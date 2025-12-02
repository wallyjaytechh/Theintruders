// Collect browser fingerprint
function getFingerprint() {
    const fingerprint = {
        screen: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        cookies: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack
    };
    
    // Get canvas fingerprint
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f60';
        ctx.fillRect(0, 0, 100, 50);
        ctx.fillStyle = '#069';
        ctx.font = '14px Arial';
        ctx.fillText('Fingerprint', 2, 15);
        fingerprint.canvas = canvas.toDataURL();
    } catch (e) {}
    
    return fingerprint;
}

// Send with fingerprint
async function sendMessageWithTracking(to, message) {
    const fingerprint = getFingerprint();
    
    const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: to,
            message: message,
            fingerprint: fingerprint
        })
    });
    
    return response.json();
}
