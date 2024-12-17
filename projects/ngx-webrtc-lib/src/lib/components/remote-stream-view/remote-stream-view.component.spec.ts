import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteStreamViewComponent } from './remote-stream-view.component';

describe('RemoteStreamViewComponent', () => {
  let component: RemoteStreamViewComponent;
  let fixture: ComponentFixture<RemoteStreamViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteStreamViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteStreamViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
