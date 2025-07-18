# Telegram API Endpoint

This endpoint allows sending messages to the founders group in Telegram.

## Configuration

Before using this endpoint, you need to set up the following environment variables:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_FOUNDERS_CHAT_ID=your_chat_id
```

- `TELEGRAM_BOT_TOKEN`: The token for your Telegram bot, which you can get from [BotFather](https://t.me/botfather)
- `TELEGRAM_FOUNDERS_CHAT_ID`: The ID of the Telegram group where messages will be sent

## Usage

Send a POST request to the endpoint with a JSON body containing a message:

```bash
curl -X POST https://your-domain.com/api/telegram \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, founders! This is a test message."}'
```

### Request Parameters

| Parameter | Type   | Required | Description                                |
| --------- | ------ | -------- | ------------------------------------------ |
| message   | string | Yes      | The message to send to the Telegram group. |

### Response

**Success (200 OK)**

```json
{
  "success": true,
  "message": "Message sent successfully to founders group"
}
```

**Bad Request (400)**

```json
{
  "error": "Invalid request",
  "details": "Message is required"
}
```

**Configuration Error (500)**

```json
{
  "error": "Configuration error",
  "details": "TELEGRAM_BOT_TOKEN and TELEGRAM_FOUNDERS_CHAT_ID must be set in environment variables"
}
```

**Telegram API Error (500)**

```json
{
  "error": "Failed to send message to Telegram",
  "details": {
    /* Error details from Telegram API */
  }
}
```

## HTML Formatting

The API supports HTML formatting in messages. For example:

```json
{
  "message": "<b>Bold text</b>\n<i>Italic text</i>\n<a href='https://tensorify.io'>Link</a>"
}
```

For more information on supported HTML formatting, refer to the [Telegram Bot API documentation](https://core.telegram.org/bots/api#formatting-options).
