/**
 * Link Deletion Checker
 * Checks if link_id from query parameter exists in database
 * If deleted (404), shows 404 page instead of form
 */

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const link_id = urlParams.get('link_id');

    if (link_id && link_id.length > 5) {
        // Check if link exists in database
        const API_URL = window.location.hostname === 'localhost'
            ? 'http://localhost:8080'
            : 'https://mmworkbot-dev-production.up.railway.app'; // Will change to production URL

        fetch(`${API_URL}/check-link/${link_id}`)
            .then(response => {
                if (response.status === 404) {
                    // Link is deleted - show 404 page
                    show404Page();
                }
            })
            .catch(error => {
                console.error('Error checking link:', error);
                // On error, allow page to load (graceful fallback)
            });
    }
});

function show404Page() {
    document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial;">
            <div style="text-align: center; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h1 style="margin: 0 0 10px 0; color: #333; font-size: 48px;">404</h1>
                <p style="color: #666; margin: 0;">Ссылка больше не активна</p>
            </div>
        </div>
    `;
    document.title = '404 Not Found';
}
