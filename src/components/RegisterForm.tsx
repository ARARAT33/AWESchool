import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User } from '../types';
import { Sparkles, UserPlus, GraduationCap, ArrowRight, BookOpen } from 'lucide-react';
import { LANGUAGES_LIST, TRANSLATIONS, AppLanguage } from '../lib/translations';

interface RegisterFormProps {
  onRegister: (user: User) => void;
}

export default function RegisterForm({ onRegister }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lang, setLang] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('aweschool_language');
    return (saved as AppLanguage) || 'hy';
  });

  const handleLangChange = (newLang: AppLanguage) => {
    setLang(newLang);
    localStorage.setItem('aweschool_language', newLang);
  };

  const t = TRANSLATIONS[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newUser: User = {
        name: name.trim(),
        registeredAt: new Date().toISOString(),
      };
      localStorage.setItem('teacher_user', JSON.stringify(newUser));
      localStorage.setItem('aweschool_language', lang);
      onRegister(newUser);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50/80 via-slate-50 to-sky-50/50 p-4 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden relative">
      {/* Premium subtle glowing academic light spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl -z-10 animate-pulse duration-[6000ms]"></div>

      {/* Language Selector at Top Right */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-1.5 bg-white/80 border border-slate-200/80 p-2 rounded-2xl shadow-sm backdrop-blur-md">
        <select
          value={lang}
          onChange={(e) => handleLangChange(e.target.value as AppLanguage)}
          className="bg-transparent text-xs font-bold text-slate-700 outline-none pr-1 cursor-pointer font-sans"
        >
          {LANGUAGES_LIST.map((l) => (
            <option key={l.code} value={l.code} className="bg-white text-slate-800">
              {l.flag} {l.label}
            </option>
          ))}
        </select>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md bg-white/95 border border-slate-200/80 rounded-3xl p-8 shadow-2xl shadow-indigo-100/40 relative"
        id="register-card"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4"
          >
            <GraduationCap className="w-9 h-9 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-950 via-slate-800 to-indigo-900 bg-clip-text text-transparent uppercase font-sans">
            {t.appName}
          </h1>
          <p className="text-slate-500 mt-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1 justify-center">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            {t.loginSubhead}
          </p>
          <p className="text-slate-400 mt-1 text-[11px] leading-relaxed max-w-xs">
            {t.loginDesc}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name-input" className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              {t.enterName}
            </label>
            <div className="relative">
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.loginPlaceholder}
                required
                className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 pl-4 pr-12 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-sm shadow-inner"
                disabled={isSubmitting}
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <UserPlus className="w-5 h-5" />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:opacity-95 text-white font-black rounded-2xl py-4 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/15 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group text-xs uppercase tracking-wider"
            id="register-submit-btn"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {t.startBtn}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>AWESchool Academic Workspace</span>
        </div>
      </motion.div>
    </div>
  );
}
