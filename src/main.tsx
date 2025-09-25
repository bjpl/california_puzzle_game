import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Global styles
const globalStyles = `
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

#root {
  min-height: 100vh;
  width: 100%;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Remove default button styles */
button {
  border: none;
  outline: none;
  background: none;
  cursor: pointer;
}

button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Drag and drop cursor states */
.dragging {
  cursor: grabbing !important;
}

.drop-target {
  cursor: copy;
}

/* Animation classes */
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

.slide-in-left {
  animation: slideInLeft 0.3s ease-out;
}

.slide-in-right {
  animation: slideInRight 0.3s ease-out;
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* County piece hover effects */
.county-piece:hover {
  transform: scale(1.05);
  z-index: 10;
}

.county-piece.dragging {
  transform: scale(1.1) rotate(5deg);
  z-index: 1000;
}

/* Map interactions */
.map-svg {
  cursor: grab;
}

.map-svg:active {
  cursor: grabbing;
}

/* Tooltip styles */
.tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent transparent;
}

/* Loading spinner */
.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Achievement notification styles */
.achievement-notification {
  background: #f59e0b;
  box-shadow: 0 10px 25px rgba(251, 191, 36, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Game state indicators */
.game-paused {
  filter: grayscale(0.5);
  opacity: 0.7;
}

.game-completed {
  filter: hue-rotate(120deg) saturate(1.2);
}

/* Responsive design helpers */
@media (max-width: 768px) {
  .game-container {
    flex-direction: column;
  }

  .game-sidebar {
    width: 100% !important;
    height: auto;
  }

  .map-area {
    height: 60vh;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .county-piece {
    border-width: 3px !important;
  }

  .county-outline {
    stroke-width: 2px !important;
  }
}

/* Focus management for keyboard navigation */
.focusable:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Print styles */
@media print {
  .game-header,
  .game-sidebar,
  .achievement-notification {
    display: none !important;
  }

  .map-area {
    width: 100% !important;
    height: 100% !important;
  }
}
`;

// Inject global styles
const styleSheet = document.createElement('style');
styleSheet.textContent = globalStyles;
document.head.appendChild(styleSheet);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)