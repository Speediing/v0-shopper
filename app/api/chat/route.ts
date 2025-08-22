import { NextRequest, NextResponse } from "next/server";
import { v0 } from "v0-sdk";

export async function POST(request: NextRequest) {
  try {
    const { message, chatId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let chat;

    if (chatId) {
      // continue existing chat
      chat = await v0.chats.sendMessage({
        chatId: chatId,
        message,
      });
    } else {
      // create new chat
      const project = await v0.projects.create({
        name: "My Project",
        environmentVariables: [
          {
            key: "NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN",
            value: "fakestore-ai.myshopify.com",
          },
        ],
      });

      chat = await v0.chats.init({
  type: 'zip',
  zip: {
    url: 'https://oml7wvjso7dfbgel.public.blob.vercel-storage.com/v0commercetemplateshopify.zip'
  },
      });
      const result = await v0.projects.assign({
        projectId: project.id,
        chatId: chat.id,
      });
    }

    return NextResponse.json({
      id: chat.id,
      demo: chat.demo,
    });
  } catch (error) {
    console.error("V0 API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
