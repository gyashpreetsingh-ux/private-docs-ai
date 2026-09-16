import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 animate-pulse">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-slate-800"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-800 rounded w-3/4"></div>
        <div className="h-3 bg-slate-800/60 rounded w-1/2"></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 my-4">
      <div className="h-10 bg-slate-800/50 rounded-xl"></div>
      <div className="h-10 bg-slate-800/50 rounded-xl"></div>
    </div>
    <div className="h-8 bg-slate-800/40 rounded-lg"></div>
  </div>
);

export const ChatSkeleton: React.FC = () => (
  <div className="py-6 px-4 md:px-6 bg-slate-900/30 border-y border-slate-800/30 animate-pulse">
    <div className="max-w-4xl mx-auto flex space-x-4">
      <div className="w-9 h-9 rounded-xl bg-slate-800 shrink-0"></div>
      <div className="flex-1 space-y-3 pt-1">
        <div className="h-3 bg-slate-800 rounded w-28"></div>
        <div className="h-4 bg-slate-800/70 rounded w-5/6"></div>
        <div className="h-4 bg-slate-800/70 rounded w-4/6"></div>
        <div className="h-4 bg-slate-800/70 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);
