export type PaymentCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
  description: string;
}

export interface CustomPaymentDetailsInit {
  total: {
    label: string;
    amount: {
      currency: string;
      value: string;
    };
  };
  displayItems: Array<{
    label: string;
    amount: {
      currency: string;
      value: string;
    };
    pending?: boolean;
  }>;
  shippingOptions?: Array<{
    id: string;
    label: string;
    amount: {
      currency: string;
      value: string;
    };
    selected?: boolean;
    detail?: string;
  }>;
  modifiers?: Array<{
    supportedMethods: string;
    total?: {
      label: string;
      amount: {
        currency: string;
        value: string;
      };
    };
    additionalDisplayItems?: Array<{
      label: string;
      amount: {
        currency: string;
        value: string;
      };
    }>;
  }>;
}

export interface CustomPaymentOptions {
  requestPayerName: boolean;
  requestPayerEmail: boolean;
  requestPayerPhone: boolean;
  requestShipping: boolean;
  shippingType: 'shipping' | 'delivery' | 'pickup';
}

export interface PaymentDiagnostics {
  isSupported: boolean;
  isSecureContext: boolean;
  canMakePayment: boolean | null;
  hasEnrolledInstrument: boolean | null;
  supportsGooglePay: boolean;
  supportsApplePay: boolean;
  supportsBasicCard: boolean;
  browserName: string;
  checkedAt: string;
}

export interface PaymentLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'event';
  title: string;
  details?: Record<string, unknown> | string;
}

export interface SimulatedPaymentResponse {
  methodName: string;
  details: {
    cardNumberMasked?: string;
    cardholderName?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cardSecurityCode?: string;
    tokenizationData?: {
      token: string;
      type: string;
    };
    billingAddress?: {
      addressLine: string[];
      city: string;
      country: string;
      postalCode: string;
      recipient: string;
    };
  };
  shippingAddress?: {
    recipient: string;
    addressLine: string[];
    city: string;
    region: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  shippingOption?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  requestId: string;
}

export type TransactionStatus =
  | 'idle'
  | 'initializing'
  | 'pending_user_action'
  | 'processing_gateway'
  | 'success'
  | 'failed'
  | 'aborted';
