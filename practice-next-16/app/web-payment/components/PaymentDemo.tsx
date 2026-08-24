'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Minus,
  Zap,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Smartphone,
} from 'lucide-react';
import type {
  CartItem,
  CustomPaymentDetailsInit,
  CustomPaymentOptions,
  PaymentCurrency,
  SimulatedPaymentResponse,
  TransactionStatus,
} from '../types';

const DEMO_PRODUCTS: CartItem[] = [
  {
    id: 'prod-1',
    name: 'AeroGlide Pro Wireless Mechanical Keyboard',
    category: 'Hardware & Peripherals',
    price: 139.0,
    quantity: 1,
    image: '⌨️',
    description: 'Hot-swappable tactile switches, CNC aluminum chassis, 2.4GHz ultra-low latency.',
  },
  {
    id: 'prod-2',
    name: 'SpatialAudio ANC Studio Headphones',
    category: 'Audio Engineering',
    price: 189.0,
    quantity: 1,
    image: '🎧',
    description: '45mm custom beryllium drivers, active hybrid noise cancellation, 40h battery.',
  },
  {
    id: 'prod-3',
    name: 'LuminaSync Smart RGB Desk Lightbar',
    category: 'Smart Lighting',
    price: 49.0,
    quantity: 1,
    image: '💡',
    description: 'Auto-dimming ambient sensor, dual-zone backlight, Ra95 high color rendering.',
  },
];

interface PaymentDemoProps {
  options: CustomPaymentOptions;
  currency: PaymentCurrency;
  applyDiscount: boolean;
  status: TransactionStatus;
  lastResponse: SimulatedPaymentResponse | null;
  isApiSupported: boolean;
  onInitiatePayment: (details: CustomPaymentDetailsInit, options: CustomPaymentOptions, forceSimulator: boolean) => void;
  onReset: () => void;
}

export const PaymentDemo: React.FC<PaymentDemoProps> = ({
  options,
  currency,
  applyDiscount,
  status,
  lastResponse,
  isApiSupported,
  onInitiatePayment,
  onReset,
}) => {
  const [items, setItems] = useState<CartItem[]>(DEMO_PRODUCTS);

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const resetCart = () => {
    setItems(DEMO_PRODUCTS);
  };

  const currencySymbol =
    currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : `${currency} `;

  // Compute Cart Financials
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = applyDiscount && subtotal > 0 ? 20.0 : 0.0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount > 0 ? taxableAmount * 0.0825 : 0.0;
  const initialShipping = options.requestShipping ? 5.0 : 0.0;
  const totalAmount = (taxableAmount + taxAmount + initialShipping).toFixed(2);

  const buildPaymentDetails = (): CustomPaymentDetailsInit => {
    const displayItems = [
      ...items.map((item) => ({
        label: `${item.name} (x${item.quantity})`,
        amount: {
          currency,
          value: (item.price * item.quantity).toFixed(2),
        },
      })),
    ];

    if (discountAmount > 0) {
      displayItems.push({
        label: 'Promotional Discount (PROMO20)',
        amount: {
          currency,
          value: `-${discountAmount.toFixed(2)}`,
        },
      });
    }

    displayItems.push({
      label: 'Estimated Sales Tax (8.25%)',
      amount: {
        currency,
        value: taxAmount.toFixed(2),
      },
    });

    if (options.requestShipping) {
      displayItems.push({
        label: 'Estimated Shipping (Ground 3-5 days)',
        amount: {
          currency,
          value: initialShipping.toFixed(2),
        },
      });
    }

    return {
      total: {
        label: 'Total Amount Due',
        amount: {
          currency,
          value: totalAmount,
        },
      },
      displayItems,
      shippingOptions: options.requestShipping
        ? [
            {
              id: 'standard',
              label: 'Standard Ground (3-5 business days)',
              amount: { currency, value: '5.00' },
              selected: true,
              detail: 'Economical ground delivery',
            },
            {
              id: 'express',
              label: 'Express 2-Day Air',
              amount: { currency, value: '18.00' },
              selected: false,
              detail: 'Fast priority transport',
            },
            {
              id: 'overnight',
              label: 'Priority Overnight (Next morning)',
              amount: { currency, value: '32.00' },
              selected: false,
              detail: 'Guaranteed next day delivery',
            },
          ]
        : undefined,
    };
  };

  const handleNativePay = () => {
    const details = buildPaymentDetails();
    onInitiatePayment(details, options, false);
  };

  const handleSimulatorPay = () => {
    const details = buildPaymentDetails();
    onInitiatePayment(details, options, true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Product Items List (8 cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Cart Items Showcase
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Select products to test dynamic PaymentRequest payload generation
                </p>
              </div>
            </div>

            {items.length < DEMO_PRODUCTS.length && (
              <button
                onClick={resetCart}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium cursor-pointer"
              >
                Restore Items
              </button>
            )}
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-4 last:pb-0"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                    {item.image}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                      {currencySymbol}
                      {item.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="py-12 text-center text-zinc-400">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Your demo cart is empty</p>
                <button
                  onClick={resetCart}
                  className="mt-2 text-xs text-blue-600 dark:text-blue-400 underline font-medium cursor-pointer"
                >
                  Load sample items
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Summary & 1-Click Buy Action (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-500" />
            Order Summary & Breakdown
          </h3>

          <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex justify-between">
              <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items)</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {currencySymbol}
                {subtotal.toFixed(2)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Promo Discount (20 OFF)
                </span>
                <span>
                  -{currencySymbol}
                  {discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Sales Tax (8.25%)</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {currencySymbol}
                {taxAmount.toFixed(2)}
              </span>
            </div>

            {options.requestShipping && (
              <div className="flex justify-between">
                <span>Estimated Shipping (Ground)</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {currencySymbol}
                  {initialShipping.toFixed(2)}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-baseline text-sm">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Total</span>
              <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                {currencySymbol}
                {totalAmount}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {/* Primary Native Web Payment Button */}
            <button
              onClick={handleNativePay}
              disabled={items.length === 0 || status === 'initializing' || status === 'processing_gateway'}
              className="w-full relative group overflow-hidden rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 p-3.5 font-bold text-sm shadow-md hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2.5"
            >
              <Zap className="w-4 h-4 text-amber-400 dark:text-amber-500 fill-current" />
              <span>
                {status === 'processing_gateway'
                  ? 'Authorizing via Gateway...'
                  : status === 'pending_user_action'
                  ? 'Awaiting Browser Sheet...'
                  : `1-Click Pay ${currencySymbol}${totalAmount}`}
              </span>
            </button>

            {/* Fallback / Sandbox Simulator Button */}
            <button
              onClick={handleSimulatorPay}
              disabled={items.length === 0}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 p-2.5 font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-500" />
              <span>Open Web Payment Sheet Simulator</span>
            </button>

            {!isApiSupported && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 justify-center pt-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                Native Web Payment is unavailable in this environment &mdash; simulator will activate.
              </p>
            )}
          </div>

          {/* Transaction Outcome Cards */}
          {status === 'success' && lastResponse && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Payment Authorized & Settled
                </span>
                <button
                  onClick={onReset}
                  className="text-[11px] text-emerald-700 dark:text-emerald-300 underline cursor-pointer"
                >
                  Reset
                </button>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                Method: <span className="font-mono">{lastResponse.methodName}</span>
                <br />
                Payer: <span className="font-semibold">{lastResponse.payerName || 'Alex Morgan'}</span>
                <br />
                Card: <span className="font-mono">{lastResponse.details.cardNumberMasked}</span>
              </p>
            </div>
          )}

          {status === 'failed' && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Transaction Failed / Declined
                </span>
                <button
                  onClick={onReset}
                  className="inline-flex items-center gap-1 text-[11px] text-rose-700 dark:text-rose-300 underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Retry
                </button>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
                The payment could not be completed. Check the inspector logs for the exact error payload.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
