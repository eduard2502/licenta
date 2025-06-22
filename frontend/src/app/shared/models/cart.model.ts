// frontend/src/app/shared/models/cart.model.ts
export interface Cart {
  id?: number;
  items: CartItem[];
  totalAmount: number;
  lastUpdated?: string;
  totalItems: number;
}

export interface CartItem {
  id?: number;
  productId: number;
  productName: string;
  productDescription?: string;
  productPrice: number;
  productStock: number;
  productImageBase64?: string;
  quantity: number;
  subtotal: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CheckoutRequest {
  fullName: string;
  email: string;
  phone: string;
  billingAddress: string;
  shippingAddress?: string;
  paymentMethod: 'CARD' | 'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'PAYPAL';
  paypalOrderId?: string; 
  orderNotes?: string;
  agreeToTerms: boolean;
}