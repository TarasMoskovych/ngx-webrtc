import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserStateComponent } from './user-state.component';

describe('UserStateComponent', () => {
  let component: UserStateComponent;
  let fixture: ComponentFixture<UserStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
