import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistaComponent } from './artista.component';

import { RouterModule } from '@angular/router';

describe('ArtistaComponent', () => {
  let component: ArtistaComponent;
  let fixture: ComponentFixture<ArtistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistaComponent, RouterModule.forRoot([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
