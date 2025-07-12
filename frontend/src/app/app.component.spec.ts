import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        // Adaugă providerii necesari pentru HttpClient și Router
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]), // Furnizează o configurație de bază pentru router
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // Test actualizat pentru a verifica titlul corect al aplicației
  it(`should have the title 'VectorPC'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('VectorPC');
  });

  // Test actualizat pentru a verifica dacă se randează toolbar-ul
  it('should render the toolbar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Caută elementul mat-toolbar, care este elementul principal al UI-ului
    expect(compiled.querySelector('mat-toolbar')).toBeTruthy();
  });
});
