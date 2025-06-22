import { Injectable } from '@angular/core';
import { loadScript } from '@paypal/paypal-js';

@Injectable({
  providedIn: 'root'
})
export class PayPalService {
  private paypalLoaded = false;

  async loadPayPalScript(clientId: string): Promise<any> {
    if (!this.paypalLoaded) {
      const paypal = await loadScript({
        clientId: clientId,
        currency: 'USD', // Change to RON if supported
        intent: 'capture'
      });
      this.paypalLoaded = true;
      return paypal;
    }
    return (window as any).paypal;
  }
}