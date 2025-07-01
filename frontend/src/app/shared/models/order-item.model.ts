// src/app/shared/models/order-item.model.ts

export interface OrderItem {
  id?: number;
  productId: number;
  productNameSnapshot?: string;         // Corect
  productImageBase64Snapshot?: string;  // Corect
  quantity: number;
  priceAtPurchase?: number;
  lineTotal?: number;
}