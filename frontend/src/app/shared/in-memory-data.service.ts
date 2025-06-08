// src/app/shared/in-memory-data.service.ts
import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo } from 'angular-in-memory-web-api';
import { Observable } from 'rxjs';
import { Product } from './models/product.model'; // Asigură-te că modelul Product e corect
// Importă și alte modele dacă vrei să le mock-uiești (Category, etc.)

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {
  createDb(reqInfo?: RequestInfo): {} | Observable<{}> | Promise<{}> {
    const products: Product[] = [
      // Date mock pentru produse (folosește modelul Product actualizat)
      {
        id: 1,
        name: 'Laptop Gaming X1',
        description: 'Un laptop puternic pentru jocuri și sarcini intensive.',
        price: 5500.99,
        stockQuantity: 15,
        categoryId: 1, // Presupunând că există o categorie cu ID 1
        categoryName: 'Laptopuri',
        imageBase64: null, // Sau un string base64 valid
        specifications: [
          { definitionId: 1, name: 'Procesor', value: 'Intel Core i7-12700H', unit: '' },
          { definitionId: 2, name: 'RAM', value: '16', unit: 'GB' },
          { definitionId: 3, name: 'Stocare SSD', value: '1', unit: 'TB' }
        ]
      },
      {
        id: 2,
        name: 'Monitor LED UltraWide',
        description: 'Monitor curbat pentru o experiență vizuală imersivă.',
        price: 1800.00,
        stockQuantity: 25,
        categoryId: 2, // Presupunând că există o categorie cu ID 2
        categoryName: 'Monitoare',
        imageBase64: null,
        specifications: [
          { definitionId: 4, name: 'Diagonală', value: '34', unit: 'inch' },
          { definitionId: 5, name: 'Rezoluție', value: '3440x1440', unit: 'pixeli' }
        ]
      },
      // Adaugă mai multe produse mock aici
    ];

    const categories = [
        { id: 1, name: 'Laptopuri', description: 'Portabile performante'},
        { id: 2, name: 'Monitoare', description: 'Display-uri pentru PC'},
        { id: 3, name: 'Componente PC', description: 'Piese pentru asamblare PC'}
    ];

    const specificationDefinitions = [
        {id: 1, name: 'Procesor', unit: ''},
        {id: 2, name: 'RAM', unit: 'GB'},
        {id: 3, name: 'Stocare SSD', unit: 'TB'},
        {id: 4, name: 'Diagonală', unit: 'inch'},
        {id: 5, name: 'Rezoluție', unit: 'pixeli'},
        {id: 6, name: 'Tip Placă Video', unit: ''},
    ];


    // Returnează un obiect cu colecțiile tale. Numele proprietăților
    // (ex: 'products') vor fi folosite ca segmente de URL pentru API-ul mock.
    return { products, categories, specificationDefinitions /* , alteColecții */ };
  }

  // Suprascrie genId pentru a te asigura că un produs nou primește un ID.
  // Dacă colecția este goală, această metodă returnează numărul inițial (11).
  // Dacă colecția nu este goală, metoda returnează cel mai mare ID + 1.
  genId<T extends { id?: number }>(collection: T[], collectionName: string): number {
    // Verifică dacă `id` este definit și este un număr pentru fiecare element
    const validIds = collection.map(item => item.id).filter(id => typeof id === 'number') as number[];
    return validIds.length > 0 ? Math.max(...validIds) + 1 : 1;
  }
}
