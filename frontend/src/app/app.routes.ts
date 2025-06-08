// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { UserDashboardComponent } from './features/user-dashboard/user-dashboard.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';

import { AdminCategoryListComponent } from './features/admin/admin-categories/admin-category-list/admin-category-list.component';
import { AdminCategoryFormComponent } from './features/admin/admin-categories/admin-category-form/admin-category-form.component';
import { AdminOrderListComponent } from './features/admin/admin-orders/admin-order-list/admin-order-list.component';
import { AdminOrderDetailComponent } from './features/admin/admin-orders/admin-order-detail/admin-order-detail.component';
import { AdminSpecDefListComponent } from './features/admin/admin-specifications/admin-spec-def-list/admin-spec-def-list.component';
import { AdminSpecDefFormComponent } from './features/admin/admin-specifications/admin-spec-def-form/admin-spec-def-form.component';
import { AdminUserListComponent } from './features/admin/admin-users/admin-user-list/admin-user-list.component';
import { AdminUserFormComponent } from './features/admin/admin-users/admin-user-form/admin-user-form.component';

import { ProductListComponent }    from './features/products/product-list/product-list.component';
import { ProductFormComponent }    from './features/products/product-form/product-form.component';
import { ProductDetailComponent }  from './features/products/product-detail/product-detail.component';

import { UserOrderHistoryComponent } from './features/user-dashboard/user-order-history/user-order-history.component';

// Importă guard-urile funcționale corect
import { authGuard }   from './auth/auth.guard';      // <<< CORECTAT
import { userGuard }   from './auth/user.guard';      // <<< CORECTAT
import { adminGuard }  from './auth/admin.guard';     // <<< CORECTAT

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Autentificare' },
  {
    path: 'user',
    component: UserDashboardComponent,
    canActivate: [authGuard, userGuard], // <<< CORECTAT
    title: 'Contul Meu',
    children: [
      { path: '', redirectTo: 'dashboard-overview', pathMatch: 'full' },
      { path: 'dashboard-overview', component: UserDashboardComponent, title: 'Sumar Cont'},
      { path: 'orders', component: UserOrderHistoryComponent, title: 'Istoric Comenzi' },
    ]
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard, adminGuard], // <<< CORECTAT
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        path: 'products',
        children: [
          { path: '', component: ProductListComponent, title: 'Administrare Produse' },
          { path: 'new', component: ProductFormComponent, title: 'Adaugă Produs' },
          { path: 'edit/:id', component: ProductFormComponent, title: 'Editează Produs' },
        ]
      },
      {
        path: 'categories',
        children: [
          { path: '', component: AdminCategoryListComponent, title: 'Administrare Categorii' },
          { path: 'new', component: AdminCategoryFormComponent, title: 'Adaugă Categorie' },
          { path: 'edit/:id', component: AdminCategoryFormComponent, title: 'Editează Categorie' },
        ]
      },
      {
        path: 'orders',
        children: [
          { path: '', component: AdminOrderListComponent, title: 'Administrare Comenzi' },
          { path: ':id', component: AdminOrderDetailComponent, title: 'Detalii Comandă Admin' },
        ]
      },
      {
        path: 'specification-definitions',
        children: [
          { path: '', component: AdminSpecDefListComponent, title: 'Administrare Def. Specificații' },
          { path: 'new', component: AdminSpecDefFormComponent, title: 'Adaugă Def. Specificație' },
          { path: 'edit/:id', component: AdminSpecDefFormComponent, title: 'Editează Def. Specificație' },
        ]
      },
      {
        path: 'users',
        children: [
          { path: '', component: AdminUserListComponent, title: 'Administrare Utilizatori' },
          { path: 'edit/:id', component: AdminUserFormComponent, title: 'Editează Utilizator' },
        ]
      },
    ]
  },
  { path: 'products', component: ProductListComponent, title: 'Catalog Produse' }, // Consideră o componentă PublicProductListComponent
  { path: 'products/:id', component: ProductDetailComponent, title: 'Detalii Produs' },
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: '**', redirectTo: '/products' }
];
