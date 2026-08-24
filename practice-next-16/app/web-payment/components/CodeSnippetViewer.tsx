'use client';

import React, { useState } from 'react';
import { BookOpen, Copy, Check, Sparkles } from 'lucide-react';

const SNIPPETS = {
  basic: `// 1. Check Web Payment Request API availability
if (!window.PaymentRequest) {
  console.warn('PaymentRequest API is not supported in this browser');
  return;
}

// 2. Define supported payment methods (Google Pay, Apple Pay, Cards)
const paymentMethods = [
  {
    supportedMethods: 'https://google.com/pay',
    data: {
      environment: 'PRODUCTION',
      apiVersion: 2,
      apiVersionMinor: 0,
      merchantInfo: {
        merchantId: 'YOUR_MERCHANT_ID',
        merchantName: 'Your Store Name',
      },
      allowedPaymentMethods: [
        {
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX'],
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'stripe', // or adyen, braintree, etc.
              'stripe:version': '2020-08-27',
              'stripe:publishableKey': 'pk_live_...',
            },
          },
        },
      ],
    },
  },
];

// 3. Define transaction details
const paymentDetails = {
  total: {
    label: 'Total with Tax',
    amount: { currency: 'USD', value: '149.00' },
  },
  displayItems: [
    { label: 'Ergonomic Mechanical Keyboard', amount: { currency: 'USD', value: '129.00' } },
    { label: 'Sales Tax (8.25%)', amount: { currency: 'USD', value: '20.00' } },
  ],
};

// 4. Define requested payer options
const paymentOptions = {
  requestPayerName: true,
  requestPayerEmail: true,
  requestPayerPhone: false,
};

// 5. Instantiate and show payment sheet
const request = new PaymentRequest(paymentMethods, paymentDetails, paymentOptions);

try {
  const canPay = await request.canMakePayment();
  if (!canPay) throw new Error('No payment handler available');

  const response = await request.show();

  // 6. Send tokenized details to your server for settlement
  const chargeSuccess = await sendTokenToBackend(response.details);

  if (chargeSuccess) {
    await response.complete('success');
    console.log('Payment processed successfully!');
  } else {
    await response.complete('fail');
  }
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('User dismissed payment dialog');
  } else {
    console.error('Payment failed:', err);
  }
}`,

  shipping: `// Dynamic Shipping Calculation with 'shippingaddresschange'
const request = new PaymentRequest(methods, initialDetails, {
  requestShipping: true,
  shippingType: 'shipping', // or 'delivery', 'pickup'
});

// Listener 1: Update shipping rates when user changes delivery address
request.addEventListener('shippingaddresschange', (e) => {
  e.updateWith(
    (async () => {
      const addr = request.shippingAddress;
      
      // Calculate server-side or client-side rates for destination
      const rates = await fetchShippingRatesForAddress(addr.country, addr.postalCode);
      
      return {
        total: {
          label: 'Total with Shipping',
          amount: { currency: 'USD', value: (subtotal + rates[0].cost).toFixed(2) },
        },
        shippingOptions: rates.map((r, idx) => ({
          id: r.id,
          label: r.name,
          amount: { currency: 'USD', value: r.cost.toFixed(2) },
          selected: idx === 0,
        })),
      };
    })()
  );
});

// Listener 2: Update total when user switches shipping speed
request.addEventListener('shippingoptionchange', (e) => {
  e.updateWith(
    (async () => {
      const selectedOption = request.shippingOption;
      const rate = findRateById(selectedOption);

      return {
        total: {
          label: 'Total Amount',
          amount: { currency: 'USD', value: (subtotal + rate.cost).toFixed(2) },
        },
      };
    })()
  );
});`,

  hook: `// Reusable React Hook Implementation
import { useState, useCallback } from 'react';

export function useWebPayment() {
  const [isProcessing, setIsProcessing] = useState(false);

  const checkout = useCallback(async ({ total, items, onSuccess, onError }) => {
    if (!('PaymentRequest' in window)) {
      throw new Error('PaymentRequest not supported');
    }

    setIsProcessing(true);
    try {
      const request = new PaymentRequest(
        [{ supportedMethods: 'https://google.com/pay', data: { ... } }],
        {
          total: { label: 'Total', amount: { currency: 'USD', value: total } },
          displayItems: items,
        }
      );

      const response = await request.show();
      
      // Process server charge
      const res = await fetch('/api/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.details }),
      });

      if (res.ok) {
        await response.complete('success');
        onSuccess(await res.json());
      } else {
        await response.complete('fail');
        onError(new Error('Charge rejected by bank'));
      }
    } catch (err) {
      onError(err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { checkout, isProcessing };
}`,
};

export const CodeSnippetViewer: React.FC = () => {
  const [activeSnippet, setActiveSnippet] = useState<'basic' | 'shipping' | 'hook'>('basic');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPETS[activeSnippet]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Implementation Guide & Best Practices
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold">
                TypeScript / JS
              </span>
            </h3>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-200/60 dark:bg-zinc-800 text-xs">
          <button
            onClick={() => setActiveSnippet('basic')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeSnippet === 'basic'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            1. Core PaymentRequest
          </button>
          <button
            onClick={() => setActiveSnippet('shipping')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeSnippet === 'shipping'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            2. Dynamic Shipping Events
          </button>
          <button
            onClick={() => setActiveSnippet('hook')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              activeSnippet === 'hook'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            3. React Hook Pattern
          </button>
        </div>
      </div>

      <div className="p-4 relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Standard W3C Payment Request API Specification
          </span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Code
              </>
            )}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-zinc-950 text-indigo-200 font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed border border-zinc-800">
          <code>{SNIPPETS[activeSnippet]}</code>
        </pre>
      </div>
    </div>
  );
};
