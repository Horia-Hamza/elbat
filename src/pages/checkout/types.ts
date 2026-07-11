import type { ShippingZone } from '../../api/shippingZones';

export interface SelectedPajama {
  pajamaId: string;
  color: string;
  colorHex: string;
  size: string;
  image: string;
  name: string;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  notes: string;
}

export type PaymentMethod = 'cod' | 'online';

export interface AccountDetails {
  email: string;
  password: string;
}

export interface CheckoutState {
  selectedPajamas: (SelectedPajama | null)[];
  currentStep: number;
  customerDetails: CustomerDetails;
  selectedZone: ShippingZone | null;
  paymentMethod: PaymentMethod;
}
