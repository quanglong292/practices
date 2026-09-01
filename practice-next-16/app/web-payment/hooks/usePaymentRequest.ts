'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  CustomPaymentDetailsInit,
  CustomPaymentOptions,
  PaymentDiagnostics,
  PaymentLog,
  SimulatedPaymentResponse,
  TransactionStatus,
} from '../types';

export function usePaymentRequest() {
  const [diagnostics, setDiagnostics] = useState<PaymentDiagnostics>({
    isSupported: false,
    isSecureContext: false,
    canMakePayment: null,
    hasEnrolledInstrument: null,
    supportsGooglePay: false,
    supportsApplePay: false,
    supportsBasicCard: false,
    browserName: 'Detecting...',
    checkedAt: '',
  });

  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [lastResponse, setLastResponse] = useState<SimulatedPaymentResponse | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [currentRequestDetails, setCurrentRequestDetails] = useState<{
    details: CustomPaymentDetailsInit;
    options: CustomPaymentOptions;
  } | null>(null);

  const activePaymentRequestRef = useRef<PaymentRequest | null>(null);

  const addLog = useCallback(
    (
      type: PaymentLog['type'],
      title: string,
      details?: Record<string, unknown> | string
    ) => {
      const newLog: PaymentLog = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        type,
        title,
        details,
      };
      setLogs((prev) => [newLog, ...prev]);
    },
    []
  );

  // Probe environment and Web Payment API support
  const runDiagnostics = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const isSecure = window.isSecureContext || window.location.hostname === 'localhost';
    const isSupported = 'PaymentRequest' in window;

    // Detect browser user agent
    const userAgent = navigator.userAgent;
    let browser = 'Unknown Browser';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Google Chrome';
    else if (userAgent.includes('Edg')) browser = 'Microsoft Edge';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Apple Safari';
    else if (userAgent.includes('Firefox')) browser = 'Mozilla Firefox';

    const supportsApplePay = typeof (window as unknown as { ApplePaySession?: unknown }).ApplePaySession !== 'undefined';
    let supportsGooglePay = false;
    let supportsBasicCard = false;
    let canMakePaymentResult: boolean | null = null;
    let hasEnrolledInstrumentResult: boolean | null = null;

    if (isSupported) {
      try {
        const dummyMethods: PaymentMethodData[] = [
          {
            supportedMethods: 'https://google.com/pay',
            data: {
              environment: 'TEST',
              apiVersion: 2,
              apiVersionMinor: 0,
              allowedPaymentMethods: [
                {
                  type: 'CARD',
                  parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['MASTERCARD', 'VISA'],
                  },
                },
              ],
            },
          },
          {
            supportedMethods: 'basic-card',
            data: {
              supportedNetworks: ['visa', 'mastercard', 'amex'],
            },
          },
        ];

        const dummyDetails: PaymentDetailsInit = {
          total: {
            label: 'Probe Diagnostics Check',
            amount: { currency: 'USD', value: '1.00' },
          },
        };

        const testRequest = new PaymentRequest(dummyMethods, dummyDetails);
        canMakePaymentResult = await testRequest.canMakePayment();
        supportsGooglePay = true;
        supportsBasicCard = true;

        if ('hasEnrolledInstrument' in testRequest) {
          try {
            hasEnrolledInstrumentResult = await (testRequest as unknown as { hasEnrolledInstrument: () => Promise<boolean> }).hasEnrolledInstrument();
          } catch {
            hasEnrolledInstrumentResult = null;
          }
        }
      } catch (err: unknown) {
        canMakePaymentResult = false;
        console.warn('Diagnostics test failed:', err);
      }
    }

    setDiagnostics({
      isSupported,
      isSecureContext: isSecure,
      canMakePayment: canMakePaymentResult,
      hasEnrolledInstrument: hasEnrolledInstrumentResult,
      supportsGooglePay,
      supportsApplePay,
      supportsBasicCard,
      browserName: browser,
      checkedAt: new Date().toLocaleTimeString(),
    });

    addLog('info', 'Ran Web Payment API Diagnostics', {
      isSupported,
      isSecureContext: isSecure,
      canMakePayment: canMakePaymentResult,
      hasEnrolledInstrument: hasEnrolledInstrumentResult,
      browser,
    });
  }, [addLog]);

  useEffect(() => {
    let active = true;
    const probe = async () => {
      if (typeof window === 'undefined') return;
      await runDiagnostics();
    };
    if (active) {
      void probe();
    }
    return () => {
      active = false;
    };
  }, [runDiagnostics]);

  const calculateDynamicShipping = (
    address: PaymentAddress | { country?: string; region?: string; postalCode?: string } | null,
    baseDetails: CustomPaymentDetailsInit
  ): CustomPaymentDetailsInit => {
    const isInternational = address?.country && address.country !== 'US';
    const subtotal = parseFloat(baseDetails.total.amount.value);

    const standardCost = isInternational ? 15.0 : 5.0;
    const expressCost = isInternational ? 35.0 : 18.0;
    const overnightCost = isInternational ? 65.0 : 32.0;

    const shippingOptions = [
      {
        id: 'standard',
        label: isInternational ? 'International Standard (7-14 days)' : 'Standard Ground (3-5 business days)',
        amount: {
          currency: baseDetails.total.amount.currency,
          value: standardCost.toFixed(2),
        },
        selected: true,
        detail: 'Tracked postal delivery',
      },
      {
        id: 'express',
        label: isInternational ? 'International Priority (3-5 days)' : 'Express 2-Day Air',
        amount: {
          currency: baseDetails.total.amount.currency,
          value: expressCost.toFixed(2),
        },
        selected: false,
        detail: 'Fast courier service',
      },
      {
        id: 'overnight',
        label: isInternational ? 'Global Express Next Flight' : 'Priority Overnight by 10:30 AM',
        amount: {
          currency: baseDetails.total.amount.currency,
          value: overnightCost.toFixed(2),
        },
        selected: false,
        detail: 'Guaranteed next morning delivery',
      },
    ];

    const newTotal = (subtotal + standardCost).toFixed(2);

    return {
      ...baseDetails,
      total: {
        label: 'Total with Shipping',
        amount: {
          currency: baseDetails.total.amount.currency,
          value: newTotal,
        },
      },
      displayItems: [
        ...baseDetails.displayItems.filter((i) => !i.label.toLowerCase().includes('shipping')),
        {
          label: `Shipping (${shippingOptions[0].label})`,
          amount: {
            currency: baseDetails.total.amount.currency,
            value: standardCost.toFixed(2),
          },
        },
      ],
      shippingOptions,
    };
  };

  const calculateDynamicOptionChange = (
    selectedOptionId: string,
    currentDetails: CustomPaymentDetailsInit
  ): CustomPaymentDetailsInit => {
    const selected = currentDetails.shippingOptions?.find((opt) => opt.id === selectedOptionId);
    if (!selected) return currentDetails;

    // Filter out previous shipping item
    const baseItems = currentDetails.displayItems.filter(
      (item) => !item.label.toLowerCase().includes('shipping')
    );
    const itemsTotal = baseItems.reduce((acc, curr) => acc + parseFloat(curr.amount.value), 0);
    const shippingPrice = parseFloat(selected.amount.value);
    const newTotal = (itemsTotal + shippingPrice).toFixed(2);

    const updatedOptions = currentDetails.shippingOptions?.map((opt) => ({
      ...opt,
      selected: opt.id === selectedOptionId,
    }));

    return {
      ...currentDetails,
      total: {
        label: 'Total Amount',
        amount: {
          currency: currentDetails.total.amount.currency,
          value: newTotal,
        },
      },
      displayItems: [
        ...baseItems,
        {
          label: `Selected Shipping (${selected.label})`,
          amount: {
            currency: currentDetails.total.amount.currency,
            value: selected.amount.value,
          },
        },
      ],
      shippingOptions: updatedOptions,
    };
  };

  const initiatePayment = async (
    details: CustomPaymentDetailsInit,
    options: CustomPaymentOptions,
    forceSimulator = false
  ) => {
    setStatus('initializing');
    addLog('info', 'Initiating Payment Request', {
      forceSimulator,
      total: `${details.total.amount.value} ${details.total.amount.currency}`,
      requestShipping: options.requestShipping,
      shippingType: options.shippingType,
    });

    setCurrentRequestDetails({ details, options });

    if (forceSimulator || !diagnostics.isSupported) {
      addLog('warn', 'Launching interactive Web Payment Sheet Simulator');
      setStatus('pending_user_action');
      setIsSimulatorOpen(true);
      return;
    }

    try {
      const paymentMethods: PaymentMethodData[] = [
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
          supportedMethods: 'basic-card',
          data: {
            supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'],
            supportedTypes: ['credit', 'debit'],
          },
        },
      ];

      // Clone details to satisfy standard PaymentDetailsInit
      let activeDetails: PaymentDetailsInit = {
        total: {
          label: details.total.label,
          amount: details.total.amount,
        },
        displayItems: details.displayItems.map((item) => ({
          label: item.label,
          amount: item.amount,
          pending: item.pending,
        })),
        shippingOptions: details.shippingOptions?.map((opt) => ({
          id: opt.id,
          label: opt.label,
          amount: opt.amount,
          selected: opt.selected,
        })),
      };

      const nativeOptions: PaymentOptions = {
        requestPayerName: options.requestPayerName,
        requestPayerEmail: options.requestPayerEmail,
        requestPayerPhone: options.requestPayerPhone,
        requestShipping: options.requestShipping,
        shippingType: options.shippingType,
      };

      const request = new PaymentRequest(paymentMethods, activeDetails, nativeOptions);
      activePaymentRequestRef.current = request;

      // Event listener: shippingaddresschange
      request.addEventListener('shippingaddresschange', (e: Event) => {
        const addressChangeEvent = e as PaymentRequestUpdateEvent;
        const selectedAddress = request.shippingAddress;

        addLog('event', 'Native event: shippingaddresschange fired', {
          country: selectedAddress?.country,
          region: selectedAddress?.region,
          city: selectedAddress?.city,
          postalCode: selectedAddress?.postalCode,
        });

        const updated = calculateDynamicShipping(selectedAddress, details);
        activeDetails = {
          total: updated.total,
          displayItems: updated.displayItems,
          shippingOptions: updated.shippingOptions,
        };

        addressChangeEvent.updateWith(Promise.resolve(activeDetails));
      });

      // Event listener: shippingoptionchange
      request.addEventListener('shippingoptionchange', (e: Event) => {
        const optionChangeEvent = e as PaymentRequestUpdateEvent;
        const selectedOptId = request.shippingOption;

        addLog('event', 'Native event: shippingoptionchange fired', {
          selectedOptionId: selectedOptId,
        });

        const updated = calculateDynamicOptionChange(selectedOptId || '', {
          ...details,
          shippingOptions: activeDetails.shippingOptions,
        });

        activeDetails = {
          total: updated.total,
          displayItems: updated.displayItems,
          shippingOptions: updated.shippingOptions,
        };

        optionChangeEvent.updateWith(Promise.resolve(activeDetails));
      });

      // Event listener: paymentmethodchange
      request.addEventListener('paymentmethodchange', (e: Event) => {
        const methodChangeEvent = e as PaymentMethodChangeEvent;
        addLog('event', 'Native event: paymentmethodchange fired', {
          methodName: methodChangeEvent.methodName,
        });
        methodChangeEvent.updateWith(Promise.resolve(activeDetails));
      });

      setStatus('pending_user_action');
      addLog('info', 'Invoking request.show() — waiting for user authorization in browser UI');

      const response = await request.show();

      addLog('success', 'Received PaymentResponse from browser sheet', {
        methodName: response.methodName,
        payerName: response.payerName,
        payerEmail: response.payerEmail,
        payerPhone: response.payerPhone,
        shippingOption: response.shippingOption,
      });

      setStatus('processing_gateway');
      addLog('info', 'Simulating payment gateway token validation & settlement...');

      // Mock gateway settlement delay
      await new Promise((resolve) => setTimeout(resolve, 1400));

      // Complete payment
      await response.complete('success');
      setStatus('success');
      addLog('success', 'Payment complete! Called response.complete("success")');

      setLastResponse({
        methodName: response.methodName,
        details: (response.details as SimulatedPaymentResponse['details']) || {
          cardNumberMasked: '•••• •••• •••• 4242',
          cardholderName: response.payerName || 'Jane Doe',
          expiryMonth: '12',
          expiryYear: '2028',
        },
        shippingAddress: response.shippingAddress
          ? {
              recipient: response.shippingAddress.recipient,
              addressLine: Array.from(response.shippingAddress.addressLine || []),
              city: response.shippingAddress.city,
              region: response.shippingAddress.region,
              postalCode: response.shippingAddress.postalCode,
              country: response.shippingAddress.country,
              phone: response.shippingAddress.phone,
            }
          : undefined,
        shippingOption: response.shippingOption || undefined,
        payerName: response.payerName || undefined,
        payerEmail: response.payerEmail || undefined,
        payerPhone: response.payerPhone || undefined,
        requestId: response.requestId,
      });
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        setStatus('aborted');
        addLog('warn', 'User dismissed / canceled payment sheet (AbortError)');
      } else if (error.name === 'NotSupportedError') {
        setStatus('failed');
        addLog('error', 'Native PaymentRequest Not Supported in this browser context (falling back to simulator)', {
          message: error.message,
        });
        setIsSimulatorOpen(true);
      } else {
        setStatus('failed');
        addLog('error', `Payment Request Error: ${error.name}`, {
          message: error.message,
        });
        // Fallback open simulator so user can still test
        setIsSimulatorOpen(true);
      }
    }
  };

  const handleSimulatorComplete = async (
    simulatedResp: SimulatedPaymentResponse,
    shouldSucceed: boolean
  ) => {
    setIsSimulatorOpen(false);
    setStatus('processing_gateway');
    addLog('info', 'Processing simulated gateway authorization...');

    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (shouldSucceed) {
      setStatus('success');
      setLastResponse(simulatedResp);
      addLog('success', 'Simulated payment succeeded! Received valid token & credentials', simulatedResp);
    } else {
      setStatus('failed');
      addLog('error', 'Simulated payment failed: Card declined by issuing bank (Test Gateway Error)');
    }
  };

  const resetTransaction = () => {
    setStatus('idle');
    setLastResponse(null);
    setIsSimulatorOpen(false);
    addLog('info', 'Reset transaction state to idle');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return {
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
    addLog,
  };
}
