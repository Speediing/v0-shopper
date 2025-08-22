"use client"

import type React from "react"

import { useState } from "react"

import { PromptInput, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input"
import { Message, MessageContent } from "@/components/ai-elements/message"
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation"
import { WebPreview, WebPreviewNavigation, WebPreviewUrl, WebPreviewBody } from "@/components/ai-elements/web-preview"
import { Loader } from "@/components/ai-elements/loader"
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion"

interface Chat {
  id: string
  demo: string
}

export default function Home() {
  const [message, setMessage] = useState("")
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<
    Array<{
      type: "user" | "assistant"
      content: string
    }>
  >([])

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    const userMessage = message.trim()
    setMessage("")
    setIsLoading(true)

    setChatHistory((prev) => [...prev, { type: "user", content: userMessage }])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          chatId: currentChat?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create chat")
      }

      const chat: Chat = await response.json()
      setCurrentChat(chat)

      setChatHistory((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "Generated new restaurant website preview. Check the preview panel!",
        },
      ])
    } catch (error) {
      console.error("Error:", error)
      setChatHistory((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "Sorry, there was an error creating your restaurant website. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Chat Panel */}
      <div className="w-1/2 flex flex-col border-r border-border">
        {/* Header */}
        <div className="border-b border-border p-4 h-16 flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <img src="/toast-logo.png" alt="Toast" className="h-8 w-auto" />
            <h1 className="text-xl font-semibold text-foreground">Website Creator</h1>
          </div>
          <div className="text-sm text-muted-foreground">Build your restaurant's online presence</div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center mt-12">
              <div className="mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  What restaurant experience can we build together?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Create stunning websites and online ordering experiences that drive revenue for your restaurant
                </p>
              </div>
            </div>
          ) : (
            <>
              <Conversation>
                <ConversationContent>
                  {chatHistory.map((msg, index) => (
                    <Message from={msg.type} key={index}>
                      <MessageContent>{msg.content}</MessageContent>
                    </Message>
                  ))}
                </ConversationContent>
              </Conversation>
              {isLoading && (
                <Message from="assistant">
                  <MessageContent>
                    <p className="flex items-center gap-2">
                      <Loader />
                      Creating your restaurant website...
                    </p>
                  </MessageContent>
                </Message>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-6 bg-card">
          {!currentChat && (
            <Suggestions>
              <Suggestion
                onClick={() => setMessage("Create a modern pizza restaurant website with online ordering")}
                suggestion="Create a modern pizza restaurant website with online ordering"
              />
              <Suggestion
                onClick={() => setMessage("Build a coffee shop landing page with menu showcase")}
                suggestion="Build a coffee shop landing page with menu showcase"
              />
              <Suggestion
                onClick={() => setMessage("Design a fine dining restaurant site with reservation system")}
                suggestion="Design a fine dining restaurant site with reservation system"
              />
            </Suggestions>
          )}
          <div className="flex gap-2">
            <PromptInput onSubmit={handleSendMessage} className="mt-4 w-full max-w-2xl mx-auto relative">
              <PromptInputTextarea
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                className="pr-12 min-h-[60px]"
                placeholder="Describe your restaurant website idea..."
              />
              <PromptInputSubmit
                className="absolute bottom-1 right-1"
                disabled={!message}
                status={isLoading ? "streaming" : "ready"}
              />
            </PromptInput>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 flex flex-col">
        <WebPreview>
          <WebPreviewNavigation>
            <WebPreviewUrl
              placeholder="Your restaurant website preview will appear here..."
              value={currentChat?.demo}
            />
          </WebPreviewNavigation>
          <WebPreviewBody src={currentChat?.demo} />
        </WebPreview>
      </div>
    </div>
  )
}
