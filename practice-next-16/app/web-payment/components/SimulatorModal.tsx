'use client';

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  MapPin,
  Truck,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Check,
  Lock,
} from 'lucide-react';
import type {
  CustomPaymentDetailsInit,
  CustomPaymentOptions,
  SimulatedPaymentResponse,
} from '../types';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: CustomPaymentDetailsInit;
  options: CustomPaymentOptions;
  onComplete: (response: SimulatedPaymentResponse, shouldSucceed: boolean) => void;
}

const PRESET_CARDS = [
  {
    id: 'card-1',
    brand: 'Visa',
    last4: '4242',
    holder: 'Alex Morgan',
    exp: '08/28',
    color: 'from-blue-600 to-indigo-700',
    type: 'CREDIT',
  },
  {
    id: 'card-2',
    brand: 'Mastercard',
    last4: '8899',
    holder: 'Alex Morgan',
    exp: '11/29',
    color: 'from-amber-600 to-rose-600',
    type: 'DEBIT',
  },
  {
    id: 'card-3',
    brand: 'Amex',
    last4: '1004',
    holder: 'Alex Morgan',
    exp: '03/27',
    color: 'from-emerald-600 to-teal-700',
    type: 'PREMIUM',
  },
];

const PRESET_ADDRESSES = [
  {
    id: 'addr-us-1',
    recipient: 'Alex Morgan',
    addressLine: ['742 Evergreen Terrace', 'Apt 4B'],
    city: 'Springfield',
    region: 'OR',
    postalCode: '97477',
    country: 'US',
    countryName: 'United States',
    phone: '+1 (555) 019-2834',
  },
  {
    id: 'addr-us-2',
    recipient: 'Alex Morgan (Work)',
    addressLine: ['500 Howard Street', 'Suite 1200'],
    city: 'San Francisco',
    region: 'CA',
    postalCode: '94105',
    country: 'US',
    countryName: 'United States',
    phone: '+1 (555) 321-9988',
  },
  {
    id: 'addr-uk',
    recipient: 'Alex Morgan',
    addressLine: ['10 Downing Street'],
    city: 'London',
    region: 'Greater London',
    postalCode: 'SW1A 2AA',
    country: 'GB',
    countryName: 'United Kingdom (Intl)',
    phone: '+44 20 7946 0912',
  },
];

export const SimulatorModal: React.FC<SimulatorModalProps> = ({
  isOpen,
  onClose,
  details,
  options,
  onComplete,
}) => {
  const [selectedCardId, setSelectedCardId] = useState(PRESET_CARDS[0].id);
  const [selectedAddrId, setSelectedAddrId] = useState(PRESET_ADDRESSES[0].id);
  const [selectedShippingOptId, setSelectedShippingOptId] = useState(
    details.shippingOptions?.find((o) => o.selected)?.id || details.shippingOptions?.[0]?.id || 'standard'
  );

  const [payerName, setPayerName] = useState('Alex Morgan');
  const [payerEmail, setPayerEmail] = useState('alex.morgan@example.com');
  const [payerPhone, setPayerPhone] = useState('+1 (555) 019-2834');

  if (!isOpen) return null;

  const currentAddr = PRESET_ADDRESSES.find((a) => a.id === selectedAddrId) || PRESET_ADDRESSES[0];
  const selectedCard = PRESET_CARDS.find((c) => c.id === selectedCardId) || PRESET_CARDS[0];

  // Calculate simulated shipping costs based on address
  const isIntl = currentAddr.country !== 'US';
  const standardRate = isIntl ? 15.0 : 5.0;
  const expressRate = isIntl ? 35.0 : 18.0;
  const overnightRate = isIntl ? 65.0 : 32.0;

  const shippingRates: Record<string, { label: string; cost: number }> = {
    standard: {
      label: isIntl ? 'International Standard (7-14 days)' : 'Standard Ground (3-5 business days)',
      cost: standardRate,
    },
    express: {
      label: isIntl ? 'International Priority (3-5 days)' : 'Express 2-Day Air',
      cost: expressRate,
    },
    overnight: {
      label: isIntl ? 'Global Express Next Flight' : 'Priority Overnight by 10:30 AM',
      cost: overnightRate,
    },
  };

  const activeShipping = shippingRates[selectedShippingOptId] || shippingRates.standard;

  // Calculate active total
  const baseItems = details.displayItems.filter((i) => !i.label.toLowerCase().includes('shipping'));
  const itemsSum = baseItems.reduce((acc, curr) => acc + parseFloat(curr.amount.value), 0);
  const effectiveShippingCost = options.requestShipping ? activeShipping.cost : 0;
  const finalTotal = (itemsSum + effectiveShippingCost).toFixed(2);

  const handleSubmit = (shouldSucceed = true) => {
    const simulatedResponse: SimulatedPaymentResponse = {
      methodName: 'https://google.com/pay',
      details: {
        cardNumberMasked: `•••• •••• •••• ${selectedCard.last4}`,
        cardholderName: payerName || selectedCard.holder,
        expiryMonth: selectedCard.exp.split('/')[0],
        expiryYear: `20${selectedCard.exp.split('/')[1]}`,
        tokenizationData: {
          token: `tok_simulated_${Math.random().toString(36).substring(2, 15)}`,
          type: 'PAYMENT_GATEWAY',
        },
        billingAddress: {
          recipient: currentAddr.recipient,
          addressLine: currentAddr.addressLine,
          city: currentAddr.city,
          country: currentAddr.country,
          postalCode: currentAddr.postalCode,
        },
      },
      shippingAddress: options.requestShipping
        ? {
            recipient: currentAddr.recipient,
            addressLine: currentAddr.addressLine,
            city: currentAddr.city,
            region: currentAddr.region,
            postalCode: currentAddr.postalCode,
            country: currentAddr.country,
            phone: currentAddr.phone,
          }
        : undefined,
      shippingOption: options.requestShipping ? selectedShippingOptId : undefined,
      payerName: options.requestPayerName ? payerName : undefined,
      payerEmail: options.requestPayerEmail ? payerEmail : undefined,
      payerPhone: options.requestPayerPhone ? payerPhone : undefined,
      requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
    };

    onComplete(simulatedResponse, shouldSucceed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar (Browser Style) */}
        <div className="px-6 py-4 bg-zinc-100/80 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Web Payment Sheet
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                  Native Sheet Simulator
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-500" />
                https://practice-next-16.local &bull; 256-bit Encrypted
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Order Total Highlight */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60">
            <div>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Total to Authorize
              </span>
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                {details.total.amount.currency === 'USD' ? '$' : details.total.amount.currency + ' '}
                {finalTotal}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {baseItems.length} item{baseItems.length > 1 ? 's' : ''} + tax & shipping
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-500" />
              Select Payment Instrument
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PRESET_CARDS.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedCardId(card.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                    selectedCardId === card.id
                      ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800/40'
                  }`}
                >
                  {selectedCardId === card.id && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {card.brand} &bull;&bull;&bull;&bull; {card.last4}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex justify-between">
                    <span>Exp {card.exp}</span>
                    <span className="text-[10px] uppercase font-mono">{card.type}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Shipping Address (if requested) */}
          {options.requestShipping && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  Delivery Destination (Fires shippingaddresschange)
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PRESET_ADDRESSES.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => setSelectedAddrId(addr.id)}
                    className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                      selectedAddrId === addr.id
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800/40'
                    }`}
                  >
                    {selectedAddrId === addr.id && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {addr.city}, {addr.country}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 truncate">
                      {addr.addressLine[0]}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {addr.countryName}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Options (if requested) */}
          {options.requestShipping && (
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-indigo-500" />
                Shipping Speed (Fires shippingoptionchange)
              </label>
              <div className="space-y-2">
                {Object.entries(shippingRates).map(([optId, rate]) => (
                  <label
                    key={optId}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedShippingOptId === optId
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 ring-1 ring-indigo-500/30'
                        : 'border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingOption"
                        checked={selectedShippingOptId === optId}
                        onChange={() => setSelectedShippingOptId(optId)}
                        className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                        {rate.label}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      +${rate.cost.toFixed(2)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Payer Contact Information */}
          {(options.requestPayerName || options.requestPayerEmail || options.requestPayerPhone) && (
            <div className="p-4 rounded-2xl bg-zinc-50/60 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 space-y-3">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                Payer Contact Details (from Browser Autofill)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {options.requestPayerName && (
                  <div>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mb-1">
                      <User className="w-3 h-3" /> Full Name
                    </span>
                    <input
                      type="text"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {options.requestPayerEmail && (
                  <div>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mb-1">
                      <Mail className="w-3 h-3" /> Email
                    </span>
                    <input
                      type="email"
                      value={payerEmail}
                      onChange={(e) => setPayerEmail(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {options.requestPayerPhone && (
                  <div>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mb-1">
                      <Phone className="w-3 h-3" /> Phone
                    </span>
                    <input
                      type="text"
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto text-xs px-3.5 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium cursor-pointer"
          >
            Simulate Gateway Failure (Card Decline)
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial text-xs px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit(true)}
              className="flex-1 sm:flex-initial text-xs px-6 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              Authorize & Pay ${finalTotal}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
