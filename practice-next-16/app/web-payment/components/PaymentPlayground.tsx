'use client';

import React from 'react';
import {
  Sliders,
  User,
  Mail,
  Phone,
  Truck,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import type {
  CustomPaymentOptions,
  PaymentCurrency,
} from '../types';

interface PaymentPlaygroundProps {
  options: CustomPaymentOptions;
  setOptions: React.Dispatch<React.SetStateAction<CustomPaymentOptions>>;
  currency: PaymentCurrency;
  setCurrency: (curr: PaymentCurrency) => void;
  applyDiscount: boolean;
  setApplyDiscount: (val: boolean) => void;
  shippingOptionPreset: string;
  setShippingOptionPreset: (val: string) => void;
}

export const PaymentPlayground: React.FC<PaymentPlaygroundProps> = ({
  options,
  setOptions,
  currency,
  setCurrency,
  applyDiscount,
  setApplyDiscount,
}) => {
  const currencies: PaymentCurrency[] = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-400/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            PaymentRequest Configurator & Playground
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Adjust PaymentOptions and dynamic parameters to observe how the native sheet responds
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Payer Contact Options */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-purple-500" />
            Payer Information (PaymentOptions)
          </label>
          <div className="space-y-2.5">
            <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors">
              <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>requestPayerName</span>
              </div>
              <input
                type="checkbox"
                checked={options.requestPayerName}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, requestPayerName: e.target.checked }))
                }
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors">
              <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>requestPayerEmail</span>
              </div>
              <input
                type="checkbox"
                checked={options.requestPayerEmail}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, requestPayerEmail: e.target.checked }))
                }
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors">
              <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>requestPayerPhone</span>
              </div>
              <input
                type="checkbox"
                checked={options.requestPayerPhone}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, requestPayerPhone: e.target.checked }))
                }
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
              />
            </label>
          </div>
        </div>

        {/* Shipping & Delivery Options */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-500" />
            Fulfillment & Shipping (PaymentOptions)
          </label>
          <div className="space-y-2.5">
            <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors">
              <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                <Truck className="w-3.5 h-3.5 text-zinc-400" />
                <span>requestShipping</span>
              </div>
              <input
                type="checkbox"
                checked={options.requestShipping}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, requestShipping: e.target.checked }))
                }
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
            </label>

            {options.requestShipping && (
              <div className="p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-1.5">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block">
                  shippingType Mode:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['shipping', 'delivery', 'pickup'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOptions((prev) => ({ ...prev, shippingType: type }))}
                      className={`text-[11px] py-1.5 rounded-lg font-medium capitalize transition-all cursor-pointer ${
                        options.shippingType === type
                          ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                          : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Currency & Modifier Rules */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-amber-500" />
            Currency & Promotion Modifiers
          </label>
          <div className="space-y-2.5">
            {/* Currency Picker */}
            <div className="p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-1.5">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block">
                Currency Code (ISO 4217):
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {currencies.map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`text-xs py-1.5 rounded-lg font-mono font-medium transition-all cursor-pointer ${
                      currency === curr
                        ? 'bg-amber-600 text-white font-bold shadow-sm'
                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            {/* Promotional Modifier Toggle */}
            <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-800 dark:text-zinc-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Apply $20 Promo Modifier</span>
              </div>
              <input
                type="checkbox"
                checked={applyDiscount}
                onChange={(e) => setApplyDiscount(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
