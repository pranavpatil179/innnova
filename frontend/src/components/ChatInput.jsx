import React, { useState } from 'react';

export default function ChatInput({ onSubmit, disabled, placeholder = "Enter your instruction..." }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    setValue('');
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3.5 text-slate-100 placeholder-slate-500 shadow-inner shadow-slate-950/40 transition-all focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/70 disabled:cursor-not-allowed disabled:opacity-50"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="inline-flex min-w-[126px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-3.5 font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {disabled ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>Processing</span>
            </>
          ) : (
            <>
              <span>Send</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polyline points="22 2 15 22 11 15 2 11 22 2"></polyline>
              </svg>
            </>
          )}
        </button>
      </form>
      <p className="text-xs text-slate-500">Try a concrete request such as a budget, date, or party size to get sharper results.</p>
    </div>
  );
}
