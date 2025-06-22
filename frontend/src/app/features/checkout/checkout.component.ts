import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { lastValueFrom } from 'rxjs';

import { PayPalService } from './paypal.service';
import { Cart } from '../../shared/models/cart.model';
import { CartService } from '../shopping-cart/cart.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CurrencyPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatRadioModule,
    MatStepperModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  cart: Cart | null = null;
  isLoading = true;
  isProcessing = false;
  differentShippingAddress = false;
  
  // Add your PayPal Sandbox Client ID here
  private paypalClientId = 'AcV2BSYy9njH25syBtkXtlpoujKH2xDwl9u2Kgo0PEF0fJWtCl5GiqVYNMshfHvvlTZ3SlA1uKkUENGL';

  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private paypalService = inject(PayPalService);

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    this.initializeForm();
    this.loadCart();
    this.prefillUserData();

    // Watch for payment method changes to initialize PayPal buttons
    this.checkoutForm.get('payment.paymentMethod')?.valueChanges.subscribe(method => {
      if (method === 'PAYPAL') {
        // Use a short timeout to ensure the button container is rendered in the DOM
        setTimeout(() => this.initializePayPal(), 100);
      }
    });
  }

  initializeForm(): void {
    this.checkoutForm = this.fb.group({
      contactInfo: this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
      }),
      billingAddress: this.fb.group({
        address: ['', [Validators.required, Validators.minLength(10)]],
        city: ['', Validators.required],
        postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
      }),
      shippingAddress: this.fb.group({
        sameAsBilling: [true],
        address: [''],
        city: [''],
        postalCode: ['']
      }),
      payment: this.fb.group({
        paymentMethod: ['CASH_ON_DELIVERY', Validators.required],
        orderNotes: ['']
      }),
      agreeToTerms: [false, Validators.requiredTrue]
    });

    // Watch for shipping address changes
    this.checkoutForm.get('shippingAddress.sameAsBilling')?.valueChanges.subscribe(same => {
      this.differentShippingAddress = !same;
      const shippingGroup = this.checkoutForm.get('shippingAddress');
      
      if (!same) {
        shippingGroup?.get('address')?.setValidators([Validators.required, Validators.minLength(10)]);
        shippingGroup?.get('city')?.setValidators(Validators.required);
        shippingGroup?.get('postalCode')?.setValidators([Validators.required, Validators.pattern('^[0-9]{6}$')]);
      } else {
        shippingGroup?.get('address')?.clearValidators();
        shippingGroup?.get('city')?.clearValidators();
        shippingGroup?.get('postalCode')?.clearValidators();
      }
      
      shippingGroup?.get('address')?.updateValueAndValidity();
      shippingGroup?.get('city')?.updateValueAndValidity();
      shippingGroup?.get('postalCode')?.updateValueAndValidity();
    });
  }
  
  async initializePayPal(): Promise<void> {
    if (this.checkoutForm.get('payment.paymentMethod')?.value === 'PAYPAL') {
      try {
        const paypal = await this.paypalService.loadPayPalScript(this.paypalClientId);
        
        paypal.Buttons({
          createOrder: async (data: any, actions: any) => {
            const response: any = await lastValueFrom(this.cartService.createPayPalOrder(this.cart!.totalAmount));
            return response.orderId;
          },
          onApprove: async (data: any, actions: any) => {
            const response: any = await lastValueFrom(this.cartService.capturePayPalOrder(data.orderID));
            if (response.status === 'COMPLETED') {
              this.finalizeOrder(data.orderID);
            } else {
               this.snackBar.open('Plata PayPal nu a putut fi confirmată.', 'Închide', { duration: 5000 });
            }
          },
          onError: (err: any) => {
            console.error('PayPal error:', err);
            this.snackBar.open('Eroare la procesarea plății PayPal. Încercați din nou.', 'Închide', { duration: 5000 });
          }
        }).render('#paypal-button-container');
      } catch (error) {
        console.error("Failed to load PayPal script", error);
        this.snackBar.open('Serviciul de plată PayPal nu este disponibil momentan.', 'Închide', { duration: 5000 });
      }
    }
  }

  prefillUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.checkoutForm.patchValue({
        contactInfo: {
          email: currentUser.email,
          fullName: currentUser.username
        }
      });
    }
  }

  loadCart(): void {
    this.isLoading = true;
    this.cartService.loadCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        if (!cart || cart.items.length === 0) {
          this.router.navigate(['/cart']);
          this.snackBar.open('Coșul este gol', 'OK', { duration: 3000 });
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Eroare la încărcarea coșului', 'Închide', { duration: 3000 });
        this.router.navigate(['/cart']);
      }
    });
  }

  onSubmit(): void {
    const paymentMethod = this.checkoutForm.get('payment.paymentMethod')?.value;
    
    if (paymentMethod === 'PAYPAL') {
      this.snackBar.open('Vă rugăm finalizați plata folosind butoanele PayPal.', 'OK', { duration: 4000 });
      return;
    }
    
    this.finalizeOrder();
  }
  
  finalizeOrder(paypalOrderId?: string): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.snackBar.open('Vă rugăm completați toate câmpurile obligatorii', 'OK', { duration: 3000 });
      return;
    }

    if (!this.cart || this.cart.items.length === 0) {
      this.snackBar.open('Coșul este gol', 'OK', { duration: 3000 });
      return;
    }

    this.isProcessing = true;
    const formValue = this.checkoutForm.value;
    
    const checkoutData = {
      fullName: formValue.contactInfo.fullName,
      email: formValue.contactInfo.email,
      phone: formValue.contactInfo.phone,
      billingAddress: `${formValue.billingAddress.address}, ${formValue.billingAddress.city}, ${formValue.billingAddress.postalCode}`,
      shippingAddress: formValue.shippingAddress.sameAsBilling 
        ? undefined 
        : `${formValue.shippingAddress.address}, ${formValue.shippingAddress.city}, ${formValue.shippingAddress.postalCode}`,
      paymentMethod: formValue.payment.paymentMethod,
      orderNotes: formValue.payment.orderNotes,
      agreeToTerms: formValue.agreeToTerms,
      paypalOrderId: paypalOrderId // Include PayPal order ID if available
    };

    this.cartService.checkout(checkoutData).subscribe({
      next: (order) => {
        this.isProcessing = false;
        this.snackBar.open('Comandă plasată cu succes!', 'OK', { duration: 3000 });
        this.router.navigate(['/order-success', order.id]);
      },
      error: (err) => {
        this.isProcessing = false;
        this.snackBar.open(err.error?.message || 'Eroare la plasarea comenzii', 'Închide', { duration: 5000 });
      }
    });
  }

  getErrorMessage(fieldPath: string): string {
    const control = this.checkoutForm.get(fieldPath);
    if (control?.hasError('required')) {
      return 'Acest câmp este obligatoriu';
    }
    if (control?.hasError('email')) {
      return 'Email invalid';
    }
    if (control?.hasError('pattern')) {
      if (fieldPath.includes('phone')) {
        return 'Număr de telefon invalid (10-15 cifre)';
      }
      if (fieldPath.includes('postalCode')) {
        return 'Cod poștal invalid (6 cifre)';
      }
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Minim ${minLength} caractere`;
    }
    return '';
  }
}