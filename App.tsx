
import React, { useState, useEffect, useCallback } from 'react';
import { translations } from './i18n/translations';
import { Language, Match, AnalysisResult, MarketProbability } from './types';
import { mockMatches } from './constants/mockData';
import { calculateAllProbabilities } from './services/analysisEngine';
import { explainRecommendedBets, fetchMatchDataViaAI } from './services/geminiService';
import { Search, Moon, Sun, TrendingUp, Globe, Sparkles, Loader2, Info, ChevronDown, ChevronUp, AlertCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC<{ lang: Language; setLang: (l: Language) => void; isDark: boolean; toggleTheme: () => void; t: (k: string) => string }> = 
({ lang, setLang, isDark, toggleTheme, t }) => (
  <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="bg-indigo-600 p-1.5 rounded-lg">
        <TrendingUp className="text-white w-6 h-6" />
      </div>
      <h1 className="text-xl font-black tracking-tighter dark:text-white uppercase">{t('app_title')}</h1>
    </div>
    <div className="flex items-center gap-4">
      <div className="hidden sm:flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {(['en', 'fr', 'es', 'ar'] as Language[]).map((l) => (
          <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${lang === l ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>{l.toUpperCase()}</button>
        ))}
      </div>
      <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
      </button>
    </div>
  </nav>
);

const BetItem: React.FC<{ bet: MarketProbability; t: (k: string) => string }> = ({ bet, t }) => {
  const [expanded, setExpanded] = useState(false);
  const riskColors = {
    Low: 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10',
    Medium: 'border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10',
    High: 'border-rose-500 text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-900/10'
  };

  return (
    <div className="group">
      <button 
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.01] active:scale-95 mb-1.5 ${riskColors[bet.riskLevel]}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white/60 dark:bg-gray-800/60 font-black text-xs shadow-inner">
            {bet.marketCode}
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">{bet.marketName}</p>
            <p className="text-lg font-black leading-none">{bet.odds.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden xs:block">
             <p className="text-[8px] font-black uppercase opacity-60">{t('probability')}</p>
             <p className="text-sm font-black">{(bet.probability * 100).toFixed(0)}%</p>
          </div>
          <div className="p-1 rounded-full bg-black/5 dark:bg-white/5">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl mb-3 border border-gray-100 dark:border-gray-800/50 text-xs">
               <div className="flex gap-2 text-gray-600 dark:text-gray-300">
                 <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                 <p className="italic leading-relaxed font-medium">
                   {bet.explanation || t('loading_analysis')}
                 </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MatchCard: React.FC<{ match: Match; analysis: AnalysisResult; t: (k: string) => string; lang: Language }> = 
({ match, analysis, t, lang }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden h-full flex flex-col">
    <div className="px-5 py-3 bg-gray-50/50 dark:bg-gray-800/20 flex justify-between items-center border-b dark:border-gray-800">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{match.league}</span>
      <div className="flex items-center gap-2">
         <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
         <span className="text-[10px] font-bold text-indigo-500 uppercase">{new Date(match.kickoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-14 h-14 p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <img src={match.homeTeam.logo} className="w-full h-full object-contain" />
          </div>
          <p className="text-xs font-black dark:text-white text-center line-clamp-2 uppercase tracking-tight">{match.homeTeam.name}</p>
        </div>
        <div className="text-gray-200 dark:text-gray-800 font-black italic text-xl">VS</div>
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="w-14 h-14 p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <img src={match.awayTeam.logo} className="w-full h-full object-contain" />
          </div>
          <p className="text-xs font-black dark:text-white text-center line-clamp-2 uppercase tracking-tight">{match.awayTeam.name}</p>
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
           <AlertCircle className="w-3 h-3" /> {t('best_bet')}
        </h4>
        {analysis.recommendations.map((rec, idx) => <BetItem key={idx} bet={rec} t={t} />)}
      </div>
    </div>
  </motion.div>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [isDark, setIsDark] = useState(true);
  const [analyses, setAnalyses] = useState<Record<string, AnalysisResult>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [customMatches, setCustomMatches] = useState<Match[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = useCallback((key: string) => translations[key]?.[lang] || key, [lang]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.className = isDark ? 'dark bg-gray-950 text-white selection:bg-indigo-500/30' : 'bg-gray-50 text-gray-900 selection:bg-indigo-500/30';
  }, [lang, isDark]);

  const runAnalysis = async (match: Match) => {
    try {
      const recs = calculateAllProbabilities(match);
      setAnalyses(prev => ({ ...prev, [match.id]: { matchId: match.id, recommendations: recs } }));
      
      const expls = await explainRecommendedBets(match, recs, lang);
      setAnalyses(prev => ({
        ...prev,
        [match.id]: { 
          ...prev[match.id], 
          recommendations: prev[match.id].recommendations.map(r => ({ 
            ...r, 
            explanation: expls[r.marketCode] 
          })) 
        }
      }));
    } catch (err) {
      console.error("Analysis Error:", err);
      setErrorMessage("Could not complete AI reasoning. Basic stats still visible.");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      for (const m of mockMatches) await runAnalysis(m);
      setLoading(false);
    };
    init();
  }, [lang]);

  const handleAIQuery = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setErrorMessage(null);
    try {
      const m = await fetchMatchDataViaAI(searchQuery);
      if (m) {
        setCustomMatches(p => [m, ...p]);
        await runAnalysis(m);
      } else {
        setErrorMessage("AI could not find match data. Please try another query.");
      }
    } catch (err) {
      setErrorMessage("Failed to call the Gemini API. Please try again later.");
    } finally {
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen pb-24 sm:pb-0">
      <Navbar lang={lang} setLang={setLang} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} t={t} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h2 className="text-5xl font-black tracking-tighter mb-3 uppercase italic">Market <span className="text-indigo-600">Scanner</span></h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{t('disclaimer')}</p>
          </div>
          
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="absolute inset-y-0 start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleAIQuery()}
                placeholder={t('search_placeholder')} 
                className="ps-12 pe-4 py-4 bg-white dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-sm w-full outline-none text-gray-900 dark:text-white placeholder:text-gray-400 font-bold shadow-lg shadow-gray-200/50 dark:shadow-none transition-all" 
              />
            </div>
            <button 
              onClick={handleAIQuery} 
              disabled={isSearching} 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-700 disabled:opacity-50 shadow-xl shadow-indigo-600/30 transition-all font-black uppercase text-xs tracking-widest"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {t('ai_search_button')}
            </button>
          </div>
        </header>

        <AnimatePresence>
          {errorMessage && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="mb-8 p-4 bg-rose-500/10 border border-rose-500/50 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-rose-500 font-black text-xs uppercase italic">
                <XCircle className="w-5 h-5" />
                {errorMessage}
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-rose-500/50 hover:text-rose-500 transition-colors">
                 <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {[...customMatches, ...mockMatches].map(m => analyses[m.id] && (
              <MatchCard key={m.id} match={m} analysis={analyses[m.id]} t={t} lang={lang} />
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="sm:hidden fixed bottom-6 left-6 right-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 flex justify-around rounded-3xl shadow-2xl z-50">
        <button className="p-3 text-indigo-600"><Globe className="w-6 h-6" /></button>
        <button className="p-3 text-gray-400" onClick={handleAIQuery}><Sparkles className="w-6 h-6" /></button>
        <button className="p-3 text-gray-400"><Info className="w-6 h-6" /></button>
      </div>
    </div>
  );
};

export default App;
