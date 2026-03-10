import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Download,
  Copy,
  Check,
  AlertCircle,
  Layout,
  Palette,
  MessageSquare,
  ChevronRight,
  Info,
  Github,
  Linkedin,
  Rocket
} from 'lucide-react';
import { generateCarouselPlan, generateCarouselImage, CarouselPlan } from './services/geminiService';
import { createCarouselPdf } from './utils/fileUtils';
import CarouselPreview from './components/ImageDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('AI in Media');
  const [tone, setTone] = useState<string>('Professional');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [carouselTitle, setCarouselTitle] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [postCaption, setPostCaption] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyButtonRef = useRef<HTMLButtonElement>(null);

  const topics = [
    'AI in Media',
    'AI in Content Creation',
    'AI in Video Generation',
    'AI in Design',
    'Creative AI',
    'Future of Work',
    'Digital Transformation'
  ];

  const tones = [
    'Professional',
    'Inspiring',
    'Technical',
    'Casual',
    'Bold',
    'Provocative'
  ];

  const handleGenerate = async () => {
    if (!topic) {
      setError('Please enter a topic for the carousel.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setCarouselTitle('');
    setPostCaption('');

    try {
      setLoadingMessage('Curating the perfect story arc...');
      const plan: CarouselPlan = await generateCarouselPlan(topic, tone);
      setCarouselTitle(plan.title);
      setPostCaption(plan.postCaption);

      const images: string[] = [];
      const totalSlides = plan.slides.length;

      // Generate Cover Image
      setLoadingMessage(`Designing your masterpiece: Cover Slide`);
      const coverImage = await generateCarouselImage('cover', {
        title: plan.title,
        author: 'Muhammad Schees',
        theme: plan.slides[0].imagePrompt
      });
      images.push(coverImage);

      // Generate Content Slides
      for (let i = 0; i < totalSlides; i++) {
        const slide = plan.slides[i];
        setLoadingMessage(`Crafting visual: Slide ${i + 1} of ${totalSlides}`);
        const contentImage = await generateCarouselImage('content', {
          title: slide.slideTitle,
          caption: slide.caption,
          theme: slide.imagePrompt,
          slideNumber: `${i + 1} of ${totalSlides}`
        });
        images.push(contentImage);
      }

      // Generate Final Image
      setLoadingMessage(`Polishing the finale...`);
      const finalImage = await generateCarouselImage('final', {
        author: 'Muhammad Schees',
        callToAction: 'for more insights on AI & Innovation.',
        theme: plan.slides[totalSlides - 1].imagePrompt
      });
      images.push(finalImage);

      setGeneratedImages(images);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleDownload = () => {
    if (generatedImages.length > 0) {
      createCarouselPdf(carouselTitle, generatedImages);
    }
  };

  const handleCopyCaption = () => {
    if (postCaption) {
      navigator.clipboard.writeText(postCaption);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0f172a] text-slate-50 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Header */}
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6"
          >
            <Sparkles size={14} />
            Powered by Gemini 2.0 Flash
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
          >
            Nano Banana
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto"
          >
            Architect high-authority LinkedIn carousels with precision.
            Automated content, elite visuals, and seamless export.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Controls Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl">
              <div className="space-y-8">
                {/* Topic Selector */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Layout size={16} className="text-indigo-400" />
                    Content Architecture
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {topics.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTopic(t)}
                        disabled={isLoading}
                        className={cn(
                          "text-left px-4 py-3 rounded-xl transition-all duration-200 border text-sm font-medium",
                          topic === t
                            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-100 ring-1 ring-indigo-500/50"
                            : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone Selector */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Palette size={16} className="text-purple-400" />
                    Emotional Resonance
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tones.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        disabled={isLoading}
                        className={cn(
                          "px-4 py-2 rounded-full transition-all duration-200 border text-xs font-semibold uppercase tracking-wider",
                          tone === t
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-100"
                            : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:border-white/10"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="group relative w-full h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <div className="relative flex items-center justify-center gap-3">
                    {isLoading ? (
                      <LoadingSpinner className="w-5 h-5 text-white" />
                    ) : (
                      <Rocket size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    )}
                    <span>{isLoading ? 'Architecting...' : 'Launch Generator'}</span>
                  </div>
                </button>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                  >
                    <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-xs font-bold text-red-400 uppercase tracking-tight mb-1">System Error</p>
                      <p className="text-sm text-red-200/80 leading-relaxed">{error}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
                  <Info size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">How it works</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    We use Gemini 2.0's multi-modal capabilities to first draft a 5-step story arc,
                    then generate bespoke visual assets with perfectly integrated typography.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Result Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="lg:col-span-8"
          >
            <div className="glass-card rounded-[32px] p-1 border border-white/5 shadow-3xl overflow-hidden min-h-[600px] flex flex-col">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="relative mb-10">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                      <div className="relative w-24 h-24 border-2 border-indigo-500/20 rounded-full flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border-t-2 border-indigo-500 rounded-full"
                        />
                        <Sparkles className="text-indigo-400 animate-bounce" size={32} />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 animate-pulse">{loadingMessage}</h3>
                    <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
                      Our advanced AI systems are currently synthesizing content and rendering high-resolution visual assets.
                    </p>
                  </motion.div>
                ) : generatedImages.length > 0 ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 flex-1 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{carouselTitle}</h2>
                        <p className="text-sm text-slate-500">5-Slide Sequence Generated Successfully</p>
                      </div>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold text-sm hover:bg-emerald-500/20 transition-all active:scale-95"
                      >
                        <Download size={16} />
                        Export PDF
                      </button>
                    </div>

                    <div className="mb-10 group relative">
                      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="relative z-10">
                        <CarouselPreview images={generatedImages} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-bold text-indigo-300">
                          <MessageSquare size={16} />
                          Engagement Caption
                        </label>
                        <button
                          onClick={handleCopyCaption}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                            isCopied ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                          )}
                        >
                          {isCopied ? <Check size={14} /> : <Copy size={14} />}
                          {isCopied ? 'Copied' : 'Copy Text'}
                        </button>
                      </div>
                      <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 text-sm text-slate-400 font-mono leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                        {postCaption}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="w-20 h-20 bg-slate-800/50 rounded-[2rem] flex items-center justify-center text-slate-500 mb-8 transform rotate-12 transition-transform hover:rotate-0">
                      <Layout size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Void of Creation</h3>
                    <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
                      Enter your topic on the left and let the AI architect your next viral LinkedIn asset.
                    </p>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="mt-8 text-indigo-400"
                    >
                      <ChevronRight size={20} />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 py-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-sm">🍌</span>
              </div>
              Nano Banana
            </div>
            <p className="text-sm text-slate-500">© 2026 Crafted with Passion by Muhammad Schees</p>
          </div>

          <div className="flex items-center gap-6">
            <a href="https://github.com/msk0442" className="text-slate-500 hover:text-white transition-colors">
              <Github size={20} />
            </a>
            <a href="https://www.linkedin.com/in/muhammadschees/" className="text-slate-500 hover:text-white transition-colors">
              <Linkedin size={20} />
            </a>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
              Open Source
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;