import React, { useState, useEffect, useRef } from 'react';
import ChatInput from './components/ChatInput';
import ActionLog from './components/ActionLog';
import PlanDisplay from './components/PlanDisplay';
import SummaryCard from './components/SummaryCard';
import { createSession, sendInstruction, answerClarification, getSessionState } from './services/api';

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [instruction, setInstruction] = useState('');
  const [actionLog, setActionLog] = useState([]);
  const [plan, setPlan] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [summary, setSummary] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clarificationQuestion, setClarificationQuestion] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, planning, executing, completed, needs_clarification
  const [parameters, setParameters] = useState(null);
  const [error, setError] = useState(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    const savedSessionId = window.localStorage.getItem('innnova-session-id');
    if (!savedSessionId) return;

    setSessionId(savedSessionId);
    getSessionState(savedSessionId)
      .then((state) => {
        setActionLog(state.action_log || []);
        setPlan(state.subtasks || null);
        setCurrentStep(state.current_step || 0);
        setSummary(state.final_summary || null);
        setStatus(state.status || 'idle');
        setParameters(state.extracted_parameters || null);
        setClarificationQuestion(state.clarification_question || null);
        setIsProcessing(state.status === 'executing' || state.status === 'planning');
      })
      .catch((err) => console.error('Failed to restore session state:', err));
  }, []);

  useEffect(() => {
    if (sessionId) {
      window.localStorage.setItem('innnova-session-id', sessionId);
    }
  }, [sessionId]);

  // Poll for state updates
  useEffect(() => {
    if (sessionId && status === 'executing') {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const state = await getSessionState(sessionId);
          setActionLog(state.action_log || []);
          setPlan(state.subtasks || null);
          setCurrentStep(state.current_step || 0);
          setStatus(state.status || 'executing');
          if (state.final_summary) {
            setSummary(state.final_summary);
          }
          if (state.extracted_parameters) {
            setParameters(state.extracted_parameters);
          }
          if (state.status === 'completed' || state.status === 'failed') {
            clearInterval(pollIntervalRef.current);
            setIsProcessing(false);
          }
        } catch (err) {
          console.error('Poll error:', err);
        }
      }, 1000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [sessionId, status]);

  const handleInstructionSubmit = async (input) => {
    setError(null);
    setSummary(null);
    setClarificationQuestion(null);

    try {
      // Create or reuse session
      let sid = sessionId;
      if (!sid) {
        const session = await createSession();
        sid = session.sessionId;
        setSessionId(sid);
      }

      setIsProcessing(true);
      setStatus('planning');

      const response = await sendInstruction(input, sid);

      if (response.status === 'needs_clarification') {
        setClarificationQuestion(response.clarification_question);
        setStatus('needs_clarification');
        setActionLog(response.state?.action_log || []);
        setIsProcessing(false);
        return;
      }

      setPlan(response.plan || null);
      setParameters(response.parameters || null);
      setActionLog(response.state?.action_log || []);
      setStatus(response.status || response.state?.status || 'executing');
      setCurrentStep(0);

    } catch (err) {
      setError(err.message || 'Failed to process instruction');
      setIsProcessing(false);
      setStatus('failed');
    }
  };

  const handleClarificationAnswer = async (answer) => {
    setError(null);
    setClarificationQuestion(null);
    setIsProcessing(true);
    setStatus('planning');

    try {
      const response = await answerClarification(sessionId, answer);

      if (response.status === 'needs_clarification') {
        setClarificationQuestion(response.clarification_question);
        setStatus('needs_clarification');
        setActionLog(response.state?.action_log || []);
        setIsProcessing(false);
        return;
      }

      setPlan(response.plan || null);
      setParameters(response.parameters || null);
      setActionLog(response.state?.action_log || []);
      setStatus(response.status || response.state?.status || 'executing');
      setCurrentStep(0);

    } catch (err) {
      setError(err.message || 'Failed to process answer');
      setIsProcessing(false);
      setStatus('failed');
    }
  };

  const handleNewSession = () => {
    setSessionId(null);
    setInstruction('');
    setActionLog([]);
    setPlan(null);
    setCurrentStep(0);
    setSummary(null);
    setIsProcessing(false);
    setClarificationQuestion(null);
    setStatus('idle');
    setParameters(null);
    setError(null);
    window.localStorage.removeItem('innnova-session-id');
  };

  const demoScenarios = [
    {
      title: "Trip Booking",
      instruction: "Find and book the cheapest flight and hotel combo for Mumbai next weekend under ₹40,000."
    },
    {
      title: "Dining + Calendar",
      instruction: "Book a table for 4 at a highly-rated Italian restaurant this Saturday evening and add it to my calendar."
    }
  ];

  const statusMeta = {
    idle: { label: 'Ready', description: 'Start with a goal or pick one of the samples below.', accent: 'from-sky-400 to-cyan-400' },
    planning: { label: 'Planning', description: 'The agent is turning your request into a clear sequence of steps.', accent: 'from-amber-400 to-orange-400' },
    executing: { label: 'Executing', description: 'Tool calls and decisions are being simulated in real time.', accent: 'from-fuchsia-400 to-violet-400' },
    completed: { label: 'Completed', description: 'The workflow finished and the summary is ready to review.', accent: 'from-emerald-400 to-lime-400' },
    needs_clarification: { label: 'Clarification', description: 'A detail is missing and the agent is waiting for your answer.', accent: 'from-violet-400 to-fuchsia-400' },
    failed: { label: 'Needs attention', description: 'The run hit a problem and should be restarted.', accent: 'from-rose-400 to-red-400' }
  };

  const currentStatus = statusMeta[status] || statusMeta.idle;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] text-slate-100">
      <header className="border-b border-white/10 bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-violet-500 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <span className="text-white font-bold text-xl">✦</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Innnova</h1>
              <p className="text-sm text-slate-400">Autonomous personal assistant agent</p>
            </div>
          </div>
          {sessionId && (
            <button
              onClick={handleNewSession}
              className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-sm transition-all"
            >
              New Session
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {!sessionId && !isProcessing && (
          <section className="mb-6 rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-300">Agent demo</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Hands-off planning with a clear, human-readable trail.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">The experience blends autonomous planning, simulated tool usage, and visible reasoning so each move feels understandable instead of mysterious.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Transparent execution', 'Guided clarification', 'Readable summaries'].map((item) => (
                    <span key={item} className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                Simulated • no real payments • fully observable
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {demoScenarios.map((scenario, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInstructionSubmit(scenario.instruction)}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:bg-slate-800/80"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sky-300">{scenario.title}</h3>
                    <span className="text-slate-400 transition group-hover:text-sky-300">↗</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{scenario.instruction}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-300">
            <p>{error}</p>
          </div>
        )}

        {/* Clarification Question */}
        {clarificationQuestion && (
          <div className="mb-6 rounded-3xl border border-violet-400/20 bg-violet-500/10 p-5 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Clarification needed</p>
            <p className="mt-2 text-slate-200">{clarificationQuestion}</p>
            <div className="mt-4">
              <ChatInput
                onSubmit={handleClarificationAnswer}
                disabled={isProcessing}
                placeholder="Type your answer..."
              />
            </div>
          </div>
        )}

        {/* Plan Display */}
        {plan && status !== 'completed' && status !== 'failed' && (
          <PlanDisplay plan={plan} currentStep={currentStep} />
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            {/* Summary Card */}
            {summary && <SummaryCard summary={summary} />}

            {/* Chat Input */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/30">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
                {status === 'completed' ? 'Run another task' : 'Enter your instruction'}
              </h3>
              <ChatInput
                onSubmit={handleInstructionSubmit}
                disabled={isProcessing || status === 'executing'}
                placeholder="e.g. Find and book the cheapest flight + hotel combo for Mumbai next weekend under ₹40,000"
              />
            </div>

            {/* Status Indicator */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/30">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${
                    status === 'completed' ? 'bg-success' :
                    status === 'failed' ? 'bg-danger' :
                    status === 'executing' ? 'bg-primary animate-pulse' :
                    status === 'planning' ? 'bg-warning animate-pulse' :
                    'bg-slate-600'
                  }`}></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{currentStatus.label}</p>
                    <p className="text-xs text-slate-500">{currentStatus.description}</p>
                  </div>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-400">
                  {status}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-800">
                <div className={`h-2 rounded-full bg-gradient-to-r ${currentStatus.accent}`} style={{ width: status === 'completed' ? '100%' : status === 'failed' ? '40%' : status === 'executing' ? '75%' : status === 'planning' ? '60%' : '25%' }} />
              </div>
              {status === 'executing' && (
                <div className="mt-2 text-xs text-slate-500">
                  Executing subtask {currentStep}...
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Action Log */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 h-[620px] flex flex-col shadow-2xl shadow-slate-950/35">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>📝</span>
                  Live Action Log
                </h3>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">Transparent execution</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <ActionLog log={actionLog} />
              </div>
            </div>
          </div>
        </div>

        {/* Simulated Notice */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <span>⚠️</span>
          <span>All data is simulated using mock fixtures. No real bookings or payments are made.</span>
        </div>
      </div>
    </div>
  );
}
