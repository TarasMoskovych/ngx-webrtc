import { Directive, ElementRef, EventEmitter, HostListener, OnInit, Output, Renderer2 } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Directive({
  selector: '[ngxToggle]',
  standalone: true,
})
export class ToggleDirective implements OnInit {
  private subscription: Subscription = new Subscription();
  private delay = 5000;

  @Output() toggleVisibility = new EventEmitter<boolean>();

  @HostListener('mouseenter') onEnter(): void {
    this.subscription.unsubscribe();
    this.setStyle(1);
   }

  @HostListener('mouseleave') onLeave(): void {
    this.hide();
  }

  constructor(private renderer: Renderer2, private el: ElementRef) { }

  ngOnInit(): void {
    this.hide();
  }

  hide(): void {
    this.subscription.unsubscribe();
    this.subscription = interval(this.delay)
      .pipe(take(1))
      .subscribe(() => this.setStyle(0));
  }

  setStyle(opacity: number): void {
    this.renderer.setStyle(this.el.nativeElement, 'opacity', opacity);
    this.toggleVisibility.emit(opacity === 1);
  }
}
