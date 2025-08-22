"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"

import { PromptInput, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input"
import { Message, MessageContent } from "@/components/ai-elements/message"
import { ConversationContent } from "@/components/ai-elements/conversation"
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
  const [hasStarted, setHasStarted] = useState(false)
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
          content: "Generated new app preview. Check the preview panel!",
        },
      ])
    } catch (error) {
      console.error("Error:", error)
      setChatHistory((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "Sorry, there was an error creating your app. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartChat = async () => {
    const initialMessage = "Let's build a Shopify store!"
    setHasStarted(true)
    setMessage("")
    setIsLoading(true)

    setChatHistory([{ type: "user", content: initialMessage }])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: initialMessage,
          chatId: null,
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
          content: "Generated new app preview. Check the preview panel!",
        },
      ])
    } catch (error) {
      console.error("Error:", error)
      setChatHistory((prev) => [
        ...prev,
        {
          type: "assistant",
          content: "Sorry, there was an error creating your app. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex">
      {/* Chat Panel */}
      <div className="w-1/2 flex flex-col border-r">
        {/* Header */}
        <div className="border-b p-3 h-14 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-3">
            <Image src="/shopify-logo.png" alt="Shopify" width={48} height={48} className="object-contain" />
            <h1 className="text-lg font-semibold text-primary">Vibe Coding Platform </h1>
          </div>
          <div className="text-sm text-muted-foreground font-medium">{""}</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center font-semibold mt-8">
              <div className="flex justify-center mb-6">
                <Image
                  src="/shopify-logo.png"
                  alt="Shopify"
                  width={64}
                  height={64}
                  className="object-contain opacity-80"
                />
              </div>
              <p className="text-3xl mt-4 text-primary">What Shopify store can we build together?</p>
              <p className="text-muted-foreground mt-2">Create stunning e-commerce experiences with AI</p>
            </div>
          ) : (
            <>
              <ConversationContent>
                {chatHistory.map((msg, index) => (
                  <Message from={msg.type} key={index}>
                    <MessageContent>{msg.content}</MessageContent>
                  </Message>
                ))}
              </ConversationContent>
              {isLoading && (
                <Message from="assistant">
                  <MessageContent>
                    <p className="flex items-center gap-2">
                      <Loader />
                      Creating your Shopify store...
                    </p>
                  </MessageContent>
                </Message>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          {!currentChat && !hasStarted ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleStartChat}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Start
              </button>
            </div>
          ) : (
            <>
              {!currentChat && hasStarted && (
                <Suggestions>
                  <Suggestion
                    onClick={() => setMessage("Create a modern product page for a Shopify store")}
                    suggestion="Create a modern product page for a Shopify store"
                  />
                  <Suggestion
                    onClick={() => setMessage("Build a shopping cart component with Shopify styling")}
                    suggestion="Build a shopping cart component with Shopify styling"
                  />
                  <Suggestion
                    onClick={() => setMessage("Make a hero section for an e-commerce landing page")}
                    suggestion="Make a hero section for an e-commerce landing page"
                  />
                </Suggestions>
              )}
              <div className="flex gap-2">
                <PromptInput onSubmit={handleSendMessage} className="mt-4 w-full max-w-2xl mx-auto relative">
                  <PromptInputTextarea
                    onChange={(e) => setMessage(e.target.value)}
                    value={message}
                    className="pr-12 min-h-[60px]"
                    placeholder="Describe your Shopify store component..."
                  />
                  <PromptInputSubmit
                    className="absolute bottom-1 right-1"
                    disabled={!message}
                    status={isLoading ? "streaming" : "ready"}
                  />
                </PromptInput>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-1/2 flex flex-col">
        <WebPreview>
          <WebPreviewNavigation>
            <WebPreviewUrl placeholder="Your Shopify store preview..." readOnly value={currentChat?.demo || ""} />
          </WebPreviewNavigation>
          {currentChat?.demo ? (
            <WebPreviewBody src={currentChat.demo} />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/20">
              <div className="text-center text-muted-foreground">
                <Image
                  src="/shopify-logo.png"
                  alt="Shopify"
                  width={48}
                  height={48}
                  className="object-contain opacity-50 mx-auto mb-4"
                />
                <p className="text-lg font-medium">No preview yet</p>
                <p className="text-sm">Start building your Shopify store component</p>
              </div>
            </div>
          )}
        </WebPreview>
      </div>
    </div>
  )
}
