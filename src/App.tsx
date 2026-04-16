import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { questions } from './data/questions';
import { evaluateTestLocal, TestResult } from './lib/localEvaluator';
import { Loader2, ArrowRight, ArrowLeft, RefreshCcw, Sparkles } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<'start' | 'test' | 'loading' | 'result'>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswers = answers[currentQuestion?.id] || [];

  const handleStart = () => {
    setStep('test');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setError(null);
  };

  const handleOptionClick = (optionId: string) => {
    setAnswers(prev => {
      const selected = prev[currentQuestion.id] || [];
      if (currentQuestion.type === 'single') {
        return { ...prev, [currentQuestion.id]: [optionId] };
      } else {
        if (selected.includes(optionId)) {
          return { ...prev, [currentQuestion.id]: selected.filter(id => id !== optionId) };
        } else if (selected.length < 4) {
          return { ...prev, [currentQuestion.id]: [...selected, optionId] };
        }
        return prev;
      }
    });
  };

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setStep('loading');
      try {
        const testResult = await evaluateTestLocal(answers);
        setResult(testResult);
        setStep('result');
      } catch (err: any) {
        console.error(err);
        setError(err.message || "连接高维意识失败，请重试。");
        setStep('test');
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl w-full text-center space-y-8 z-10"
          >
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-light tracking-tight serif-text text-[var(--color-ink)]">
                Priest 宇宙<br />
                <span className="italic text-[var(--color-accent)]">灵魂镜像</span>测试
              </h1>
              <p className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-lg mx-auto leading-relaxed">
                在浩瀚的星辰与红尘中，寻找与你灵魂底色最契合的那个身影。
                15道深度叩问，揭示你的命运观、防御机制与情感逻辑。
              </p>
            </div>
            
            <button
              onClick={handleStart}
              className="btn btn-primary flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4" />
              开始连接
            </button>
          </motion.div>
        )}

        {step === 'test' && (
          <motion.div
            key={`question-${currentQuestionIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-3xl w-full minimal-card p-8 md:p-12 z-10"
          >
            <div className="flex justify-between items-center mb-8 text-sm tracking-widest text-[var(--color-text-secondary)] uppercase">
              <span>{currentQuestion.dimension}</span>
              <span className="font-mono">{currentQuestionIndex + 1} / {questions.length}</span>
            </div>

            <h2 className="text-2xl md:text-3xl serif-text mb-8 leading-relaxed text-[var(--color-ink)]">
              {currentQuestion.text}
              <span className="text-sm text-[var(--color-accent)] ml-2 font-sans tracking-normal">
                (最多选四项)
              </span>
            </h2>

            <div className="space-y-4 mb-12">
              {currentQuestion.options.map(option => {
                const isSelected = currentAnswers.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option.id)}
                    className={`w-full text-left p-5 option-btn flex items-start gap-4 ${
                      isSelected ? 'selected' : ''
                    }`}
                  >
                    <div className={`w-6 h-6 shrink-0 rounded-full border flex items-center justify-center mt-0.5 ${
                      isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-muted)]'
                    }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="text-lg leading-relaxed song-text">{option.text}</span>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="text-red-500 mb-6 text-center">{error}</div>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="p-3 rounded-full hover:bg-[var(--color-muted)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[var(--color-ink)]"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentAnswers.length === 0}
                className="btn btn-primary flex items-center gap-2"
              >
                {currentQuestionIndex === questions.length - 1 ? '生成镜像' : '下一题'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-6 z-10"
          >
            <Loader2 className="w-12 h-12 text-[var(--color-accent)] animate-spin" />
            <p className="text-xl serif-text tracking-widest text-[var(--color-text-secondary)]">
              正在连接高维意识，生成你的灵魂镜像...
            </p>
          </motion.div>
        )}

        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl w-full z-10 my-8"
          >
            <div className="minimal-card p-0 relative overflow-hidden flex flex-col md:flex-row">
              {/* Sidebar */}
              <div className="md:w-1/3 bg-[#F8F6F0] border-b md:border-b-0 md:border-r border-[var(--color-muted)] p-8 md:p-12 flex flex-col justify-between">
                <div>
                  <p className="text-sm tracking-[0.3em] uppercase text-[var(--color-text-secondary)] mb-8">你的灵魂镜像</p>
                  <h2 className="text-6xl md:text-7xl serif-text text-[var(--color-ink)] vertical-text border-l-2 border-[var(--color-accent)] pl-4 h-64">
                    {result.characterName}
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div className="md:w-2/3 p-8 md:p-12 space-y-10 bg-[var(--color-bg)]">
                <div>
                  <h3 className="section-title">人物生平 / BIOGRAPHY</h3>
                  <p className="text-[var(--color-ink)] leading-relaxed text-sm text-justify">
                    {result.biography}
                  </p>
                </div>
                
                <div>
                  <h3 className="section-title">深度解析 / DEPTH ANALYSIS</h3>
                  <div className="analysis-card">
                    <div className="text-[var(--color-text-secondary)] leading-loose space-y-4 whitespace-pre-wrap text-sm">
                      {result.analysis}
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex justify-end">
                  <button
                    onClick={handleStart}
                    className="btn flex items-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    重新测试
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
