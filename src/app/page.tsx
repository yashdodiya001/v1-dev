"use client";
import { createUI } from "@/actions/ui/create-ui";
import Header from "@/components/header";
import HomeUICards from "@/components/home-uis";
import Suggestions from "@/components/suggestions";
import { TipsCarousel } from "@/components/tips-carousel";
import {
  Badge,
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuItem,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@/components/ui";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useUIState } from "@/hooks/useUIState";
import {
  Clipboard,
  Code,
  Cog,
  Copy,
  Download,
  InfoIcon,
  LoaderCircle,
  Lock,
  SendHorizontal,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import React, { useState, useRef, useEffect } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send, Menu } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  atomDark,
  coldarkCold,
  coldarkDark,
  duotoneDark,
  oneDark,
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useToast } from "@/components/ui/use-toast";
import {
  dark,
  docco,
  dracula,
  hybrid,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import Loader from "@/components/loader";
import MainLoader from "@/components/main-loader";
import Image from "next/image";

interface CodeObject {
  fileName: string;
  code: string;
  order: number;
  uniqueId: string;
  codeId: string;
}

export default function Home() {
  const router = useRouter();
  const {
    input,
    setInput,
    loading,
    setLoading,
    imageBase64,
    setImageBase64,
    uiType,
    setUIType,
  } = useUIState();
  const { toggle } = useAuthModal();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [codeContent, setCodeContent] = useState<CodeObject[] | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [codeSidebarOpen, setCodeSidebarOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! How can I assist you today?",
      uniqueId: "first_chat",
    },
  ]);
  const [fileName, setFileName] = useState<string[] | null>([]);
  const [selectedCodeIndex, setSelectedCodeIndex] = useState<string>("");
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const file = files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImageBase64("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateUI = async () => {
    if (!input) {
      toast.error("Please enter a message");
      return;
    }
    try {
      if (status === "authenticated" && userId) {
        setLoading(true);
        const ui = await createUI(input, userId, uiType);
        setLoading(false);
        router.push(`/ui/${ui.id}`);
      } else {
        toggle();
      }
    } catch (error) {
      toast.error("Failed to generate UI");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) {
      toast.error("Please enter a message");
      return;
    }
    if (status === "authenticated" && userId) {
      let uniqueId = `code_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: input.trim(), uniqueId },
      ]);
      setInput("");
      setLoading(true);

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "V1 is thinking....", uniqueId },
      ]);

      const response = await fetch("https://api.v1vue.miraiminds.co/", {
        method: "POST",
        body: JSON.stringify({
          text: input,
          sessionId: sessionId ? sessionId : "",
          userId: userId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      let result = await response.json();

      if (!response.ok) {
        toast.error(result.error);
        setLoading(false);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (result.sessionId) {
        setSessionId(result.sessionId);
      }
      uniqueId = `code_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;
      setMessages((prev) => {
        const updatedList = [...prev]; // Create a shallow copy of the list
        updatedList.pop(); // Remove the last object
        return updatedList; // Return the updated list
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.result
            .replace(/<Thinking>|<\/Thinking>/g, "")
            .replace(/\n\s*\n/g, "\n")
            .trim(),
          uniqueId,
        },
      ]);

      setLoading(false);
    } else {
      toggle();
    }
  };

  const extractCodeAndText = (message: string, uniqueId: string) => {
    const codeRegex = /```([\s\S]*?)```/g;
    const codeMatches = Array.from(message.matchAll(codeRegex));

    const filenameRegex = /file="([^"]+)"/;
    let codeObjects: CodeObject[] = [];

    codeMatches.forEach((match, index) => {
      const codeContent = match[1];
      const fileNameMatch = codeContent.match(filenameRegex);

      const fileName =
        fileNameMatch && fileNameMatch[1] ? fileNameMatch[1] : "code.txt";
      const codeWithoutFirstLine = codeContent
        .split("\n")
        .slice(1)
        .join("\n")
        .trim();

      const codeId = `codeId_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;

      if (index === 0) {
        setSelectedCodeIndex(codeId);
      }

      codeObjects.push({
        fileName,
        code: codeWithoutFirstLine,
        order: index + 1,
        uniqueId,
        codeId,
      });
    });

    console.log("=====codeObjects=====", codeObjects);

    let textWithPlaceholders = message.replace(codeRegex, uniqueId);

    const textWithoutCode = textWithPlaceholders
      .replace(/\n\s*\n/g, "\n")
      .trim();

    return {
      text: textWithoutCode,
      codes: codeObjects,
    };
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }

    const lastMessage = messages[messages.length - 1];

    // Regular expression to check for code block
    const lastMessageContent = lastMessage?.content.trim() || "";
    const codeBlockRegex = /```([\s\S]+?)```/g;
    const match = lastMessageContent.match(codeBlockRegex);

    if (match && lastMessage.role != "user") {
      const { text, codes } = extractCodeAndText(
        lastMessageContent,
        lastMessage.uniqueId
      );
      messages[messages.length - 1].content = text;
      setCodeContent((prev) => [...(prev ?? []), ...codes]);
      setCodeSidebarOpen(true);
    } else {
      setCodeSidebarOpen(false);
    }
  }, [messages]);

  const downloadFile = () => {
    if (codeContent) {
      const blob = new Blob(
        [
          codeContent.find((codeObj) => codeObj.codeId === selectedCodeIndex)
            ?.code || "",
        ],
        {
          type: "text/plain",
        }
      );
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download =
        codeContent.find((codeObj) => codeObj.codeId === selectedCodeIndex)
          ?.fileName || "code.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const copyToClipboard = async () => {
    if (codeContent) {
      await navigator.clipboard.writeText(
        codeContent.find((codeObj) => codeObj.codeId === selectedCodeIndex)
          ?.code || ""
      );
      toast.success("Code copied to clipboard!");
    }
  };

  const processContent = (content: string) => {
    return content.split("\n").map((line, i) => {
      const formattedLine = line.replace(/`([^`]+)`/g, (match, code) => {
        return `<code class="bg-[#1F1F22] text-sm text-white p-1 rounded">${code}</code>`;
      });
      if (
        line.trim().startsWith("•") ||
        line.trim().startsWith("-") ||
        line.trim().match(/^\d/)
      ) {
        return (
          <div
            key={i}
            className="ml-4"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      }
      return (
        <div key={i} dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  if (status === "loading") {
    return <MainLoader />;
  }

  return (
    <div className="flex h-screen bg-[#09090b]">
      <main className="flex-1 flex flex-col items-center overflow-hidden">
        <header className="bg-background flex items-center w-full">
          <Header />
        </header>

        {/* Chat messages */}
        <ScrollArea
          className={`flex-1 p-4 bg-[#09090b] text-white ${
            codeSidebarOpen ? "w-[100%]" : "w-[60%]"
          } rounded-md mt-2`}
        >
          <div className="space-y-4">
            {messages.map((message, index) => {
              const splitContent = message.content.includes(message.uniqueId)
                ? message.content.split(message.uniqueId)
                : null;

              return (
                <div
                  key={index}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                  className={`flex justify-start`}
                >
                  <div
                    className={`flex items-start justify-start gap-2 rounded-lg whitespace-pre-wrap max-w-[80%] break-words ${
                      message.content === "V1 is thinking...."
                        ? ""
                        : message.role === "user"
                        ? "text-primary-foreground p-1"
                        : "p-2"
                    }`}
                  >
                    <div className={`mt-1`}>
                      {message.role === "user" ? (
                        <Image
                          src={session?.user?.imageUrl || ""}
                          width={200}
                          height={200}
                          alt="user image"
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="font-bold font-serif text-slate-100">
                          v1
                        </div>
                      )}
                    </div>
                    <div className="font-sans text-base leading-loose">
                      {splitContent ? (
                        splitContent.map((contentPart, i) => (
                          <React.Fragment key={i}>
                            {processContent(contentPart)}
                            {codeContent
                              ?.filter(
                                (codeObj) =>
                                  codeObj.uniqueId === message.uniqueId
                              )
                              ?.map((codeObj) => {
                                if (codeObj.order === i + 1) {
                                  return (
                                    <button
                                      key={codeObj.uniqueId}
                                      className="flex items-center p-2 my-4 border-2 shadow-2xl border-stone-300 bg-[#09090b] text-white rounded-md"
                                      onClick={() => {
                                        setCodeSidebarOpen(true);
                                        setSelectedCodeIndex(codeObj.codeId);
                                      }}
                                    >
                                      <div className="flex items-center space-x-2 px-3 py-2">
                                        <Cog size={18} />
                                        <span className="text-sm font-medium">
                                          {codeObj.fileName ?? "code.txt"}{" "}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                }
                                return null;
                              })}
                          </React.Fragment>
                        ))
                      ) : message.content === "V1 is thinking...." ? (
                        <Loader />
                      ) : (
                        processContent(message.content)
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className={`p-4 ${codeSidebarOpen ? "w-[100%]" : "w-[60%]"}`}
        >
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={input}
              autoFocus={true}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-white"
            />
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="ml-2 text-white"
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal />
              )}
            </Button>
          </div>
        </form>
      </main>
      {codeSidebarOpen && (
        <aside
          className={`w-1/2 bg-[#09090b] border-l border-gray-400 text-white px-2 pt-1 overflow-auto transition-all duration-300 ${
            codeSidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {codeContent ? (
            <ScrollArea className="h-[calc(100vh-1rem)] w-full rounded-md bg-[#111B27]">
              <div className="flex space-x-2 justify-start items-center pt-2">
                <div className="flex items-center space-x-2 px-3 py-2 border-r border-gray-700">
                  <Cog size={18} />
                  <span className="text-sm">
                    {codeContent.find(
                      (codeObj) => codeObj.codeId === selectedCodeIndex
                    )?.fileName ?? "code.txt"}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={downloadFile}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                  <Clipboard className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCodeSidebarOpen(false)}
                >
                  <X size={18} />
                </Button>
              </div>
              <SyntaxHighlighter
                language="javascript"
                style={coldarkDark}
                customStyle={{
                  fontSize: "16px",
                  borderRadius: "8px",
                  padding: "0px 16px 16px 16px",
                  maxHeight: "100%",
                  overflow: "visible",
                }}
              >
                {codeContent.find(
                  (codeObj) => codeObj.codeId === selectedCodeIndex
                )?.code || ""}
              </SyntaxHighlighter>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <div>No code snippet available</div>
          )}
        </aside>
      )}
    </div>
  );
}
