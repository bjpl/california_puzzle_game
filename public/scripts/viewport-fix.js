/**
 * Viewport Height Fix for Mobile Browsers
 * Fixes iOS Safari address bar issue
 */
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', vh + 'px');
}

// Set immediately and on resize/orientation change
setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);
