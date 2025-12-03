/**
 * Loading Screen Controller
 * Manages the loading screen visibility and progress updates
 */
(function() {
  const loadingScreen = document.getElementById('loading-screen');
  const root = document.getElementById('root');

  // Update loading progress
  const loadingSteps = [
    'Loading application...',
    'Preparing map data...',
    'Initializing game engine...',
    'Ready to play!'
  ];

  let currentStep = 0;
  const progressElement = document.querySelector('.loading-progress');

  const updateProgress = () => {
    if (currentStep < loadingSteps.length) {
      progressElement.textContent = loadingSteps[currentStep];
      currentStep++;
      setTimeout(updateProgress, 500);
    }
  };

  // Start progress updates
  setTimeout(updateProgress, 500);

  // Hide loading screen when app is ready
  window.addEventListener('load', () => {
    const checkReactMounted = () => {
      if (root.children.length > 0) {
        setTimeout(() => {
          loadingScreen.classList.add('hidden');
          setTimeout(() => {
            loadingScreen.style.display = 'none';
          }, 500);
        }, 500);
      } else {
        setTimeout(checkReactMounted, 100);
      }
    };

    setTimeout(checkReactMounted, 1500);

    // Fallback: force show after 5 seconds
    setTimeout(() => {
      if (loadingScreen.style.display !== 'none') {
        console.warn('React mount timeout - hiding loading screen anyway');
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }
    }, 5000);
  });

  // Handle app initialization errors
  window.addEventListener('error', (error) => {
    console.error('App initialization error:', error);
    progressElement.textContent = 'Error loading game. Please refresh the page.';
    progressElement.style.color = '#fbbf24';
  });
})();
