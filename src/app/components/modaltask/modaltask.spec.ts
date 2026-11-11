import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Modaltask } from './modaltask';

describe('Modaltask', () => {
  let component: Modaltask;
  let fixture: ComponentFixture<Modaltask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modaltask],
    }).compileComponents();

    fixture = TestBed.createComponent(Modaltask);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
