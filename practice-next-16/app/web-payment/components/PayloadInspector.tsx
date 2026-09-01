'use client';

import React, { useState } from 'react';
import {
  Code,
  Check,
  Copy,
  Terminal,
  Activity,
  Trash2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import type {
  CustomPaymentDetailsInit,
  CustomPaymentOptions,
  PaymentLog,
  SimulatedPaymentResponse,
  TransactionStatus,
} from '../types';

interface PayloadInspectorProps {
  details: CustomPaymentDetailsInit;
  options: CustomPaymentOptions;
  lastResponse: SimulatedPaymentResponse | null;
  logs: PaymentLog[];
  status: TransactionStatus;
  onClearLogs: () => void;
}

export const PayloadInspector: React.FC<PayloadInspectorProps> = ({
  details,
  options,
  lastResponse,
  logs,
  status,
  onClearLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'request' | 'response' | 'logs'>('request');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const requestPayload = {
    methodData: [
      {
        supportedMethods: 'https://google.com/pay',
        data: {
          environment: 'TEST',
          apiVersion: 2,
          apiVersionMinor: 0,
          merchantInfo: {
            merchantId: '12345678901234567890',
            merchantName: 'Next.js 16 Web Payment Demo',
          },
          allowedPaymentMethods: [
            {
              type: 'CARD',
              parameters: {
                allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX', 'DISCOVER'],
              },
              tokenizationSpecification: {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                  gateway: 'example',
                  gatewayMerchantId: 'exampleGatewayMerchantId',
                },
              },
            },
          ],
        },
      },
      {
        supportedMethods: 'https://apple.com/apple-pay',
        data: {
          version: 3,
          merchantIdentifier: 'merchant.com.example.webpay',
          merchantCapabilities: ['supports3DS'],
          supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
          countryCode: 'US',
        },
      },
      {
        supportedMethods: 'basic-card',
        data: {
          supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'],
          supportedTypes: ['credit', 'debit'],
        },
      },
    ],
    details: {
      total: details.total,
      displayItems: details.displayItems,
      shippingOptions: details.shippingOptions,
      modifiers: details.modifiers,
    },
    options: {
      requestPayerName: options.requestPayerName,
      requestPayerEmail: options.requestPayerEmail,
      requestPayerPhone: options.requestPayerPhone,
      requestShipping: options.requestShipping,
      shippingType: options.shippingType,
    },
  };

  const copyToClipboard = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'initializing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Initializing Sheet
          </span>
        );
      case 'pending_user_action':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Awaiting User Action
          </span>
        );
      case 'processing_gateway':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Processing Gateway Auth
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Payment Settled & Complete
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Payment Failed
          </span>
        );
      case 'aborted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/15 text-zinc-600 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
            User Canceled Sheet
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
            Idle
          </span>
        );
    }
  };

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
      {/* Header & Tabs */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Payment Inspector & Telemetry
              {getStatusIndicator()}
            </h3>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('request')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'request'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
            Request Payload
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'response'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
            Response ({lastResponse ? '1' : '0'})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-purple-500" />
            Event Logs ({logs.length})
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="p-4 flex-1">
        {/* REQUEST TAB */}
        {activeTab === 'request' && (
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                PaymentMethodData &bull; PaymentDetailsInit &bull; PaymentOptions
              </span>
              <button
                onClick={() =>
                  copyToClipboard(JSON.stringify(requestPayload, null, 2), 'request')
                }
                className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer"
              >
                {copiedTab === 'request' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy JSON
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed border border-zinc-800">
              <code>{JSON.stringify(requestPayload, null, 2)}</code>
            </pre>
          </div>
        )}

        {/* RESPONSE TAB */}
        {activeTab === 'response' && (
          <div className="relative">
            {lastResponse ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    PaymentResponse payload (W3C Standard)
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(JSON.stringify(lastResponse, null, 2), 'response')
                    }
                    className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer"
                  >
                    {copiedTab === 'response' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy JSON
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-zinc-950 text-emerald-300 font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed border border-zinc-800">
                  <code>{JSON.stringify(lastResponse, null, 2)}</code>
                </pre>
              </div>
            ) : (
              <div className="py-16 text-center text-zinc-400 dark:text-zinc-500 space-y-2">
                <Code className="w-8 h-8 mx-auto stroke-[1.5] text-zinc-300 dark:text-zinc-600" />
                <p className="text-xs font-medium">No PaymentResponse captured yet.</p>
                <p className="text-[11px]">
                  Click &ldquo;Pay with Web Payment API&rdquo; in the demo above to trigger a transaction.
                </p>
              </div>
            )}
          </div>
        )}

        {/* EVENT LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                Real-time API Lifecycle Timeline
              </span>
              {logs.length > 0 && (
                <button
                  onClick={onClearLogs}
                  className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Logs
                </button>
              )}
            </div>

            {logs.length > 0 ? (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            log.type === 'success'
                              ? 'bg-emerald-500'
                              : log.type === 'error'
                              ? 'bg-rose-500'
                              : log.type === 'warn'
                              ? 'bg-amber-500'
                              : log.type === 'event'
                              ? 'bg-purple-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {log.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {log.timestamp}
                      </span>
                    </div>

                    {log.details && (
                      <pre className="mt-1 p-2 rounded-lg bg-zinc-950 text-zinc-300 font-mono text-[11px] overflow-x-auto">
                        {typeof log.details === 'string'
                          ? log.details
                          : JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-zinc-400 dark:text-zinc-500">
                <Activity className="w-8 h-8 mx-auto stroke-[1.5] text-zinc-300 dark:text-zinc-600 mb-2" />
                <p className="text-xs">No events recorded yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
