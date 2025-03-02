"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Upload, File, X, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  path?: string;
  isUploading?: boolean;
  error?: string;
}

export default function DashboardPage() {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! How can I help you with your CV today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Auto-scroll to bottom when messages change if autoScroll is enabled
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom()
    }
  }, [messages, autoScroll])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Detect manual scrolling to disable auto-scroll when user scrolls up
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      // If user has scrolled up more than 100px from bottom, disable auto-scroll
      // If user has scrolled to bottom, enable auto-scroll
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
      setAutoScroll(isAtBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      
      if (!data.session) {
        router.push("/login")
        return
      }
      
      setLoading(false)
    }

    checkUser()
  }, [router])

  // Load user's files on initial render
  useEffect(() => {
    const fetchUserFiles = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user?.id) {
        setUserId(session.user.id)
        
        // Fetch user's files from storage
        const { data, error } = await supabase
          .storage
          .from('files')
          .list(session.user.id, {
            sortBy: { column: 'created_at', order: 'desc' }
          })
        
        if (error) {
          console.error('Error fetching files:', error)
          return
        }
        
        if (data) {
          // Convert storage objects to our UploadedFile format
          const files = data.map(file => ({
            id: file.id || crypto.randomUUID(),
            name: file.name,
            size: file.metadata?.size || 0,
            uploadedAt: new Date(file.created_at || Date.now()),
            path: `${session.user.id}/${file.name}`
          }))
          
          setUploadedFiles(files)
        }
      }
    }
    
    fetchUserFiles()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm analyzing your CV. This is a demo response. In the future, I'll provide intelligent insights about your resume!",
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    }, 1000)
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0 || !userId) return
    
    const newFiles: UploadedFile[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const id = crypto.randomUUID()
      
      // Create temporary file object with uploading status
      const tempFile: UploadedFile = {
        id,
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        isUploading: true
      }
      
      // Add to state immediately to show upload in progress
      setUploadedFiles(prev => [...prev, tempFile])
      
      try {
        // Upload to Supabase with userId as the first path segment
        const filePath = `${userId}/${file.name}`
        const { error } = await supabase
          .storage
          .from('files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          })
        
        if (error) throw error
        
        // Update file with path and remove uploading status
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === id 
              ? { ...f, path: filePath, isUploading: false } 
              : f
          )
        )
        
        newFiles.push({
          ...tempFile,
          path: filePath,
          isUploading: false
        })
      } catch (error: any) {
        console.error('Error uploading file:', error)
        
        // Mark file with error
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === id 
              ? { ...f, isUploading: false, error: error.message || 'Upload failed' } 
              : f
          )
        )
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = async (id: string, path?: string) => {
    // If file has been uploaded to Supabase, remove it from storage
    if (path) {
      try {
        const { error } = await supabase
          .storage
          .from('files')
          .remove([path])
        
        if (error) throw error
      } catch (error) {
        console.error('Error removing file from storage:', error)
      }
    }
    
    // Remove from local state
    setUploadedFiles(prev => prev.filter(file => file.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <Header onSignOut={handleSignOut} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 flex overflow-hidden">
        {activeTab === "chat" ? (
          <div className="flex flex-col w-full max-w-4xl mx-auto h-full">
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4"
            >
              <div className="min-h-full flex flex-col justify-end">
                <div className="space-y-4 w-full">
                  <AnimatePresence initial={false}>
                    {messages.map((message) => (
                      <motion.div 
                        key={message.id} 
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        initial={{ 
                          opacity: 0, 
                          y: 20, 
                          scale: 0.95,
                          ...(message.sender === 'user' ? { x: 20 } : { x: -20 })
                        }}
                        animate={{ 
                          opacity: 1, 
                          y: 0, 
                          scale: 1,
                          x: 0
                        }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 350, 
                          damping: 25,
                          duration: 0.3
                        }}
                      >
                        <div 
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.sender === 'user' 
                              ? 'bg-yellow-300 text-gray-900' 
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <div className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-gray-700' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
            <div className="border-t p-4 bg-background">
              {!autoScroll && (
                <div className="flex justify-center mb-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setAutoScroll(true)
                      scrollToBottom()
                    }}
                    className="text-xs rounded-full px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary"
                  >
                    Scroll to bottom
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage()
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  className="px-3"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full max-w-4xl mx-auto h-full p-6 gap-8">
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-200 hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                accept=".pdf,.doc,.docx,.txt,.rtf"
              />
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 text-gray-400" />
                <h3 className="text-lg font-semibold">Upload your CV or Resume</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your files here, or click to select files
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: PDF, Word, Text
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                >
                  Select Files
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Uploaded Files</h2>
              <AnimatePresence initial={false}>
                {uploadedFiles.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No files uploaded yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          file.error ? 'bg-red-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <File className={`w-5 h-5 ${file.error ? 'text-red-500' : 'text-primary'}`} />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className={`text-xs ${file.error ? 'text-red-500' : 'text-muted-foreground'}`}>
                              {file.error ? file.error : `${formatFileSize(file.size)} • ${file.uploadedAt.toLocaleTimeString()}`}
                            </p>
                          </div>
                        </div>
                        {file.isUploading ? (
                          <div className="flex items-center">
                            <Loader2 className="w-4 h-4 animate-spin text-primary mr-2" />
                            <span className="text-xs text-muted-foreground">Uploading...</span>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id, file.path)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Header({ 
  onSignOut, 
  activeTab, 
  onTabChange 
}: { 
  onSignOut: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <header className="w-full py-6 border-b">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="text-xl font-bold">
            <span className="text-foreground">Curricu</span>
            <span className="text-primary">llm</span>
          </div>
          
          <nav className="flex items-center gap-4">
            <button
              onClick={() => onTabChange("chat")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "chat"
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => onTabChange("files")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "files"
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Files
            </button>
          </nav>
        </div>

        <Button 
          variant="ghost" 
          onClick={onSignOut}
          className="text-sm font-medium hover:text-primary transition-colors"
        >
          Sign Out
        </Button>
      </div>
    </header>
  )
} 