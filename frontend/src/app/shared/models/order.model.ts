// src/app/shared/models/order.model.ts
import { OrderItem } from './order-item.model'; // <<< CORECTAT: Importă OrderItem

/**
 * Interfață pentru reprezentarea unei comenzi,
 * aliniată cu OrderDto din backend.
 */
export interface Order {
  id?: number;
  userId?: number;
  username?: string;
  orderDate?: string;
  status: string;
  totalAmount?: number;
  customerName: string;
  shippingAddress: string;
  customerEmail: string;
  customerPhone: string;
  orderItems: OrderItem[]; // Acum OrderItem este cunoscut
}
