'use client';

import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Globe,
  CreditCard,
  Layers,
} from 'lucide-react';
import type { PaymentDiagnostics } from '../types';

interface DiagnosticsCardProps {
  diagnostics: PaymentDiagnostics;
  onRefresh: () => void;
}

export const DiagnosticsCard: React.FC<DiagnosticsCardProps> = ({
  diagnostics,
  onRefresh,
}) => {
  const getStatusBadge = (val: boolean | null, trueText = 'Available', falseText = 'Unavailable') => {
    if (val === true) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {trueText}
        </span>
      );
    }
    if (val === false) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" />
          {falseText}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
        <AlertTriangle className="w-3.5 h-3.5" />
        Untested / Optional
      </span>
    );
  };

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Web Payment API Diagnostics
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono font-normal">
                W3C Spec
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Probed on {diagnostics.browserName} &bull; Last checked at {diagnostics.checkedAt || 'now'}
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Re-test Environment
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
        {/* PaymentRequest Support */}
        <div className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/60 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 text-sm font-medium">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>window.PaymentRequest</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">API Support</span>
            {getStatusBadge(diagnostics.isSupported, 'Supported', 'Unsupported')}
          </div>
        </div>

        {/* Secure Context */}
        <div className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/60 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 text-sm font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Secure Context</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">HTTPS / localhost</span>
            {getStatusBadge(diagnostics.isSecureContext, 'Secure', 'Insecure')}
          </div>
        </div>

        {/* Can Make Payment */}
        <div className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/60 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 text-sm font-medium">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              <span>canMakePayment()</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Capability Probe</span>
            {getStatusBadge(diagnostics.canMakePayment, 'Ready', 'No Handler')}
          </div>
        </div>

        {/* Enrolled Instruments */}
        <div className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/60 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 text-sm font-medium">
              <Smartphone className="w-4 h-4 text-purple-500" />
              <span>hasEnrolledInstrument()</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Active Cards</span>
            {getStatusBadge(diagnostics.hasEnrolledInstrument, 'Card Found', 'No Cards')}
          </div>
        </div>
      </div>

      {/* Supported Payment Methods Bar */}
      <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100/80 dark:border-blue-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-medium">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Configured Payment Providers:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-medium text-zinc-800 dark:text-zinc-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Google Pay API (Tokenized)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-medium text-zinc-800 dark:text-zinc-200">
            <span className={`w-2 h-2 rounded-full ${diagnostics.supportsApplePay ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
            Apple Pay ({diagnostics.supportsApplePay ? 'Safari Native' : 'iOS/macOS only'})
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-medium text-zinc-800 dark:text-zinc-200">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Simulator & Sandbox Gateway
          </span>
        </div>
      </div>
    </div>
  );
};
