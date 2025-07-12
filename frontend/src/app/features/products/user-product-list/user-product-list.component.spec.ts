import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { UserProductListComponent } from './user-product-list.component';

describe('UserProductListComponent', () => {
  let component: UserProductListComponent;
  let fixture: ComponentFixture<UserProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProductListComponent],
      providers: [
        // Adaugă providerii necesari pentru HttpClient și Router
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});