chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('authentication.html', {
        id: 'main',
        bounds: { width: 620, height: 500 }
    });
});