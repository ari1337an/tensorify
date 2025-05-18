"use server";
import { NextRequest, NextResponse } from "next/server";

interface TelegramMessageRequest {
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    // Get required environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_BOT_NOTIFIER_CHAT_ID;

    // Check if environment variables are set
    if (!botToken || !chatId) {
      return NextResponse.json(
        { 
          error: "Configuration error", 
          details: "TELEGRAM_BOT_TOKEN and TELEGRAM_FOUNDERS_CHAT_ID must be set in environment variables"
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await req.json();
    
    // Validate request body
    if (!body.message) {
      return NextResponse.json(
        { error: "Invalid request", details: "Message is required" },
        { status: 400 }
      );
    }

    const { message } = body as TelegramMessageRequest;

    // Send message to Telegram
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const telegramResponse = await fetch(telegramApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML" // Supports HTML formatting
      }),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error("Telegram API error:", telegramResult);
      return NextResponse.json(
        { 
          error: "Failed to send message to Telegram", 
          details: telegramResult 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Message sent successfully to founders group"
    });
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return NextResponse.json(
      { 
        error: "Failed to send message", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 