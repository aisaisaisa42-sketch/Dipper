import React, { useState, useRef, useEffect } from 'react';
import { streamAppConfig } from './services/geminiService';
import { AppSchema, ChatMessage } from './types';
import PreviewEngine from './components/PreviewEngine';
import { 
  Send, 
  Loader2, 
  Terminal,
  Folder,
  MessageSquare,
  Eye,
  Share2,
  Download,
  ArrowLeft,
  FileCode,
  Smartphone,
  Monitor,
  Menu,
  X,
  Bot,
  Zap
} from 'lucide-react';

const INITIAL_CODE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-slate-50 flex items-center justify-center min-h-screen p-4">
    <div class="text-center max-w-lg">
        <div class="bg-white p-4 rounded-2xl shadow-sm inline-block mb-6 relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            <div class="relative bg-white rounded-2xl p-2">
               <i data-lucide="bot" class="w-12 h-12 text-orange-600"></i>
            </div>
        </div>
        <h1 class="text-4xl font-bold text-slate-900 mb-4 tracking-tight">AMy AI <span class="text-orange-600">Builder</span></h1>
        <p class="text-slate-600 text-lg mb-8">
            Ready to build? Describe your web app in the chat, and I'll write the code for you instantly.
        </p>
        <div class="flex items-center justify-center gap-4 text-sm text-slate-400">
            <span class="flex items-center gap-1"><i data-lucide="check-circle" class="w-4 h-4"></i> HTML5</span>
            <span class="flex items-center gap-1"><i data-lucide="check-circle" class="w-4 h-4"></i> Tailwind</span>
            <span class="flex items-center gap-1"><i data-lucide="check-circle" class="w-4 h-4"></i> JS</span>
        </div>
    </div>
    <script>
        lucide.createIcons();
    </script>
</body>
</html>
`;

const INITIAL_APP_STATE: AppSchema = {
  appName: "Start Here",
  description: "Your generated app will appear here.",
  code: INITIAL_CODE
};

// Subcomponent for File Items
interface FileItemProps {
  name: string;
  active: boolean;
}

const FileItem: React.FC<FileItemProps> = ({ name, active }) => (
  <div className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all duration-200 group ${active ? 'bg-blue-600/10' : 'hover:bg-white/5'}`}>
    <FileCode className={`w-3.5 h-3.5 transition-colors ${active ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-400'}`} />
    <span className={`text-sm truncate transition-colors ${active ? 'text-blue-100 font-medium' : 'text-gray-400 group-hover:text-gray-300'}`}>{name}</span>
  </div>
);

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [appConfig, setAppConfig] = useState<AppSchema>(INITIAL_APP_STATE);
  
  // View States
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'files'>('chat');
  const [mobileActiveTab, setMobileActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'assistant', content: "I'm in Full Stack Mode. I will generate complete, working HTML/JS apps for you. What shall we build?", timestamp: Date.now() }
  ]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, sidebarTab, mobileActiveTab]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    const userMsg: ChatMessage = { role: 'user', content: prompt, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setPrompt('');
    setIsGenerating(true);

    // Create a placeholder message
    const botMsgId = Date.now();
    setChatHistory(prev => [...prev, { 
      role: 'assistant', 
      content: "", 
      timestamp: botMsgId,
      isStreaming: true,
      streamContent: ""
    }]);

    let fullText = "";

    try {
      const stream = streamAppConfig(userMsg.content);

      for await (const chunk of stream) {
        if (chunk) {
          fullText += chunk;
          setChatHistory(prev => prev.map(msg => 
            msg.timestamp === botMsgId ? { ...msg, streamContent: fullText } : msg
          ));
        }
      }

      try {
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        const jsonToParse = jsonMatch ? jsonMatch[0] : fullText;
        const config = JSON.parse(jsonToParse) as AppSchema;
        
        setAppConfig(config);
        
        // Success: Update chat and switch to preview
        setChatHistory(prev => prev.map(msg => 
          msg.timestamp === botMsgId 
            ? { ...msg, isStreaming: false, content: `Built "${config.appName}". Check the preview!` } 
            : msg
        ));
        
        setViewMode('preview');
        setMobileActiveTab('preview'); // Auto-switch to preview on mobile
        
      } catch (e) {
        console.error("JSON Parse Error", e);
        setChatHistory(prev => prev.map(msg => 
          msg.timestamp === botMsgId 
            ? { ...msg, isStreaming: false, content: "I generated code but the format was slightly off. Retrying might fix it." } 
            : msg
        ));
      }

    } catch (error: any) {
      console.error("Generation Error:", error);
      let errorMessage = "An unexpected error occurred.";
      if (error && (error.message || error.toString())) {
        const errStr = error.message || error.toString();
        if (errStr.includes('403') || errStr.toLowerCase().includes('permission')) {
          errorMessage = "API Error (403): Permission Denied. Verify API Key.";
        } else if (errStr.includes('429')) {
          errorMessage = "Rate limit exceeded.";
        } else {
          errorMessage = `Error: ${errStr}`;
        }
      }
      setChatHistory(prev => prev.map(msg => 
        msg.timestamp === botMsgId 
          ? { ...msg, isStreaming: false, content: errorMessage, streamContent: undefined } 
          : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#09090b] text-white overflow-hidden font-sans selection:bg-orange-500/30">
      
      {/* GLOBAL HEADER */}
      <header className="h-14 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4 z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
          
          {/* BRANDING LOGO */}
          <div className="flex items-center gap-2.5">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg opacity-40 blur group-hover:opacity-75 transition duration-200"></div>
                <div className="relative w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                </div>
            </div>
            <span className="font-bold text-lg tracking-tight text-white">AMy <span className="text-orange-500">AI</span></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/5 rounded-lg transition-colors">
              <Share2 className="w-3.5 h-3.5" /> <span className="hidden md:inline">Share</span>
           </button>
           <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white text-black hover:bg-gray-200 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" /> <span className="hidden md:inline">Export</span>
           </button>
           <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-500 border border-white/10 ml-2 shadow-lg shadow-orange-900/20"></div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT PANEL: CHAT / EDITOR (Responsive Toggle) */}
        <div className={`${mobileActiveTab === 'editor' ? 'flex' : 'hidden'} md:flex w-full md:w-[400px] flex-col border-r border-white/5 bg-[#0c0c0e] flex-shrink-0 z-10 absolute md:relative h-full`}>
          
          {/* Panel Header */}
          <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0c0c0e] flex-shrink-0">
             <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-gray-200 tracking-wide">Chat to Edit</span>
             </div>
             
             {/* Tiny Tab Switcher */}
             <div className="flex bg-[#18181b] rounded p-0.5 border border-white/5">
                <button 
                  onClick={() => setSidebarTab('chat')}
                  className={`p-1 rounded transition-colors ${sidebarTab === 'chat' ? 'bg-orange-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  title="Chat"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setSidebarTab('files')}
                  className={`p-1 rounded transition-colors ${sidebarTab === 'files' ? 'bg-orange-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  title="Files"
                >
                  <Folder className="w-3.5 h-3.5" />
                </button>
             </div>
          </div>

          {/* CONTENT: CHAT or FILES */}
          <div className="flex-1 overflow-hidden relative flex flex-col">
            
            {sidebarTab === 'chat' ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 pb-20 md:pb-4">
                   {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.isStreaming ? (
                          <div className="w-full max-w-full rounded-lg bg-[#0c0c0e] border border-orange-500/30 overflow-hidden shadow-2xl shadow-orange-900/10">
                            <div className="bg-orange-500/10 px-3 py-2 border-b border-orange-500/20 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Loader2 className="w-3.5 h-3.5 text-orange-400 animate-spin" />
                                  <span className="text-xs font-mono text-orange-300">WRITING CODE...</span>
                                </div>
                            </div>
                            <div className="p-3">
                                <pre className="font-mono text-[10px] leading-4 text-orange-100/70 whitespace-pre-wrap break-all h-32 overflow-y-auto custom-scrollbar opacity-80">
                                  {msg.streamContent || "Initializing..."}
                                </pre>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                              msg.role === 'user' 
                                ? 'bg-orange-600 text-white rounded-br-none' 
                                : 'bg-[#18181b] text-gray-300 rounded-bl-none border border-white/5'
                            }`}
                          >
                            {msg.content}
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[#09090b] border-t border-white/5 mb-14 md:mb-0">
                  <div className="relative group">
                     <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                     <div className="relative flex items-center bg-[#0c0c0e] rounded-xl border border-white/10 p-1.5 focus-within:border-white/20 transition-colors">
                       <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Build a..."
                          className="w-full bg-transparent border-none text-sm text-gray-200 placeholder-gray-600 focus:ring-0 resize-none h-12 py-3 px-3 scrollbar-hide"
                        />
                        <button
                          onClick={handleGenerate}
                          disabled={isGenerating || !prompt.trim()}
                          className="p-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-[#18181b] disabled:text-gray-600 text-white rounded-lg transition-all shadow-lg shadow-orange-900/20"
                        >
                          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                     </div>
                  </div>
                </div>
              </>
            ) : (
              /* FILES TAB */
              <div className="flex-1 overflow-y-auto p-2">
                 <div className="pl-2 flex flex-col gap-0.5 mt-2">
                    <FileItem name="index.html" active={true} />
                    <FileItem name="style.css" active={false} />
                    <FileItem name="script.js" active={false} />
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: PREVIEW / CODE (Responsive Toggle) */}
        <div className={`${mobileActiveTab === 'preview' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-[#09090b] relative min-w-0 border-l border-white/5 h-full`}>
          
           {/* Preview Header */}
           <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-[#0c0c0e] flex-shrink-0">
              <div className="flex items-center gap-2">
                 <Eye className="w-4 h-4 text-green-500" />
                 <span className="text-sm font-semibold text-gray-200">Preview</span>
                 <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 ml-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[10px] font-medium text-green-500">Live</span>
                 </div>
              </div>

              {/* View & Device Toggles */}
              <div className="flex items-center gap-4">
                 {/* Device Switcher */}
                 {viewMode === 'preview' && (
                    <div className="hidden md:flex bg-[#18181b] rounded p-0.5 border border-white/5">
                      <button 
                        onClick={() => setPreviewDevice('desktop')}
                        className={`p-1.5 rounded transition-all ${previewDevice === 'desktop' ? 'bg-[#27272a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Desktop View"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setPreviewDevice('mobile')}
                        className={`p-1.5 rounded transition-all ${previewDevice === 'mobile' ? 'bg-[#27272a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Mobile View"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                 )}

                 {/* Mode Switcher */}
                 <div className="flex bg-[#18181b] rounded p-0.5 border border-white/5">
                   <button 
                     onClick={() => setViewMode('preview')}
                     className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === 'preview' ? 'bg-[#27272a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                   >
                     Preview
                   </button>
                   <button 
                     onClick={() => setViewMode('code')}
                     className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === 'code' ? 'bg-[#27272a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                   >
                     Code
                   </button>
                </div>
              </div>
           </div>

           {/* Content Canvas */}
           <div className="flex-1 overflow-hidden relative bg-[#18181b] flex flex-col justify-center items-center pb-16 md:pb-0">
             {viewMode === 'preview' ? (
               <div className={`transition-all duration-300 ease-in-out h-full w-full ${previewDevice === 'mobile' ? 'max-w-[375px] max-h-[812px] my-auto border-x border-t border-b-4 border-gray-800 rounded-[2rem] shadow-2xl overflow-hidden bg-white mt-4 mb-4' : ''}`}>
                  <PreviewEngine code={appConfig.code} />
               </div>
             ) : (
               <div className="w-full h-full bg-[#0c0c0e] overflow-hidden flex flex-col">
                 <div className="h-8 bg-[#18181b] flex items-center px-4 border-b border-black flex-shrink-0">
                   <span className="text-xs text-gray-400 font-mono flex items-center gap-2">
                     <Terminal className="w-3 h-3" /> index.html
                   </span>
                 </div>
                 <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                   <pre className="text-xs font-mono text-blue-300 leading-relaxed whitespace-pre-wrap">
                     {appConfig.code}
                   </pre>
                 </div>
               </div>
             )}
           </div>
        </div>

        {/* MOBILE BOTTOM NAVIGATION */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 h-14 bg-[#0c0c0e] border-t border-white/10 flex items-center justify-around z-50">
           <button 
             onClick={() => setMobileActiveTab('editor')}
             className={`flex flex-col items-center gap-1 w-full h-full justify-center ${mobileActiveTab === 'editor' ? 'text-orange-500' : 'text-gray-500'}`}
           >
             <MessageSquare className="w-5 h-5" />
             <span className="text-[10px] font-medium">Editor</span>
           </button>
           <button 
             onClick={() => setMobileActiveTab('preview')}
             className={`flex flex-col items-center gap-1 w-full h-full justify-center ${mobileActiveTab === 'preview' ? 'text-green-500' : 'text-gray-500'}`}
           >
             <Eye className="w-5 h-5" />
             <span className="text-[10px] font-medium">Preview</span>
           </button>
        </div>

      </div>
    </div>
  );
}