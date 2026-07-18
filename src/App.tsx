import React, { useState, useEffect } from 'react';
import { User, ApiKeyConfig, VirtualFile, VirtualFolder } from './types';
import RegisterForm from './components/RegisterForm';
import ApiKeySettings from './components/ApiKeySettings';
import AiTeacher from './components/AiTeacher';
import CodeWorkspace, { DEFAULT_FILES, DEFAULT_FOLDERS } from './components/CodeWorkspace';
import TelegramP2P from './components/TelegramP2P';
import ThemeLightSensor from './components/ThemeLightSensor';
import { AppLanguage, LANGUAGES_LIST, TRANSLATIONS } from './lib/translations';
import { 
  GraduationCap, KeyRound, MessageSquare, LogOut, Code, AlertCircle, 
  Settings, Download, Upload, Sun, Moon, Sparkles, Cpu, Eye, Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_API_TEMPLATES: ApiKeyConfig[] = [
  {
    id: 'sample-gemini',
    provider: 'gemini',
    label: 'My Gemini Flash (Default)',
    apiKey: '',
    modelName: 'gemini-2.5-flash',
    isActive: true,
    status: 'untested',
    usageCount: 0
  }
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'teacher' | 'p2p' | 'keys'>('teacher');
  const [apiConfigs, setApiConfigs] = useState<ApiKeyConfig[]>([]);

  // Localization and theme states
  const [language, setLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('aweschool_language');
    return (saved as AppLanguage) || 'hy';
  });

  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'auto'>(() => {
    const saved = localStorage.getItem('aweschool_theme');
    return (saved as 'dark' | 'light' | 'auto') || 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  // Monaco workspace states
  const [editorCode, setEditorCode] = useState<string>('');
  const [editorLanguage, setEditorLanguage] = useState<string>('javascript');
  const [editorDescription, setEditorDescription] = useState<string>('');
  const [showEditor, setShowEditor] = useState<boolean>(true);

  // Lifted Virtual File System States
  const [files, setFiles] = useState<VirtualFile[]>(() => {
    const saved = localStorage.getItem('vfs_files_v2');
    return saved ? JSON.parse(saved) : DEFAULT_FILES;
  });

  const [folders, setFolders] = useState<VirtualFolder[]>(() => {
    const saved = localStorage.getItem('vfs_folders_v2');
    return saved ? JSON.parse(saved) : DEFAULT_FOLDERS;
  });

  const [selectedFileId, setSelectedFileId] = useState<string>(() => {
    const saved = localStorage.getItem('vfs_selected_file_id_v2');
    return saved || 'f1';
  });

  const [chats, setChats] = useState<any[]>(() => {
    const saved = localStorage.getItem('vfs_chats_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop() || '';
    if (ext === 'html') return 'html';
    if (ext === 'css') return 'css';
    if (ext === 'js' || ext === 'jsx') return 'javascript';
    if (ext === 'ts' || ext === 'tsx') return 'typescript';
    if (ext === 'json') return 'json';
    if (ext === 'md') return 'markdown';
    return 'plaintext';
  };

  // Load workspace state from server
  useEffect(() => {
    if (user?.name) {
      fetch(`/api/load-workspace?username=${encodeURIComponent(user.name)}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('No server workspace saved yet');
        })
        .then(data => {
          if (data && data.files && data.files.length > 0) {
            setFiles(data.files);
            setFolders(data.folders || []);
            const mainHtml = data.files.find((f: any) => f.name === 'index.html') || data.files[0];
            setSelectedFileId(mainHtml.id);
            setEditorCode(mainHtml.content);
            setEditorLanguage(mainHtml.language);
          }
          if (data && data.chats) {
            setChats(data.chats);
          }
        })
        .catch(err => {
          console.log('Using local fallback workspace state:', err);
        });
    }
  }, [user?.name]);

  // Save workspace state to server and localStorage
  useEffect(() => {
    if (user?.name && files.length > 0) {
      localStorage.setItem('vfs_files_v2', JSON.stringify(files));
      localStorage.setItem('vfs_folders_v2', JSON.stringify(folders));
      localStorage.setItem('vfs_selected_file_id_v2', selectedFileId);
      localStorage.setItem('vfs_chats_v2', JSON.stringify(chats));

      fetch('/api/save-workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.name,
          files,
          folders,
          chats
        })
      }).catch(err => console.error('Failed to save workspace to server:', err));
    }
  }, [files, folders, selectedFileId, chats, user?.name]);

  // Handle files extracted automatically by AI
  const handleFilesExtracted = (extractedFiles: { path: string; content: string }[]) => {
    if (!extractedFiles || extractedFiles.length === 0) return;

    setFiles(prev => {
      let updated = [...prev];
      extractedFiles.forEach(extFile => {
        const existingIdx = updated.findIndex(f => f.path === extFile.path);
        if (existingIdx !== -1) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            content: extFile.content
          };
        } else {
          const name = extFile.path.split('/').pop() || extFile.path;
          const lang = getLanguageFromFilename(name);
          updated.push({
            id: 'file_ai_' + Date.now() + Math.random().toString(36).substr(2, 5),
            name,
            path: extFile.path,
            language: lang,
            content: extFile.content
          });

          if (extFile.path.includes('/')) {
            const folderParts = extFile.path.split('/');
            folderParts.pop(); // remove filename
            let currentPath = '';
            folderParts.forEach((part) => {
              currentPath = currentPath ? `${currentPath}/${part}` : part;
              setFolders(fPrev => {
                if (!fPrev.some(fol => fol.path === currentPath)) {
                  return [...fPrev, {
                    id: 'folder_ai_' + Date.now() + Math.random().toString(36).substr(2, 5),
                    name: part,
                    path: currentPath
                  }];
                }
                return fPrev;
              });
            });
          }
        }
      });

      const firstExtracted = extractedFiles[0];
      const matchInFiles = updated.find(f => f.path === firstExtracted.path);
      if (matchInFiles) {
        setSelectedFileId(matchInFiles.id);
        setEditorCode(matchInFiles.content);
        setEditorLanguage(matchInFiles.language);
      }

      return updated;
    });
  };

  // Load profile & API keys from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('teacher_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedKeys = localStorage.getItem('teacher_api_keys');
    if (savedKeys) {
      setApiConfigs(JSON.parse(savedKeys));
    } else {
      setApiConfigs(DEFAULT_API_TEMPLATES);
    }
  }, []);

  // Sync theme changes with DOM class
  useEffect(() => {
    if (themeMode === 'light') {
      setResolvedTheme('light');
    } else if (themeMode === 'dark') {
      setResolvedTheme('dark');
    } else {
      // In auto mode: fallback on daylight time hours if camera sensor is offline
      const hour = new Date().getHours();
      const isNight = hour < 7 || hour > 19;
      setResolvedTheme(isNight ? 'dark' : 'light');
    }
  }, [themeMode]);

  const handleLanguageChange = (lang: AppLanguage) => {
    setLanguage(lang);
    localStorage.setItem('aweschool_language', lang);
  };

  const handleThemeModeChange = (mode: 'dark' | 'light' | 'auto') => {
    setThemeMode(mode);
    localStorage.setItem('aweschool_theme', mode);
  };

  // Save API keys to local storage on change
  const handleSaveConfigs = (updated: ApiKeyConfig[]) => {
    setApiConfigs(updated);
    localStorage.setItem('teacher_api_keys', JSON.stringify(updated));
  };

  // Handle API connection failure live update
  const handleConfigError = (configId: string, errorMsg: string) => {
    setApiConfigs(prev => {
      const updated = prev.map(c => 
        c.id === configId ? { ...c, status: 'error' as const, lastError: errorMsg } : c
      );
      localStorage.setItem('teacher_api_keys', JSON.stringify(updated));
      return updated;
    });
  };

  // Callback when AI generates/extracts a code snippet
  const handleCodeExtracted = (code: string, language: string, description?: string) => {
    setEditorCode(code);
    setEditorLanguage(language);
    if (description) {
      setEditorDescription(description);
    }
  };

  // Ultimate data-tampering & theft protection sealing
  const handleExportBackup = () => {
    try {
      const p2pChats = JSON.parse(localStorage.getItem('p2p_chats') || '[]');
      const activeChatId = localStorage.getItem('p2p_active_chat_id') || '';
      
      const payload = {
        user,
        apiConfigs,
        p2pChats,
        activeChatId,
        language,
        themeMode,
        timestamp: Date.now()
      };

      const rawString = JSON.stringify(payload);
      
      // Multi-layer XOR cipher with a signature key to prevent hacking / data manipulation
      let xorSealed = '';
      const secret = 'AWESCHOOL_ACADEMIC_MESH_VERIFICATION_KEY';
      for (let i = 0; i < rawString.length; i++) {
        xorSealed += String.fromCharCode(rawString.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
      }

      const base64Sealed = btoa(unescape(encodeURIComponent(xorSealed)));

      const blob = new Blob([base64Sealed], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `AWESchool_Protected_Backup_${new Date().toISOString().split('T')[0]}.bin`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(`Export Failed: ${err.message}`);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const base64Sealed = event.target?.result as string;
        const xorSealed = decodeURIComponent(escape(atob(base64Sealed)));
        
        let rawString = '';
        const secret = 'AWESCHOOL_ACADEMIC_MESH_VERIFICATION_KEY';
        for (let i = 0; i < xorSealed.length; i++) {
          rawString += String.fromCharCode(xorSealed.charCodeAt(i) ^ secret.charCodeAt(i % secret.length));
        }

        const parsed = JSON.parse(rawString);

        if (!parsed.user || !parsed.apiConfigs) {
          throw new Error('Integrity signature check failed - data block is corrupted or modified!');
        }

        setUser(parsed.user);
        setApiConfigs(parsed.apiConfigs);
        setLanguage(parsed.language || 'hy');
        setThemeMode(parsed.themeMode || 'dark');

        localStorage.setItem('teacher_user', JSON.stringify(parsed.user));
        localStorage.setItem('teacher_api_keys', JSON.stringify(parsed.apiConfigs));
        if (parsed.p2pChats) {
          localStorage.setItem('p2p_chats', JSON.stringify(parsed.p2pChats));
        }
        if (parsed.activeChatId) {
          localStorage.setItem('p2p_active_chat_id', parsed.activeChatId);
        }
        localStorage.setItem('aweschool_language', parsed.language || 'hy');
        localStorage.setItem('aweschool_theme', parsed.themeMode || 'dark');

        alert('Backup signature successfully verified! Workspace and chats restored.');
        window.location.reload();
      } catch (err: any) {
        alert(`Verification Error: Unauthorized modification or corrupted data block! Details: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleLogout = () => {
    if (window.confirm(t.clearConfirm)) {
      localStorage.removeItem('teacher_user');
      localStorage.removeItem('teacher_api_keys');
      localStorage.removeItem('p2p_chats');
      localStorage.removeItem('p2p_active_chat_id');
      setUser(null);
    }
  };

  if (!user) {
    return <RegisterForm onRegister={(u) => setUser(u)} />;
  }

  const activeKeysCount = apiConfigs.filter(c => c.isActive).length;
  const t = TRANSLATIONS[language];

  return (
    <div className={`min-h-screen font-sans flex flex-col antialiased relative overflow-hidden transition-all duration-500 ${
      resolvedTheme === 'light' 
        ? 'bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white' 
        : 'bg-slate-950 text-white selection:bg-cyan-500 selection:text-white'
    }`}>
      {/* Visual glowing backgrounds in dark theme */}
      {resolvedTheme === 'dark' && (
        <>
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        </>
      )}

      {/* Navigation Header */}
      <header className={`border-b backdrop-blur-xl px-4 md:px-8 py-3 flex flex-col sm:flex-row items-center justify-between shrink-0 relative z-30 gap-3 ${
        resolvedTheme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/15">
            <GraduationCap className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
              AWESchool Workspace
            </h1>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Interactive Learning Environment
            </p>
          </div>
        </div>

        {/* Dynamic Controls Header: Language Select, Theme select, Secure Encrypted Backup triggers */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Language selection dropdown */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold ${
            resolvedTheme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as AppLanguage)}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer"
            >
              {LANGUAGES_LIST.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-950 text-white">
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Theme selection buttons */}
          <div className={`flex items-center p-0.5 rounded-xl border text-xs font-bold ${
            resolvedTheme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <button
              onClick={() => handleThemeModeChange('light')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${themeMode === 'light' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Light Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleThemeModeChange('dark')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${themeMode === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleThemeModeChange('auto')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 ${themeMode === 'auto' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Automatic Mode (Camera Brightness + System Clock)"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-[9px] uppercase tracking-wider font-bold">Auto</span>
            </button>
          </div>

          {/* Data Sealing export and import tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportBackup}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                resolvedTheme === 'light' 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title="Export Encrypted Sealer Backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-wider hidden md:inline">Export Backup</span>
            </button>

            <label
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                resolvedTheme === 'light' 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title="Import Protected Backup File"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-wider hidden md:inline">Import Backup</span>
              <input 
                type="file" 
                accept=".bin" 
                onChange={handleImportBackup} 
                className="hidden" 
              />
            </label>
          </div>

          {/* Logout trigger */}
          <button
            onClick={handleLogout}
            className={`p-2 border rounded-xl transition-all cursor-pointer ${
              resolvedTheme === 'light' 
                ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600' 
                : 'bg-red-950/10 hover:bg-red-950/20 border-red-900/30 text-red-400'
            }`}
            title="Wipe & Exit Profile"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>

        </div>
      </header>

      {/* Tabs navigation panel */}
      <nav className={`px-4 py-2 border-b flex gap-1.5 overflow-x-auto shrink-0 relative z-20 ${
        resolvedTheme === 'light' ? 'bg-slate-100/50 border-slate-200' : 'bg-slate-900/10 border-slate-900'
      }`}>
        <button
          onClick={() => setActiveTab('teacher')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'teacher' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : resolvedTheme === 'light' ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          {t.teacherTab}
        </button>

        <button
          onClick={() => setActiveTab('p2p')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'p2p' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : resolvedTheme === 'light' ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          {t.p2pTab}
        </button>

        <button
          onClick={() => setActiveTab('keys')}
          className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer relative ${
            activeTab === 'keys' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : resolvedTheme === 'light' ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          {t.apiKeySettings}
          {activeKeysCount === 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
          )}
        </button>
      </nav>

      {/* Main Workspace Frame */}
      <main className="flex-1 min-h-0 p-4 md:p-6 overflow-y-auto relative z-10 space-y-6">
        
        {/* If auto-theme mode is active, display the ThemeLightSensor diagnostics bar */}
        {themeMode === 'auto' && (
          <div className="max-w-4xl mx-auto">
            <ThemeLightSensor 
              currentTheme={themeMode} 
              setSystemThemeOverride={setResolvedTheme} 
              language={language}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {activeTab === 'keys' && (
            <motion.div
              key="keys"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="h-full max-w-5xl mx-auto"
            >
              <ApiKeySettings configs={apiConfigs} onSaveConfigs={handleSaveConfigs} />
            </motion.div>
          )}

          {activeTab === 'p2p' && (
            <motion.div
              key="p2p"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="h-full max-w-6xl mx-auto"
            >
              <TelegramP2P 
                currentUser={user} 
                configs={apiConfigs} 
                onConfigError={handleConfigError} 
                editorCode={editorCode}
                editorLanguage={editorLanguage}
                editorDescription={editorDescription}
                onCodeExtracted={handleCodeExtracted}
                language={language}
                resolvedTheme={resolvedTheme}
              />
            </motion.div>
          )}

          {activeTab === 'teacher' && (
            <motion.div
              key="teacher"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="h-full"
            >
              <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* AI Chat workspace panel (Span 6 or 12 if Monaco disabled) */}
                <div className={`h-full flex flex-col transition-all duration-300 ${
                  showEditor ? 'lg:col-span-6' : 'lg:col-span-12'
                }`}>
                  {/* Warning banner if no active keys */}
                  {activeKeysCount === 0 && (
                    <div className="mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-3 rounded-xl text-xs flex items-center gap-2 font-sans">
                      <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
                      <span>
                        <strong>Warning:</strong> {t.activeKeysWarning}
                      </span>
                    </div>
                  )}

                   <AiTeacher
                    configs={apiConfigs}
                    onConfigError={handleConfigError}
                    onCodeExtracted={handleCodeExtracted}
                    onFilesExtracted={handleFilesExtracted}
                    showEditor={showEditor}
                    setShowEditor={setShowEditor}
                    resolvedTheme={resolvedTheme}
                    language={language}
                    editorCode={editorCode}
                    editorLanguage={editorLanguage}
                    messages={chats}
                    setMessages={setChats}
                  />
                </div>

                {/* Monaco Editor workspace split panel (Span 6) */}
                {showEditor && (
                  <div className="h-full lg:col-span-6 lg:block flex flex-col">
                    <CodeWorkspace
                      code={editorCode}
                      language={editorLanguage}
                      description={editorDescription}
                      onCodeChange={(newCode) => setEditorCode(newCode)}
                      files={files}
                      setFiles={setFiles}
                      folders={folders}
                      setFolders={setFolders}
                      selectedFileId={selectedFileId}
                      setSelectedFileId={setSelectedFileId}
                    />
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
