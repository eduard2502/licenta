import { Routes } from '@angular/router';

// Componenta noua pentru pagina principala
import { HomePageComponent } from './features/home/home-page/home-page.component';

// Componente pentru autentificare si dashboard-uri
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';

// Componente publice
import { ProductListComponent } from './features/products/product-list/product-list.component';
import { ProductDetailComponent } from './features/products/product-detail/product-detail.component';

// Componente pentru sectiuni specifice (Admin & User)
import { AdminCategoryListComponent } from './features/admin/admin-categories/admin-category-list/admin-category-list.component';
import { AdminCategoryFormComponent } from './features/admin/admin-categories/admin-category-form/admin-category-form.component';
import { AdminOrderListComponent } from './features/admin/admin-orders/admin-order-list/admin-order-list.component';
import { AdminOrderDetailComponent } from './features/admin/admin-orders/admin-order-detail/admin-order-detail.component';
import { AdminSpecDefListComponent } from './features/admin/admin-specifications/admin-spec-def-list/admin-spec-def-list.component';
import { AdminSpecDefFormComponent } from './features/admin/admin-specifications/admin-spec-def-form/admin-spec-def-form.component';
import { AdminUserListComponent } from './features/admin/admin-users/admin-user-list/admin-user-list.component';
import { AdminUserFormComponent } from './features/admin/admin-users/admin-user-form/admin-user-form.component';
import { ProductFormComponent } from './features/products/product-form/product-form.component';
import { UserOrderHistoryComponent } from './features/user-dashboard/user-order-history/user-order-history.component';
import { SignupComponent } from './signup/signup.component';
import { ReportsComponent } from './features/admin/reports/reports.component';


// Guards pentru securizarea rutelor
import { userGuard } from './auth/user.guard';
import { adminGuard } from './auth/admin.guard';

import { ShoppingCartComponent } from './features/shopping-cart/shopping-cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { UserProductListComponent } from './features/products/user-product-list/user-product-list.component';
import { UserProfileComponent } from './features/user-profile/user-profile.component';

export const routes: Routes = [
  // Pagina principala (default), publica
  { path: '', component: HomePageComponent, title: 'VectorPC' },

  // Ruta de autentificare
  { path: 'login', component: LoginComponent, title: 'Autentificare' },
  
  // Rutele de detalii produs și catalog rămân publice
  { path: 'products-list', component: UserProductListComponent, title: 'Catalog Produse' }, // Ruta pentru tabelul vechi
  { path: 'products/:id', component: ProductDetailComponent, title: 'Detalii Produs' },

   // Ruta pentru coșul de cumpărături
  { path: 'cart', component: ShoppingCartComponent, canActivate: [userGuard], title: 'Coș de Cumpărături' },
  // Ruta pentru finalizarea comenzii
  { path: 'checkout', component: CheckoutComponent, canActivate: [userGuard], title: 'Finalizare Comandă' },
  
  // Rute protejate pentru Utilizator (fără un dashboard-wrapper)
  { path: 'my-orders', component: UserOrderHistoryComponent, canActivate: [userGuard], title: 'Comenzile Mele' },
  // { path: 'my-profile', component: UserProfileComponent, canActivate: [userGuard], title: 'Profilul Meu' },
  { path: 'signup', component: SignupComponent, title: 'Înregistrare' },
 { path: 'my-profile', component: UserProfileComponent, canActivate: [userGuard], title: 'Profilul Meu' },

  // Rute protejate pentru Administrator
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', children: [
          { path: '', component: ProductListComponent, title: 'Administrare Produse' },
          { path: 'new', component: ProductFormComponent, title: 'Adaugă Produs' },
          { path: 'edit/:id', component: ProductFormComponent, title: 'Editează Produs' },
      ]},
      { path: 'categories', children: [
          { path: '', component: AdminCategoryListComponent, title: 'Administrare Categorii' },
          { path: 'new', component: AdminCategoryFormComponent, title: 'Adaugă Categorie' },
          { path: 'edit/:id', component: AdminCategoryFormComponent, title: 'Editează Categorie' },
      ]},
      { path: 'orders', children: [
          { path: '', component: AdminOrderListComponent, title: 'Administrare Comenzi' },
          { path: ':id', component: AdminOrderDetailComponent, title: 'Detalii Comandă' },
      ]},
      { path: 'specification-definitions', children: [
          { path: '', component: AdminSpecDefListComponent, title: 'Definiții Specificații' },
          { path: 'new', component: AdminSpecDefFormComponent, title: 'Adaugă Definiție' },
          { path: 'edit/:id', component: AdminSpecDefFormComponent, title: 'Editează Definiție' },
      ]},
      { path: 'users', children: [
          { path: '', component: AdminUserListComponent, title: 'Administrare Utilizatori' },
          { path: 'edit/:id', component: AdminUserFormComponent, title: 'Editează Utilizator' },
      ]},
       { path: 'reports', component: ReportsComponent, title: 'Rapoarte' },
    ]
  },

  // Orice altceva redirecționează la pagina principală
  { path: '**', redirectTo: '', pathMatch: 'full' }
];