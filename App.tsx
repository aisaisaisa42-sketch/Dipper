import React, { useState, useRef, useEffect } from 'react';
import { streamAppConfig, generateImage } from './services/geminiService';
import { authService, usageService, projectService } from './services/mockBackend';
import { AppSchema, ChatMessage, User, Project, ViewState, GeneratedImage } from './types';
import PreviewEngine from './components/PreviewEngine';
import { 
  Send, Loader2, Terminal, Folder, MessageSquare, Eye, Share2, Download, 
  ArrowLeft, FileCode, Smartphone, Monitor, Menu, X, Bot, Zap, LayoutDashboard, 
  LogOut, Plus, Code, Save, Trash2, User as UserIcon, Lock, ImageIcon, Sparkles,
  Rocket, Shield, Database
} from 'lucide-react';

// --- INITIAL CONSTANTS ---
const INITIAL_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-slate-50 flex items-center justify-center min-h-screen">
    <div class="text-center p-8 bg-white rounded-xl shadow-lg">
        <h1 class="text-2xl font-bold text-slate-800 mb-2">Welcome to AMy AI</h1>
        <p class="text-slate-600">Start describing your app to generate code.</p>
    </div>
    <script>lucide.createIcons();</script>
</body>
</html>`;

const INITIAL_APP_STATE: AppSchema = {
  appName: "Untitled App",
  description: "A new project",
  code: INITIAL_CODE
};

// --- LANDING PAGE COMPONENT ---
const LandingPage = ({ onStart, onLogin, onSignup }: { onStart: () => void, onLogin: () => void, onSignup: () => void }) => (
  <div className="min-h-screen bg-[#09090b] text-white overflow-y-auto font-sans">
    {/* Nav */}
    <nav className="border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
       <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
               <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">AMy <span className="text-orange-500">AI</span></span>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={onLogin} className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:block">Log In</button>
             <button onClick={onSignup} className="text-sm font-medium bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">Sign Up</button>
          </div>
       </div>
    </nav>

    {/* Hero */}
    <section className="pt-20 pb-32 px-4 text-center relative overflow-hidden">
       {/* Background Effects */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none opacity-50"></div>
       
       <div className="relative z-10 max-w-4xl mx-auto">
         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-orange-300 mb-8">
            <Sparkles className="w-3 h-3" />
            <span>Now with Auto-Image Generation</span>
         </div>
         <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
           Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Web Apps</span><br />
           at the Speed of Thought
         </h1>
         <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
           Describe your idea in plain English. AMy AI writes the code, designs the UI, creates the database structure, and generates assets instantly.
         </p>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onStart} className="w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2">
              <Rocket className="w-5 h-5" /> Start Building for Free
            </button>
            <button onClick={onSignup} className="w-full sm:w-auto px-8 py-4 bg-[#18181b] hover:bg-[#202022] text-white border border-white/10 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2">
               Create Account
            </button>
         </div>
       </div>
    </section>

    {/* Features */}
    <section className="py-24 bg-[#0c0c0e] border-t border-white/5">
       <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to ship</h2>
            <p className="text-gray-400">From concept to code without the headache.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <FeatureCard 
               icon={<Zap className="w-6 h-6 text-yellow-400" />}
               title="Instant Generation"
               desc="From text prompt to fully functional HTML/JS code in seconds. No waiting for compilations."
             />
             <FeatureCard 
               icon={<ImageIcon className="w-6 h-6 text-pink-400" />}
               title="AI Asset Creation"
               desc="Automatically generates professional product images, icons, and graphics for your app."
             />
             <FeatureCard 
               icon={<Code className="w-6 h-6 text-blue-400" />}
               title="Clean Code Export"
               desc="Get clean, editable HTML, Tailwind CSS, and JavaScript. Download and host anywhere."
             />
             <FeatureCard 
               icon={<Shield className="w-6 h-6 text-green-400" />}
               title="Auth & Security"
               desc="Built-in authentication flows and secure mock backend simulation for testing."
             />
             <FeatureCard 
               icon={<Database className="w-6 h-6 text-purple-400" />}
               title="Project Management"
               desc="Save your projects, iterate on versions, and manage your portfolio."
             />
             <FeatureCard 
               icon={<Smartphone className="w-6 h-6 text-orange-400" />}
               title="Responsive Design"
               desc="All generated apps are mobile-first and fully responsive out of the box."
             />
          </div>
       </div>
    </section>
    
    {/* Footer */}
    <footer className="py-10 text-center text-gray-600 border-t border-white/5 text-sm bg-[#09090b]">
      &copy; {new Date().getFullYear()} AMy AI Inc. All rights reserved.
    </footer>
  </div>
);

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-8 rounded-2xl bg-[#18181b] border border-white/5 hover:border-orange-500/20 transition-all hover:bg-[#1a1a1d] group">
    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-100">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

export default function App() {
  // --- GLOBAL STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('landing');
  const [isLoading, setIsLoading] = useState(true);

  // --- EDITOR STATE ---
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<'idle' | 'coding' | 'assets'>('idle');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentCode, setCurrentCode] = useState(INITIAL_CODE);
  
  // --- UI STATE ---
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [mobileActiveTab, setMobileActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initAuth = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setView('dashboard');
      } else {
        setView('landing'); // Guest mode start
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // --- SCROLL CHAT ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, mobileActiveTab, generationPhase]);

  // --- ACTIONS ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      const { user } = await authService.signIn(
        formData.get('email') as string, 
        formData.get('password') as string
      );
      setCurrentUser(user);
      setView('dashboard');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      const { user } = await authService.signUp(
        formData.get('name') as string,
        formData.get('email') as string, 
        formData.get('password') as string
      );
      setCurrentUser(user);
      setView('dashboard');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    authService.signOut();
    setCurrentUser(null);
    setView('landing');
    setActiveProject(null);
  };

  const createNewProject = async () => {
    if (!currentUser) {
      // Guest mode project (temporary)
      setActiveProject({
        id: 'guest_proj',
        userId: 'guest',
        name: 'Guest Project',
        description: 'Temporary',
        code: INITIAL_CODE,
        messages: [],
        images: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      setChatHistory([{ role: 'assistant', content: "I'm ready! Describe your app to start building.", timestamp: Date.now() }]);
      setCurrentCode(INITIAL_CODE);
      setView('editor');
      return;
    }

    const proj = await projectService.createProject(currentUser.id, "New Project", "A generated web app");
    loadProject(proj);
  };

  const loadProject = (proj: Project) => {
    setActiveProject(proj);
    setChatHistory(proj.messages.length > 0 ? proj.messages : [
      { role: 'assistant', content: "Project loaded. How can I help you iterate?", timestamp: Date.now() }
    ]);
    setCurrentCode(proj.code || INITIAL_CODE);
    setView('editor');
  };

  const handleDownload = () => {
    if (!activeProject) return;
    const blob = new Blob([activeProject.code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(activeProject.name || 'app').replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    // 1. Check Credits / Limits
    if (currentUser) {
      if (currentUser.credits <= 0) {
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: "❌ You have 0 credits left. Please upgrade to continue generating apps.", 
          timestamp: Date.now() 
        }]);
        return;
      }
    } else {
      if (!usageService.checkGuestLimit()) {
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: "🔒 Free guest limit reached. Please Sign Up to get 20 free credits and save your projects!", 
          timestamp: Date.now() 
        }]);
        return;
      }
    }

    // 2. Setup UI
    const userMsg: ChatMessage = { role: 'user', content: prompt, timestamp: Date.now() };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setPrompt('');
    setIsGenerating(true);
    setGenerationPhase('coding');

    const botMsgId = Date.now();
    setChatHistory(prev => [...prev, { 
      role: 'assistant', content: "", timestamp: botMsgId, isStreaming: true, streamContent: ""
    }]);

    // 3. Deduct Credit & Generate
    try {
      if (currentUser) {
        const updatedUser = await usageService.deductCredit(currentUser.id);
        setCurrentUser(updatedUser);
      } else {
        usageService.incrementGuestUsage();
      }

      let fullText = "";
      const stream = streamAppConfig(userMsg.content);

      for await (const chunk of stream) {
        if (chunk) {
          fullText += chunk;
          setChatHistory(prev => prev.map(msg => 
            msg.timestamp === botMsgId ? { ...msg, streamContent: fullText } : msg
          ));
        }
      }

      // 4. Parse Code
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      const jsonToParse = jsonMatch ? jsonMatch[0] : fullText;
      const config = JSON.parse(jsonToParse) as AppSchema;
      
      let processedCode = config.code;
      setCurrentCode(processedCode);

      // 5. ASSET GENERATION PHASE
      setGenerationPhase('assets');
      
      // Parse HTML to find images needing generation
      const parser = new DOMParser();
      const doc = parser.parseFromString(processedCode, 'text/html');
      const imagesToGenerate = Array.from(doc.querySelectorAll('img[data-image-prompt]'));

      if (imagesToGenerate.length > 0) {
         setChatHistory(prev => prev.map(msg => 
            msg.timestamp === botMsgId 
              ? { ...msg, streamContent: msg.streamContent + "\n\n🎨 Generating product images..." } 
              : msg
          ));

         const newImages: GeneratedImage[] = [];

         // Process sequentially to not hit rate limits too hard (or parallel if API allows)
         for (const img of imagesToGenerate) {
            const prompt = img.getAttribute('data-image-prompt');
            if (prompt) {
               const base64 = await generateImage(prompt);
               if (base64) {
                  const oldTag = img.outerHTML;
                  img.setAttribute('src', base64);
                  img.removeAttribute('data-image-prompt');
                  const newTag = img.outerHTML;
                  
                  // Use robust replacement in the big string
                  processedCode = processedCode.replace(oldTag, newTag);

                  // Save to project assets
                  newImages.push({
                     id: 'img_' + Date.now() + Math.random(),
                     prompt: prompt,
                     url: base64,
                     createdAt: Date.now()
                  });
               }
            }
         }

         // Update code with real images
         setCurrentCode(processedCode);
         if (activeProject) {
            activeProject.images = [...(activeProject.images || []), ...newImages];
         }
      }
      
      const successMsg: ChatMessage = { 
        role: 'assistant', 
        content: `Built "${config.appName}" with ${imagesToGenerate.length} generated assets. Preview updated!`, 
        timestamp: botMsgId 
      };

      const finalHistory = [...newHistory, successMsg];
      setChatHistory(finalHistory);

      // Auto-save if logged in
      if (currentUser && activeProject) {
        const updatedProject: Project = {
          ...activeProject,
          name: config.appName,
          description: config.description,
          code: processedCode,
          messages: finalHistory,
          images: activeProject.images
        };
        await projectService.updateProject(updatedProject);
        setActiveProject(updatedProject);
      }
      
      setViewMode('preview');
      setMobileActiveTab('preview');

    } catch (error: any) {
      console.error(error);
      setChatHistory(prev => prev.map(msg => 
        msg.timestamp === botMsgId 
          ? { ...msg, isStreaming: false, content: "Error generating code. Please try again." } 
          : msg
      ));
    } finally {
      setIsGenerating(false);
      setGenerationPhase('idle');
    }
  };

  // --- RENDER HELPERS ---

  if (isLoading) return <div className="h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex flex-col h-screen w-full bg-[#09090b] text-white font-sans selection:bg-orange-500/30">
      
      {/* --- HEADER (ONLY SHOW INSIDE APP) --- */}
      {view !== 'landing' && view !== 'login' && view !== 'signup' && (
      <header className="h-14 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4 z-20 flex-shrink-0">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => currentUser ? setView('dashboard') : setView('landing')}>
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
                <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white hidden sm:block">AMy <span className="text-orange-500">AI</span></span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {currentUser ? (
             <>
               <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                 <Zap className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                 <span className="text-xs font-medium text-orange-300">{currentUser.credits} Credits</span>
               </div>
               <div className="flex items-center gap-2">
                 {activeProject && (
                    <button onClick={handleDownload} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors" title="Export Code">
                       <Download className="w-5 h-5" />
                    </button>
                 )}
                 <button onClick={() => setView('dashboard')} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors" title="Dashboard">
                   <LayoutDashboard className="w-5 h-5" />
                 </button>
                 <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                 <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-colors" title="Sign Out">
                   <LogOut className="w-5 h-5" />
                 </button>
               </div>
             </>
           ) : (
             <div className="flex items-center gap-3">
               <button onClick={() => setView('login')} className="text-sm font-medium text-gray-300 hover:text-white">Login</button>
               <button onClick={() => setView('signup')} className="text-sm font-medium bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition-all">Sign Up</button>
             </div>
           )}
        </div>
      </header>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* VIEW: LANDING (Guest) */}
        {view === 'landing' && !currentUser && (
           <LandingPage onStart={createNewProject} onLogin={() => setView('login')} onSignup={() => setView('signup')} />
        )}

        {/* VIEW: AUTH (LOGIN/SIGNUP) */}
        {(view === 'login' || view === 'signup') && (
          <div className="absolute inset-0 z-50 bg-[#09090b] flex items-center justify-center p-4">
             {/* Back Button for Auth */}
             <button onClick={() => setView('landing')} className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2">
               <ArrowLeft className="w-4 h-4" /> Back to Home
             </button>

             <div className="w-full max-w-md bg-[#0c0c0e] border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                   <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-7 h-7 text-white" />
                   </div>
                   <h2 className="text-2xl font-bold text-white">
                     {view === 'login' ? 'Welcome Back' : 'Create Account'}
                   </h2>
                </div>
                <form onSubmit={view === 'login' ? handleLogin : handleSignup} className="space-y-4">
                  {view === 'signup' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                      <input name="name" type="text" required className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-orange-500 outline-none transition-colors" placeholder="John Doe" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Email Address</label>
                    <input name="email" type="email" required className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-orange-500 outline-none transition-colors" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Password</label>
                    <input name="password" type="password" required className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-orange-500 outline-none transition-colors" placeholder="••••••••" />
                  </div>
                  <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium py-2.5 rounded-lg transition-all mt-2">
                    {view === 'login' ? 'Sign In' : 'Sign Up'}
                  </button>
                </form>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-orange-400 hover:underline">
                      {view === 'login' ? 'Sign Up' : 'Log In'}
                    </button>
                  </p>
                </div>
             </div>
          </div>
        )}

        {/* VIEW: DASHBOARD */}
        {view === 'dashboard' && currentUser && (
          <div className="absolute inset-0 bg-[#09090b] overflow-y-auto p-4 sm:p-8">
             <div className="max-w-6xl mx-auto">
               
               {/* Dashboard Stats */}
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                 <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-3">
                      <Zap className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-3xl font-bold text-white mb-1">{currentUser.credits}</span>
                    <span className="text-sm text-gray-400">Available Credits</span>
                 </div>
                 <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
                      <Folder className="w-5 h-5 text-blue-500" />
                    </div>
                    <DashboardProjectCount userId={currentUser.id} />
                 </div>
                 <div className="bg-gradient-to-br from-orange-600 to-amber-700 p-6 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden cursor-pointer hover:shadow-lg transition-all" onClick={createNewProject}>
                    <Plus className="w-8 h-8 text-white mb-2" />
                    <span className="font-bold text-white text-lg">New Project</span>
                    <span className="text-orange-100 text-xs mt-1">Build something new</span>
                 </div>
               </div>

               {/* Projects List */}
               <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                 <Code className="w-5 h-5 text-gray-400" /> Your Projects
               </h2>
               <DashboardProjectList userId={currentUser.id} onLoad={loadProject} onDelete={async (id) => {
                 await projectService.deleteProject(id);
                 // Force refresh logic would ideally go here, but component will remount on state change
                 setView('dashboard'); // trigger re-render
               }} />

             </div>
          </div>
        )}

        {/* VIEW: EDITOR */}
        {view === 'editor' && (
          <div className="absolute inset-0 flex">
            
            {/* LEFT PANEL: CHAT */}
            <div className={`${mobileActiveTab === 'editor' ? 'flex' : 'hidden'} md:flex w-full md:w-[400px] flex-col border-r border-white/5 bg-[#0c0c0e] flex-shrink-0 z-10 relative`}>
              {/* Chat Header */}
              <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0c0c0e]">
                 <div className="flex items-center gap-2 overflow-hidden">
                    <MessageSquare className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-200 truncate">{activeProject?.name}</span>
                 </div>
                 {/* Auto-save indicator */}
                 {currentUser && <div className="text-[10px] text-gray-500 flex items-center gap-1"><Save className="w-3 h-3" /> Saved</div>}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 pb-20 md:pb-4">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {msg.isStreaming ? (
                        <div className="w-full max-w-full rounded-lg bg-[#0c0c0e] border border-orange-500/30 overflow-hidden shadow-2xl shadow-orange-900/10">
                          <div className="bg-orange-500/10 px-3 py-2 border-b border-orange-500/20 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 text-orange-400 animate-spin" />
                                <span className="text-xs font-mono text-orange-300">
                                  {generationPhase === 'assets' ? 'GENERATING ASSETS...' : 'BUILDING...'}
                                </span>
                              </div>
                          </div>
                          <div className="p-3">
                              <pre className="font-mono text-[10px] leading-4 text-orange-100/70 whitespace-pre-wrap break-all h-32 overflow-y-auto custom-scrollbar opacity-80">
                                {msg.streamContent || "Initializing..."}
                              </pre>
                          </div>
                        </div>
                      ) : (
                        <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-orange-600 text-white rounded-br-none' : 'bg-[#18181b] text-gray-300 rounded-bl-none border border-white/5'}`}>
                          {msg.content}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-[#09090b] border-t border-white/5">
                <div className="relative flex items-center bg-[#0c0c0e] rounded-xl border border-white/10 p-1.5 focus-within:border-white/20 transition-colors">
                   <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                      placeholder={currentUser ? "Describe functionality..." : "Describe app (Guest mode)..."}
                      className="w-full bg-transparent border-none text-sm text-gray-200 placeholder-gray-600 focus:ring-0 resize-none h-12 py-3 px-3 scrollbar-hide"
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className="p-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-[#18181b] disabled:text-gray-600 text-white rounded-lg transition-all"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
                {!currentUser && <p className="text-[10px] text-gray-600 mt-2 text-center">Guest Mode: Projects are not saved.</p>}
              </div>
            </div>

            {/* RIGHT PANEL: PREVIEW */}
            <div className={`${mobileActiveTab === 'preview' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-[#09090b] relative min-w-0 border-l border-white/5`}>
               <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0c0c0e]">
                  <div className="flex items-center gap-4">
                     {/* View Mode Switcher */}
                     <div className="flex bg-[#18181b] rounded p-0.5 border border-white/5">
                       <button onClick={() => setViewMode('preview')} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === 'preview' ? 'bg-[#27272a] text-white' : 'text-gray-500'}`}>Preview</button>
                       <button onClick={() => setViewMode('code')} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === 'code' ? 'bg-[#27272a] text-white' : 'text-gray-500'}`}>Code</button>
                    </div>
                  </div>
                  {/* Device Toggles */}
                  {viewMode === 'preview' && (
                    <div className="hidden md:flex bg-[#18181b] rounded p-0.5 border border-white/5">
                      <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-[#27272a] text-white' : 'text-gray-500'}`}><Monitor className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-[#27272a] text-white' : 'text-gray-500'}`}><Smartphone className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
               </div>

               <div className="flex-1 bg-[#18181b] flex flex-col justify-center items-center overflow-hidden pb-16 md:pb-0 relative">
                 {viewMode === 'preview' ? (
                   <div className={`transition-all duration-300 h-full w-full ${previewDevice === 'mobile' ? 'max-w-[375px] max-h-[812px] my-auto border-4 border-gray-800 rounded-[2rem] overflow-hidden bg-white' : ''}`}>
                      <PreviewEngine code={currentCode} />
                   </div>
                 ) : (
                   <div className="w-full h-full bg-[#0c0c0e] overflow-auto p-4 custom-scrollbar">
                     <pre className="text-xs font-mono text-blue-300 whitespace-pre-wrap">{currentCode}</pre>
                   </div>
                 )}
               </div>
            </div>

            {/* MOBILE NAV */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 h-14 bg-[#0c0c0e] border-t border-white/10 flex items-center justify-around z-50">
               <button onClick={() => setMobileActiveTab('editor')} className={`flex flex-col items-center gap-1 ${mobileActiveTab === 'editor' ? 'text-orange-500' : 'text-gray-500'}`}>
                 <MessageSquare className="w-5 h-5" /><span className="text-[10px]">Chat</span>
               </button>
               <button onClick={() => setMobileActiveTab('preview')} className={`flex flex-col items-center gap-1 ${mobileActiveTab === 'preview' ? 'text-green-500' : 'text-gray-500'}`}>
                 <Eye className="w-5 h-5" /><span className="text-[10px]">Preview</span>
               </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function DashboardProjectCount({ userId }: { userId: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    projectService.getUserProjects(userId).then(projs => setCount(projs.length));
  }, [userId]);
  return (
    <>
      <span className="text-3xl font-bold text-white mb-1">{count}</span>
      <span className="text-sm text-gray-400">Total Projects</span>
    </>
  );
}

function DashboardProjectList({ userId, onLoad, onDelete }: { userId: string, onLoad: (p: Project) => void, onDelete: (id: string) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  
  useEffect(() => {
    projectService.getUserProjects(userId).then(setProjects);
  }, [userId]);

  if (projects.length === 0) {
    return <div className="text-gray-500 text-center py-10 border border-dashed border-white/10 rounded-xl">No projects yet. Create one!</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map(proj => (
        <div key={proj.id} className="bg-[#0c0c0e] border border-white/5 rounded-xl p-5 hover:border-orange-500/30 transition-all group relative">
           <div className="flex items-start justify-between mb-3">
             <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/5 overflow-hidden">
               {proj.images && proj.images.length > 0 ? (
                 <img src={proj.images[0].url} className="w-full h-full object-cover" />
               ) : (
                 <FileCode className="w-5 h-5 text-gray-400" />
               )}
             </div>
             <button onClick={(e) => { e.stopPropagation(); onDelete(proj.id); }} className="text-gray-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <Trash2 className="w-4 h-4" />
             </button>
           </div>
           <h3 className="font-semibold text-gray-200 mb-1">{proj.name}</h3>
           <p className="text-xs text-gray-500 line-clamp-2 mb-4 h-8">{proj.description}</p>
           <button onClick={() => onLoad(proj)} className="w-full py-2 rounded-lg bg-[#18181b] hover:bg-white text-gray-300 hover:text-black text-xs font-medium transition-colors border border-white/5">
             Open Project
           </button>
        </div>
      ))}
    </div>
  );
}
