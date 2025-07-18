/**
 * Utility functions for sending notifications to various platforms
 */

/**
 * Send a notification message to Telegram
 * @param message The message to send to Telegram
 * @returns Promise with the response
 */
export const sendTelegramNotification = async (message: string): Promise<Response> => {
  try {
    // Use our internal Next.js API route instead of calling the external API directly
    const response = await fetch('/api/notifications/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    console.log('Telegram notification sent:', message);
    
    if (!response.ok) {
      console.error('Failed to send Telegram notification:', await response.text());
    }
    
    return response;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    throw error;
  }
}; 