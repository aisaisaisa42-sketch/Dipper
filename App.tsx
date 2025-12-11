import React, { useState, useRef, useEffect } from 'react';
import { streamAppConfig, generateImage, cleanAndParseJSON } from './services/geminiService';
import { authService, usageService, projectService, adminService, creditService } from './services/backend';
import { AppSchema, ChatMessage, User, Project, ViewState, GeneratedImage, Transaction } from './types';
import PreviewEngine from './components/PreviewEngine';
import { 
  Send, Loader2, Terminal, Folder, MessageSquare, Eye, Share2, Download, 
  ArrowLeft, FileCode, Smartphone, Monitor, Menu, X, Bot, Zap, LayoutDashboard, 
  LogOut, Plus, Code, Save, Trash2, User as UserIcon, Lock, ImageIcon, Sparkles,
  Rocket, Shield, Database, RefreshCw, AlertTriangle, Search, CheckCircle, Ban,
  CreditCard, Check, Globe
} from 'lucide-react';

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

const ADMIN_EMAIL = "brightgiggletv@gmail.com";

// --- COMPONENTS ---

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => { adminService.getAllUsers().then(setUsers); }, []);
  
  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Admin Console</h2>
      <div className="bg-[#0c0c0e] border border-white/10 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-white/5 text-gray-200">
            <tr>
              <th className="p-4 whitespace-nowrap">User</th>
              <th className="p-4 whitespace-nowrap">Email</th>
              <th className="p-4 whitespace-nowrap">Credits (Free/Paid)</th>
              <th className="p-4 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="p-4 font-medium text-white">{u.name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4"><span className="text-orange-400">{u.freeCredits}</span> / <span className="text-blue-400">{u.purchasedCredits}</span></td>
                <td className="p-4">
                  <button onClick={async () => { await adminService.toggleUserBan(u.id); setUsers(await adminService.getAllUsers()); }} className={`px-3 py-1 rounded text-xs font-bold ${u.isBanned ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                    {u.isBanned ? 'Unban' : 'Ban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LandingPage = ({ onStart, onLogin, onSignup }: { onStart: () => void, onLogin: () => void, onSignup: () => void }) => (
  <div className="min-h-screen bg-[#09090b] text-white font-sans flex flex-col">
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
    <section className="flex-1 flex flex-col items-center justify-center pt-12 pb-24 px-4 text-center relative overflow-hidden">
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none opacity-50"></div>
       <div className="relative z-10 max-w-4xl mx-auto">
         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-orange-300 mb-8">
            <Sparkles className="w-3 h-3" />
            <span>New: Daily Free Credits!</span>
         </div>
         <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
           Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Web Apps</span><br />
           at the Speed of Thought
         </h1>
         <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
           Get 3 FREE credits every single day. No credit card required to start.
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
    <footer className="py-10 text-center text-gray-600 border-t border-white/5 text-sm bg-[#09090b] mt-auto">
      &copy; {new Date().getFullYear()} AMy AI Inc. All rights reserved.
    </footer>
  </div>
);

const PricingPage = ({ onPurchase, onClose }: { onPurchase: (amount: number, cost: number) => void, onClose: () => void }) => {
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleBuy = async (amount: number, cost: number) => {
    setProcessingId(amount);
    await onPurchase(amount, cost);
    setProcessingId(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] z-50 overflow-y-auto p-4 flex flex-col items-center">
       <div className="w-full max-w-5xl flex justify-start mb-8 pt-4">
          <button onClick={onClose} className="text-gray-400 hover:text-white flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
       </div>
       
       <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Upgrade your power</h2>
          <p className="text-gray-400">Choose a credit package that fits your needs.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full mb-12">
          {[
            { credits: 10, cost: 5, color: 'from-blue-500 to-cyan-500' },
            { credits: 50, cost: 20, color: 'from-orange-500 to-amber-500', popular: true },
            { credits: 100, cost: 35, color: 'from-purple-500 to-pink-500' }
          ].map((pkg) => (
            <div key={pkg.credits} className={`relative bg-[#18181b] border ${pkg.popular ? 'border-orange-500' : 'border-white/10'} rounded-2xl p-8 flex flex-col items-center hover:scale-105 transition-transform duration-300`}>
               {pkg.popular && <div className="absolute -top-4 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Most Popular</div>}
               
               <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${pkg.color} flex items-center justify-center mb-6 shadow-lg`}>
                 <Zap className="w-8 h-8 text-white" />
               </div>
               
               <h3 className="text-2xl font-bold text-white mb-2">{pkg.credits} Credits</h3>
               <p className="text-3xl font-bold text-gray-200 mb-6">${pkg.cost}</p>
               
               <ul className="text-gray-400 text-sm space-y-3 mb-8 w-full">
                 <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> No Expiration</li>
                 <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Full Code Access</li>
                 <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Priority Generation</li>
               </ul>
               
               <button 
                 onClick={() => handleBuy(pkg.credits, pkg.cost)}
                 disabled={processingId !== null}
                 className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${processingId === pkg.credits ? 'bg-gray-700 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'}`}
               >
                 {processingId === pkg.credits ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Purchase Now'}
               </button>
            </div>
          ))}
       </div>
    </div>
  );
};

const DashboardProjectList = ({ userId, onLoad, onDelete }: { userId: string, onLoad: (p: Project) => void, onDelete: (id: string) => Promise<void> }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadProjects(); }, [userId]);
  const loadProjects = () => { setLoading(true); projectService.getUserProjects(userId).then(data => { setProjects(data); setLoading(false); }); };
  const handleDelete = async (e: React.MouseEvent, id: string) => { e.stopPropagation(); if (confirm('Delete project?')) { await onDelete(id); loadProjects(); } };
  if (loading) return <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" /></div>;
  if (projects.length === 0) return <div className="text-center py-12 bg-[#0c0c0e] border border-white/5 rounded-xl border-dashed"><p className="text-gray-500">No projects yet.</p></div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map(project => (
        <div key={project.id} onClick={() => onLoad(project)} className="group bg-[#0c0c0e] border border-white/10 rounded-xl p-4 hover:border-orange-500/30 cursor-pointer transition-all hover:shadow-lg hover:shadow-orange-900/10 relative">
          <div className="flex justify-between items-start mb-3">
             <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-white/5 overflow-hidden">
                {project.images && project.images.length > 0 ? <img src={project.images[0].url} className="w-full h-full object-cover" /> : <Code className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />}
             </div>
             <button onClick={(e) => handleDelete(e, project.id)} className="p-2 text-gray-600 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
          </div>
          <h3 className="font-semibold text-white mb-1 truncate">{project.name}</h3>
          <p className="text-xs text-gray-500 mb-4 line-clamp-2">{project.description}</p>
          <div className="flex items-center justify-between text-[10px] text-gray-600 border-t border-white/5 pt-3">
             <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
             <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {project.messages.length}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const ViewerPage = ({ projectId, onBack }: { projectId: string, onBack: () => void }) => {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        projectService.getPublicProject(projectId).then(p => {
            if (p) setProject(p);
            else setError("Project not found or private.");
            setLoading(false);
        });
    }, [projectId]);

    if (loading) return <div className="h-screen bg-[#09090b] flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="h-screen bg-[#09090b] flex flex-col items-center justify-center text-white gap-4"><AlertTriangle className="w-8 h-8 text-red-500" />{error} <button onClick={onBack} className="text-blue-400 underline">Go Home</button></div>;

    return (
        <div className="h-screen flex flex-col bg-[#09090b]">
            <header className="h-14 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                     <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-white"><ArrowLeft className="w-5 h-5"/></button>
                     <span className="font-bold text-white">{project?.name}</span>
                </div>
                <a href="/" className="text-xs text-gray-500 hover:text-white">Built with AMy AI</a>
            </header>
            <div className="flex-1 overflow-hidden relative">
                <PreviewEngine code={project?.code || ""} />
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState | 'viewer'>('landing');
  const [isLoading, setIsLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<'idle' | 'coding' | 'assets' | 'repairing'>('idle');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentCode, setCurrentCode] = useState(INITIAL_CODE);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [mobileActiveTab, setMobileActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [viewerProjectId, setViewerProjectId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check URL Params for Project ID (Viewer Mode)
    const urlParams = new URLSearchParams(window.location.search);
    const pid = urlParams.get('project');
    if (pid) {
        setViewerProjectId(pid);
        setView('viewer');
        setIsLoading(false);
        return;
    }

    const initAuth = async () => {
      try {
          const user = await authService.getCurrentUser();
          if (user) { setCurrentUser(user); setView('dashboard'); } 
          else { setView('landing'); }
      } catch (e) {
          console.error("Auth Init Error", e);
          setView('landing');
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, mobileActiveTab, generationPhase]);

  const handleAuth = async (action: 'login' | 'signup', e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    try {
      const { user } = action === 'login' 
        ? await authService.signIn(fd.get('email') as string, fd.get('password') as string)
        : await authService.signUp(fd.get('name') as string, fd.get('email') as string, fd.get('password') as string);
      setCurrentUser(user); setView('dashboard');
    } catch (err: any) { alert(err.message); }
  };

  const handleGoogleAuth = async () => {
    try {
      const { user } = await authService.signInWithGoogle();
      setCurrentUser(user); setView('dashboard');
    } catch (err: any) { alert(err.message); }
  };

  const handlePublish = async () => {
      if (!activeProject) return;
      const link = await projectService.publishProject(activeProject.id);
      prompt("Project Published! Share this link:", link);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    if (currentUser) {
      if ((currentUser.freeCredits + currentUser.purchasedCredits) <= 0) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: "❌ You have 0 credits. Please purchase more to continue.", timestamp: Date.now() }]);
        if (confirm("Out of credits! Go to store?")) setView('pricing');
        return;
      }
    } else {
      // Guest logic if allowed
      if (!usageService.checkGuestLimit()) {
         alert("Guest limit reached. Please sign in.");
         setView('signup');
         return;
      }
    }

    const userMsg: ChatMessage = { role: 'user', content: prompt, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setPrompt('');
    setIsGenerating(true);
    setGenerationPhase('coding');

    const botMsgId = Date.now();
    setChatHistory(prev => [...prev, { role: 'assistant', content: "", timestamp: botMsgId, isStreaming: true, streamContent: "" }]);

    // Deduct Credit
    if (currentUser) {
        try {
          const updatedUser = await usageService.deductCredit(currentUser.id);
          setCurrentUser(updatedUser);
        } catch (e) {
           setIsGenerating(false);
           return;
        }
    } else {
        usageService.incrementGuestUsage();
    }

    await attemptGeneration(userMsg, botMsgId, 0);
  };

  const attemptGeneration = async (userMsg: ChatMessage, botMsgId: number, retryCount: number) => {
    try {
      let fullText = "";
      const stream = streamAppConfig(userMsg.content);

      for await (const chunk of stream) {
        if (chunk) {
          fullText += chunk;
          setChatHistory(prev => prev.map(msg => msg.timestamp === botMsgId ? { ...msg, streamContent: fullText } : msg));
        }
      }

      const config = cleanAndParseJSON(fullText);
      let processedCode = config.code;
      setCurrentCode(processedCode);
      setGenerationPhase('assets');
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(processedCode, 'text/html');
      const imagesToGenerate = Array.from(doc.querySelectorAll('img[data-image-prompt]'));

      if (imagesToGenerate.length > 0) {
         setChatHistory(prev => prev.map(msg => msg.timestamp === botMsgId ? { ...msg, streamContent: msg.streamContent + "\n\n🎨 Generating product images..." } : msg));
         const newImages: GeneratedImage[] = [];
         for (const img of imagesToGenerate) {
            const prompt = img.getAttribute('data-image-prompt');
            if (prompt) {
               const base64 = await generateImage(prompt);
               if (base64) {
                  const oldTag = img.outerHTML;
                  img.setAttribute('src', base64);
                  img.removeAttribute('data-image-prompt');
                  processedCode = processedCode.replace(oldTag, img.outerHTML);
                  newImages.push({ id: 'img_' + Date.now(), prompt, url: base64, createdAt: Date.now() });
               }
            }
         }
         setCurrentCode(processedCode);
         if (activeProject) activeProject.images = [...(activeProject.images || []), ...newImages];
      }
      
      const successMsg: ChatMessage = { role: 'assistant', content: `Built "${config.appName}".`, timestamp: botMsgId };
      setChatHistory(prev => [...prev.filter(m => m.timestamp !== botMsgId), successMsg]);

      if (currentUser && activeProject) {
        const updatedProject: Project = { ...activeProject, name: config.appName, description: config.description, code: processedCode, messages: [...chatHistory, userMsg, successMsg], images: activeProject.images };
        await projectService.updateProject(updatedProject);
        setActiveProject(updatedProject);
      }
      setViewMode('preview'); setMobileActiveTab('preview'); setIsGenerating(false); setGenerationPhase('idle');
    } catch (error) {
      if (retryCount < 2) {
        setGenerationPhase('repairing');
        setChatHistory(prev => prev.map(msg => msg.timestamp === botMsgId ? { ...msg, streamContent: msg.streamContent + `\n\n⚠️ Error detected. Retrying (${retryCount + 1}/2)...` } : msg));
        await new Promise(r => setTimeout(r, 1000));
        await attemptGeneration(userMsg, botMsgId, retryCount + 1);
      } else {
        setChatHistory(prev => prev.map(msg => msg.timestamp === botMsgId ? { ...msg, isStreaming: false, content: "❌ Critical error. Please try again." } : msg));
        setIsGenerating(false); setGenerationPhase('idle');
      }
    }
  };

  if (isLoading) return <div className="h-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

  if (view === 'viewer' && viewerProjectId) {
      return <ViewerPage projectId={viewerProjectId} onBack={() => { window.location.href = '/'; }} />;
  }

  return (
    // REMOVE FIXED HEIGHT from main container to allow scrolling on mobile
    // Use min-h-screen instead
    <div className={`flex flex-col w-full bg-[#09090b] text-white font-sans selection:bg-orange-500/30 ${view === 'editor' ? 'h-screen overflow-hidden' : 'min-h-screen overflow-y-auto'}`}>
      
      {view !== 'landing' && view !== 'login' && view !== 'signup' && (
      <header className="h-14 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4 z-20 flex-shrink-0 sticky top-0">
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
               {currentUser.email === ADMIN_EMAIL && <button onClick={() => setView('admin')} className="hidden md:flex items-center gap-2 text-xs font-bold text-red-400 border border-red-500/20 bg-red-500/10 px-3 py-1.5 rounded-full hover:bg-red-500/20"><Shield className="w-3 h-3" /> Admin</button>}
               
               <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 cursor-pointer hover:bg-orange-500/20 transition-colors" onClick={() => setView('pricing')}>
                 <Zap className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                 <span className="text-xs font-medium text-orange-300">
                    {currentUser.freeCredits + currentUser.purchasedCredits} Credits
                 </span>
                 <Plus className="w-3 h-3 text-orange-400" />
               </div>

               <div className="flex items-center gap-2">
                 {activeProject && view === 'editor' && (
                     <>
                        <button onClick={handlePublish} className="hidden md:flex items-center gap-2 text-xs font-medium text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg hover:bg-green-500/20 border border-green-500/20"><Globe className="w-3.5 h-3.5" /> Publish</button>
                        <div className="h-6 w-[1px] bg-white/10 mx-1 hidden md:block"></div>
                     </>
                 )}
                 <button onClick={() => setView('dashboard')} className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5"><LayoutDashboard className="w-5 h-5" /></button>
                 <div className="h-6 w-[1px] bg-white/10 mx-1"></div>
                 <div className="flex items-center gap-2">
                   {currentUser.photoURL ? <img src={currentUser.photoURL} alt="Profile" className="w-6 h-6 rounded-full border border-white/10" /> : <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold">{currentUser.name[0]}</div>}
                   <button onClick={() => { authService.signOut(); setCurrentUser(null); setView('landing'); }} className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-white/5"><LogOut className="w-5 h-5" /></button>
                 </div>
               </div>
             </>
           ) : (
             <div className="flex items-center gap-3">
               <button onClick={() => setView('login')} className="text-sm font-medium text-gray-300 hover:text-white">Login</button>
               <button onClick={() => setView('signup')} className="text-sm font-medium bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg">Sign Up</button>
             </div>
           )}
        </div>
      </header>
      )}

      {/* Main Content Area - Responsive */}
      <div className={`flex-1 relative ${view === 'editor' ? 'overflow-hidden' : ''}`}>
        {view === 'landing' && !currentUser && <LandingPage onStart={() => setView('signup')} onLogin={() => setView('login')} onSignup={() => setView('signup')} />}
        {view === 'admin' && currentUser?.email === ADMIN_EMAIL && <AdminDashboard />}
        {view === 'pricing' && <PricingPage onPurchase={async (a, c) => { await creditService.purchaseCredits(currentUser!.id, a, c); alert("Purchased!"); setView('dashboard'); }} onClose={() => setView('dashboard')} />}
        
        {(view === 'login' || view === 'signup') && (
          <div className="fixed inset-0 z-50 bg-[#09090b] flex items-center justify-center p-4">
             <button onClick={() => setView('landing')} className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back to Home</button>
             <div className="w-full max-w-md bg-[#0c0c0e] border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                   <h2 className="text-2xl font-bold text-white">{view === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                </div>
                <button onClick={handleGoogleAuth} className="w-full bg-white text-black font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 mb-4 hover:bg-gray-100 transition-colors">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
                  Continue with Google
                </button>
                <div className="flex items-center gap-4 my-4"><div className="h-[1px] bg-white/10 flex-1"></div><span className="text-xs text-gray-500">OR</span><div className="h-[1px] bg-white/10 flex-1"></div></div>
                <form onSubmit={(e) => handleAuth(view as 'login' | 'signup', e)} className="space-y-4">
                  {view === 'signup' && <div><label className="text-xs text-gray-400">Name</label><input name="name" required className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" /></div>}
                  <div><label className="text-xs text-gray-400">Email</label><input name="email" type="email" required className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" /></div>
                  <div><label className="text-xs text-gray-400">Password</label><input name="password" type="password" required className="w-full bg-[#18181b] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500" /></div>
                  <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium py-2.5 rounded-lg mt-2">{view === 'login' ? 'Sign In' : 'Sign Up'}</button>
                </form>
             </div>
          </div>
        )}

        {view === 'dashboard' && currentUser && (
          <div className="min-h-full p-4 sm:p-8">
             <div className="max-w-6xl mx-auto pb-20">
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                 <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-bold text-white mb-1">{currentUser.freeCredits}</div>
                    <span className="text-sm text-gray-400">Daily Free Credits</span>
                 </div>
                 <div className="bg-[#0c0c0e] border border-white/10 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-bold text-white mb-1">{currentUser.purchasedCredits}</div>
                    <span className="text-sm text-gray-400">Paid Credits</span>
                 </div>
                 <div className="bg-gradient-to-br from-orange-600 to-amber-700 p-6 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden cursor-pointer hover:shadow-lg transition-all" onClick={() => {
                   projectService.createProject(currentUser.id, "New Project", "").then(p => { setActiveProject(p); setChatHistory([]); setCurrentCode(INITIAL_CODE); setView('editor'); });
                 }}>
                    <Plus className="w-8 h-8 text-white mb-2" />
                    <span className="font-bold text-white text-lg">New Project</span>
                 </div>
               </div>
               <h2 className="text-xl font-semibold text-white mb-4">Your Projects</h2>
               <DashboardProjectList userId={currentUser.id} onLoad={(p) => { setActiveProject(p); setChatHistory(p.messages || []); setCurrentCode(p.code || INITIAL_CODE); setView('editor'); }} onDelete={async (id) => { await projectService.deleteProject(id); }} />
             </div>
          </div>
        )}

        {view === 'editor' && (
          <div className="absolute inset-0 flex flex-col md:flex-row overflow-hidden bg-[#09090b]">
            {/* Editor Sidebar / Mobile Tab */}
            <div className={`${mobileActiveTab === 'editor' ? 'flex' : 'hidden'} md:flex w-full md:w-[400px] flex-col border-r border-white/5 bg-[#0c0c0e] flex-shrink-0 z-10 relative h-full`}>
              <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0c0c0e] text-sm font-semibold shrink-0">
                  <span className="truncate max-w-[200px]">{activeProject?.name}</span>
                  <div className="flex md:hidden gap-2">
                      <button onClick={handlePublish} className="text-green-400"><Share2 className="w-4 h-4" /></button>
                      <button onClick={() => setView('dashboard')} className="text-gray-400"><X className="w-4 h-4" /></button>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20 md:pb-4 min-h-0">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-orange-600 text-white' : 'bg-[#18181b] text-gray-300 border border-white/5'}`}>
                        {msg.isStreaming ? (msg.streamContent || <Loader2 className="w-4 h-4 animate-spin" />) : msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
              </div>
              <div className="p-4 bg-[#09090b] border-t border-white/5 flex-shrink-0 mb-14 md:mb-0">
                <div className="relative flex items-center bg-[#0c0c0e] rounded-xl border border-white/10 p-1.5">
                   <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }} placeholder="Describe app..." className="w-full bg-transparent border-none text-sm text-gray-200 h-12 py-3 px-3 resize-none focus:ring-0" />
                   <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="p-2.5 bg-orange-600 hover:bg-orange-500 rounded-lg text-white flex-shrink-0">{isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</button>
                </div>
              </div>
            </div>

            {/* Preview / Code Area */}
            <div className={`${mobileActiveTab === 'preview' ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-[#09090b] relative min-w-0 border-l border-white/5 h-full`}>
               <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0c0c0e] shrink-0">
                  <div className="flex bg-[#18181b] rounded p-0.5 border border-white/5">
                    <button onClick={() => setViewMode('preview')} className={`px-3 py-1.5 rounded text-xs ${viewMode === 'preview' ? 'bg-[#27272a] text-white' : 'text-gray-500'}`}>Preview</button>
                    <button onClick={() => setViewMode('code')} className={`px-3 py-1.5 rounded text-xs ${viewMode === 'code' ? 'bg-[#27272a] text-white' : 'text-gray-500'}`}>Code</button>
                  </div>
                  {viewMode === 'preview' && <div className="hidden md:flex bg-[#18181b] rounded p-0.5 border border-white/5"><button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-[#27272a] text-white' : 'text-gray-500'}`}><Monitor className="w-3.5 h-3.5" /></button><button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-[#27272a] text-white' : 'text-gray-500'}`}><Smartphone className="w-3.5 h-3.5" /></button></div>}
               </div>
               <div className="flex-1 bg-[#18181b] flex flex-col justify-center items-center overflow-hidden relative mb-14 md:mb-0">
                 {viewMode === 'preview' ? <div className={`transition-all duration-300 h-full w-full ${previewDevice === 'mobile' ? 'max-w-[375px] max-h-[812px] my-auto border-4 border-gray-800 rounded-[2rem] overflow-hidden bg-white shadow-2xl' : ''}`}><PreviewEngine code={currentCode} /></div> : <div className="w-full h-full bg-[#0c0c0e] overflow-auto p-4"><pre className="text-xs font-mono text-blue-300 whitespace-pre-wrap">{currentCode}</pre></div>}
               </div>
            </div>
            
            {/* Mobile Bottom Nav */}
            <div className="md:hidden absolute bottom-0 left-0 right-0 h-14 bg-[#0c0c0e] border-t border-white/10 flex items-center justify-around z-50">
               <button onClick={() => setMobileActiveTab('editor')} className={`flex flex-col items-center gap-1 ${mobileActiveTab === 'editor' ? 'text-orange-500' : 'text-gray-500'}`}><MessageSquare className="w-5 h-5" /><span className="text-[10px]">Chat</span></button>
               <button onClick={() => setMobileActiveTab('preview')} className={`flex flex-col items-center gap-1 ${mobileActiveTab === 'preview' ? 'text-green-500' : 'text-gray-500'}`}><Eye className="w-5 h-5" /><span className="text-[10px]">Preview</span></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}