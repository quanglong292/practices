'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Layers,
  Sparkles,
  ArrowLeft,
  Sliders,
  Terminal,
  BookOpen,
  ShoppingBag,
} from 'lucide-react';
import { usePaymentRequest } from './hooks/usePaymentRequest';
import { DiagnosticsCard } from './components/DiagnosticsCard';
import { PaymentDemo } from './components/PaymentDemo';
import { PaymentPlayground } from './components/PaymentPlayground';
import { PayloadInspector } from './components/PayloadInspector';
import { SimulatorModal } from './components/SimulatorModal';
import { CodeSnippetViewer } from './components/CodeSnippetViewer';
import type {
  CustomPaymentDetailsInit,
  CustomPaymentOptions,
  PaymentCurrency,
} from './types';

export default function WebPaymentPage() {
  const {
    diagnostics,
    status,
    logs,
    lastResponse,
    isSimulatorOpen,
    setIsSimulatorOpen,
    currentRequestDetails,
    runDiagnostics,
    initiatePayment,
    handleSimulatorComplete,
    resetTransaction,
    clearLogs,
  } = usePaymentRequest();

  const [activeTab, setActiveTab] = useState<'demo' | 'playground' | 'inspector' | 'guide'>('demo');

  // Configurable options
  const [options, setOptions] = useState<CustomPaymentOptions>({
    requestPayerName: true,
    requestPayerEmail: true,
    requestPayerPhone: false,
    requestShipping: true,
    shippingType: 'shipping',
  });

  const [currency, setCurrency] = useState<PaymentCurrency>('USD');
  const [applyDiscount, setApplyDiscount] = useState<boolean>(false);
  const [shippingOptionPreset, setShippingOptionPreset] = useState<string>('standard');

  // Default fallback details if simulator opens before a demo transaction was launched
  const fallbackDetails: CustomPaymentDetailsInit = {
    total: {
      label: 'Demo Order Total',
      amount: { currency, value: '149.00' },
    },
    displayItems: [
      {
        label: 'AeroGlide Pro Wireless Mechanical Keyboard',
        amount: { currency, value: '139.00' },
      },
      {
        label: 'Estimated Sales Tax (8.25%)',
        amount: { currency, value: '10.00' },
      },
    ],
    shippingOptions: [
      {
        id: 'standard',
        label: 'Standard Ground (3-5 business days)',
        amount: { currency, value: '5.00' },
        selected: true,
      },
      {
        id: 'express',
        label: 'Express 2-Day Air',
        amount: { currency, value: '18.00' },
        selected: false,
      },
    ],
  };

  const activeModalDetails = currentRequestDetails?.details || fallbackDetails;
  const activeModalOptions = currentRequestDetails?.options || options;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-500 selection:text-white pb-20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                  Web Payment API Demo
                </h1>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                  W3C Payment Request &middot; Next.js 16
                </span>
              </div>
            </div>
          </div>

          {/* Quick links & Status Badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/ts-table"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>TanStack Table POC</span>
            </Link>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Sparkles className="w-3 h-3" />
              <span>POC Sandbox</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Hero & Intro */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white border border-white/20">
              <CreditCard className="w-3.5 h-3.5" /> W3C Web Payment Standards
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Universal Web Payment API Proof of Concept
            </h2>
            <p className="text-sm sm:text-base text-blue-100 font-normal leading-relaxed">
              Explore frictionless 1-click browser checkouts with <code className="bg-white/20 px-1.5 py-0.5 rounded font-mono text-xs">window.PaymentRequest</code>, tokenized wallets (Google Pay, Apple Pay), and dynamic lifecycle events like <code className="bg-white/20 px-1.5 py-0.5 rounded font-mono text-xs">shippingaddresschange</code>.
            </p>
          </div>

          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        </div>

        {/* Diagnostics Probing Card */}
        <DiagnosticsCard
          diagnostics={diagnostics}
          onRefresh={runDiagnostics}
        />

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'demo'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Interactive Store & Checkout</span>
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'playground'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Options & Playground</span>
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'inspector'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>JSON Inspector & Logs ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'guide'
                ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Implementation Reference</span>
          </button>
        </div>

        {/* Tab Views */}
        <div className="space-y-6">
          {activeTab === 'demo' && (
            <div className="space-y-6">
              <PaymentDemo
                options={options}
                currency={currency}
                applyDiscount={applyDiscount}
                status={status}
                lastResponse={lastResponse}
                isApiSupported={diagnostics.isSupported}
                onInitiatePayment={initiatePayment}
                onReset={resetTransaction}
              />

              {/* Also show mini inspector below checkout for immediate feedback */}
              <PayloadInspector
                details={activeModalDetails}
                options={options}
                lastResponse={lastResponse}
                logs={logs}
                status={status}
                onClearLogs={clearLogs}
              />
            </div>
          )}

          {activeTab === 'playground' && (
            <div className="space-y-6">
              <PaymentPlayground
                options={options}
                setOptions={setOptions}
                currency={currency}
                setCurrency={setCurrency}
                applyDiscount={applyDiscount}
                setApplyDiscount={setApplyDiscount}
                shippingOptionPreset={shippingOptionPreset}
                setShippingOptionPreset={setShippingOptionPreset}
              />

              <PaymentDemo
                options={options}
                currency={currency}
                applyDiscount={applyDiscount}
                status={status}
                lastResponse={lastResponse}
                isApiSupported={diagnostics.isSupported}
                onInitiatePayment={initiatePayment}
                onReset={resetTransaction}
              />
            </div>
          )}

          {activeTab === 'inspector' && (
            <div className="space-y-6">
              <PayloadInspector
                details={activeModalDetails}
                options={options}
                lastResponse={lastResponse}
                logs={logs}
                status={status}
                onClearLogs={clearLogs}
              />
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-6">
              <CodeSnippetViewer />
            </div>
          )}
        </div>
      </main>

      {/* Sheet Simulator Modal */}
      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        details={activeModalDetails}
        options={activeModalOptions}
        onComplete={handleSimulatorComplete}
      />
    </div>
  );
}
