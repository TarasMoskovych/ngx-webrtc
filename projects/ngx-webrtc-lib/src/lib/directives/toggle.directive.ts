import { Directive, ElementRef, HostListener, OnInit, Renderer2 } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Directive({
  selector: '[ngxToggle]'
})
export class ToggleDirective implements OnInit {
  private subscription: Subscription = new Subscription();
  private delay = 5000;

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
  }
}
