/**
 * Feedback Widget Component
 *
 * Purpose: Collect user feedback with screenshot capability
 * Features:
 * - Non-intrusive button
 * - Slide-in form
 * - Screenshot capture
 * - Category selection
 * - Email submission
 */

import { useState, useRef } from 'react';
import { MessageSquare, X, Camera, Send } from 'lucide-react';
import { trackEvent, AnalyticsEvent } from '../../services/analytics';

interface FeedbackData {
  category: 'bug' | 'feature' | 'general';
  message: string;
  screenshot?: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackData['category']>('general');
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * Capture screenshot
   */
  const captureScreenshot = async () => {
    try {
      // Use html2canvas for screenshot (would need to be installed)
      // For now, we'll just note the feature
      trackEvent(AnalyticsEvent.FEEDBACK_OPENED, {
        action: 'screenshot_attempted',
      });

      // Placeholder - in production, use html2canvas or similar
      setScreenshot('screenshot_placeholder');

      // eslint-disable-next-line no-console
      console.info('[Feedback] Screenshot capture requires html2canvas library');
    } catch (error) {
      console.error('[Feedback] Failed to capture screenshot:', error);
    }
  };

  /**
   * Submit feedback
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const feedbackData: FeedbackData = {
        category,
        message: message.trim(),
        screenshot: screenshot || undefined,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      // Send to backend endpoint
      const endpoint = import.meta.env.VITE_FEEDBACK_ENDPOINT || '/api/feedback';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Track successful submission
      trackEvent(AnalyticsEvent.FEEDBACK_SUBMITTED, {
        category,
        hasScreenshot: !!screenshot,
      });

      setSubmitStatus('success');

      // Reset form after 2 seconds
      setTimeout(() => {
        setMessage('');
        setScreenshot(null);
        setIsOpen(false);
        setSubmitStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('[Feedback] Failed to submit:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Toggle widget
   */
  const toggleWidget = () => {
    const newState = !isOpen;
    setIsOpen(newState);

    if (newState) {
      trackEvent(AnalyticsEvent.FEEDBACK_OPENED);
    }
  };

  return (
    <>
      {/* Feedback Button */}
      <button
        onClick={toggleWidget}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Open feedback form"
        title="Send feedback"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Feedback Panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 animate-slide-in-right"
          role="dialog"
          aria-labelledby="feedback-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
            <h2 id="feedback-title" className="text-lg font-semibold">
              Send Feedback
            </h2>
            <button
              onClick={toggleWidget}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Close feedback form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Category */}
            <div>
              <label htmlFor="feedback-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                id="feedback-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackData['category'])}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think..."
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Screenshot */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={captureScreenshot}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                <Camera className="w-4 h-4" />
                Capture Screenshot
              </button>
              {screenshot && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  Screenshot captured
                </span>
              )}
            </div>

            {/* Submit Status */}
            {submitStatus === 'success' && (
              <div className="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md text-sm">
                Thank you for your feedback!
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md text-sm">
                Failed to submit feedback. Please try again.
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Feedback
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

// Default export for lazy loading
export default FeedbackWidget;
