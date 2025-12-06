import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KolesaComponent } from './kolesa.component';

describe('KolesaComponent', () => {
  let component: KolesaComponent;
  let fixture: ComponentFixture<KolesaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KolesaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KolesaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
