import React, { useEffect, useRef } from 'react';

export default function ActionLog({ log }) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getActionIcon = (type) => {
    switch (type) {
      case 'instruction_received':
        return '📝';
      case 'parameters_extracted':
        return '🔍';
      case 'clarification_needed':
        return '❓';
      case 'clarification_answered':
        return '💬';
      case 'plan_generated':
        return '📋';
      case 'subtask_start':
        return '▶️';
      case 'tool_call':
        return '🛠️';
      case 'tool_result':
        return '✅';
      case 'tool_error':
        return '⚠️';
      case 'retry':
        return '🔄';
      case 'tool_failed':
        return '❌';
      case 'decision':
        return '🤔';
      case 'decision_failed':
        return '⚠️';
      case 'summary_generated':
        return '📊';
      case 'execution_completed':
        return '🎉';
      case 'execution_failed':
        return '💥';
      default:
        return '•';
    }
  };

  const getActionColor = (type) => {
    switch (type) {
      case 'tool_result':
      case 'decision':
      case 'summary_generated':
      case 'execution_completed':
        return 'border-success/50 bg-success/5';
      case 'tool_error':
      case 'tool_failed':
      case 'execution_failed':
        return 'border-danger/50 bg-danger/5';
      case 'retry':
        return 'border-warning/50 bg-warning/5';
      case 'decision_failed':
        return 'border-warning/50 bg-warning/5';
      case 'clarification_needed':
        return 'border-secondary/50 bg-secondary/5';
      case 'tool_call':
        return 'border-primary/50 bg-primary/5';
      default:
        return 'border-slate-700/50 bg-slate-800/30';
    }
  };

  const renderActionContent = (action) => {
    switch (action.type) {
      case 'instruction_received':
        return (
          <div>
            <span className="font-semibold text-primary">Received instruction:</span>
            <p className="mt-1 text-slate-300">"{action.instruction}"</p>
          </div>
        );

      case 'parameters_extracted':
        return (
          <div>
            <span className="font-semibold text-primary">Extracted parameters:</span>
            <pre className="mt-1 text-xs text-slate-400 bg-slate-900 p-2 rounded overflow-x-auto">
              {JSON.stringify(action.parameters, null, 2)}
            </pre>
          </div>
        );

      case 'clarification_needed':
        return (
          <div>
            <span className="font-semibold text-secondary">Missing parameters:</span>
            <p className="mt-1 text-slate-300">{action.missing_params?.join(', ')}</p>
            <p className="mt-1 text-secondary">Question: {action.question}</p>
          </div>
        );

      case 'clarification_answered':
        return (
          <div>
            <span className="font-semibold text-secondary">User answered:</span>
            <p className="mt-1 text-slate-300">"{action.answer}"</p>
          </div>
        );

      case 'plan_generated':
        return (
          <div>
            <span className="font-semibold text-primary">Generated plan with {action.subtasks?.length} subtasks:</span>
            <div className="mt-2 space-y-1">
              {action.subtasks?.map((st) => (
                <div key={st.id} className="text-sm text-slate-300 pl-4 border-l-2 border-slate-700">
                  <span className="font-mono text-xs text-slate-500">#{st.id}</span> {st.description}
                </div>
              ))}
            </div>
          </div>
        );

      case 'subtask_start':
        return (
          <div>
            <span className="font-semibold text-primary">Subtask #{action.subtask_id}:</span>
            <p className="mt-1 text-slate-300">{action.description}</p>
            {action.reasoning && (
              <p className="mt-1 text-xs text-slate-500 italic">Reasoning: {action.reasoning}</p>
            )}
          </div>
        );

      case 'tool_call':
        return (
          <div>
            <span className="font-semibold text-primary">Calling tool:</span>
            <code className="text-blue-400">{action.tool}</code>
            <span className="text-slate-500"> (attempt {action.attempt})</span>
            {action.args && Object.keys(action.args).length > 0 && (
              <pre className="mt-1 text-xs text-slate-400 bg-slate-900 p-2 rounded overflow-x-auto">
                {JSON.stringify(action.args, null, 2)}
              </pre>
            )}
          </div>
        );

      case 'tool_result':
        return (
          <div>
            <span className="font-semibold text-success">Tool result:</span>
            <code className="text-green-400">{action.tool}</code>
            <span className="text-slate-500"> (attempt {action.attempt})</span>
            {action.result?.data && (
              <div className="mt-1">
                {Array.isArray(action.result.data) ? (
                  <div className="text-xs text-slate-400 max-h-32 overflow-y-auto">
                    Found {action.result.data.length} results
                    {action.result.data.slice(0, 3).map((item, i) => (
                      <div key={i} className="mt-1 p-1 bg-slate-900 rounded">
                        {JSON.stringify(item)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="mt-1 text-xs text-slate-400 bg-slate-900 p-2 rounded overflow-x-auto">
                    {JSON.stringify(action.result.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        );

      case 'tool_error':
        return (
          <div>
            <span className="font-semibold text-danger">Tool error:</span>
            <code className="text-red-400">{action.tool}</code>
            <span className="text-slate-500"> (attempt {action.attempt})</span>
            <p className="mt-1 text-danger">{action.error}</p>
          </div>
        );

      case 'retry':
        return (
          <div>
            <span className="font-semibold text-warning">Retrying:</span>
            <code className="text-yellow-400">{action.tool}</code>
            <p className="mt-1 text-warning text-sm">{action.message}</p>
          </div>
        );

      case 'tool_failed':
        return (
          <div>
            <span className="font-semibold text-danger">Tool failed permanently:</span>
            <code className="text-red-400">{action.tool}</code>
            <p className="mt-1 text-danger">{action.message}</p>
          </div>
        );

      case 'decision':
        return (
          <div>
            <span className="font-semibold text-success">Decision made:</span>
            <code className="text-green-400">{action.tool}</code>
            <p className="mt-1 text-slate-300">{action.reasoning}</p>
            {action.selected && (
              <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-700">
                <span className="text-xs text-slate-500">Selected:</span>
                <pre className="text-xs text-slate-300 mt-1">
                  {JSON.stringify(action.selected, null, 2)}
                </pre>
              </div>
            )}
            {action.alternatives && action.alternatives.length > 0 && (
              <div className="mt-1 text-xs text-slate-500">
                Alternatives considered: {action.alternatives.length}
              </div>
            )}
          </div>
        );

      case 'decision_failed':
        return (
          <div>
            <span className="font-semibold text-warning">Decision failed:</span>
            <code className="text-yellow-400">{action.tool}</code>
            <p className="mt-1 text-warning">{action.message}</p>
          </div>
        );

      case 'summary_generated':
        return (
          <div>
            <span className="font-semibold text-success">Final summary generated:</span>
            <p className="mt-1 text-slate-300">{action.summary?.reasoning}</p>
          </div>
        );

      case 'execution_completed':
        return (
          <div>
            <span className="font-semibold text-success">Execution completed successfully!</span>
            <p className="mt-1 text-slate-400 text-sm">All subtasks finished.</p>
          </div>
        );

      case 'execution_failed':
        return (
          <div>
            <span className="font-semibold text-danger">Execution failed:</span>
            <p className="mt-1 text-danger">{action.error}</p>
          </div>
        );

      default:
        return (
          <div>
            <span className="font-semibold">{action.type}</span>
            <pre className="mt-1 text-xs text-slate-400 bg-slate-900 p-2 rounded overflow-x-auto">
              {JSON.stringify(action, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (!log || log.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-6 text-center">
        <div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-2xl">🧭</div>
          <p className="mt-3 text-sm font-medium text-slate-200">Nothing has been logged yet.</p>
          <p className="mt-1 text-sm text-slate-500">Start with a goal and the action trail will appear here step by step.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto space-y-3 pb-4"
    >
      {log.map((action, index) => (
        <div
          key={index}
          className={`rounded-2xl border border-white/10 p-4 shadow-sm shadow-slate-950/20 transition-all ${getActionColor(action.type)}`}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-950/70 text-lg">{getActionIcon(action.type)}</span>
            <div className="flex-1 min-w-0">
              {renderActionContent(action)}
            </div>
            <span className="flex-shrink-0 rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1 text-[11px] text-slate-500">
              {formatTime(action.timestamp)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
