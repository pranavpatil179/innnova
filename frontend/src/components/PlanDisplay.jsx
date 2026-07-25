import React from 'react';

export default function PlanDisplay({ plan, currentStep, onComplete }) {
  if (!plan || plan.length === 0) return null;

  return (
    <div className="mb-4 rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-slate-950/30">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-sky-300">
          <span>📋</span>
          Execution Plan
        </h3>
        <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
          {plan.length} steps
        </span>
      </div>
      <div className="space-y-2">
        {plan.map((subtask) => {
          const isCurrent = currentStep === subtask.id;
          const isCompleted = currentStep > subtask.id;

          return (
            <div
              key={subtask.id}
              className={`rounded-2xl border p-3 transition-all ${
                isCompleted
                  ? 'border-emerald-400/30 bg-emerald-500/10'
                  : isCurrent
                  ? 'border-sky-400/40 bg-sky-500/10 shadow-lg shadow-sky-500/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : subtask.id}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-slate-200">{subtask.description}</p>
                  {subtask.reasoning && (
                    <p className="text-xs text-slate-500 mt-1 italic">
                      {subtask.reasoning}
                    </p>
                  )}
                  {subtask.tool && (
                    <span className="mt-1 inline-block rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                      Tool: {subtask.tool}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
