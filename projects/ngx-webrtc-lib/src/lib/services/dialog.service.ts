import { ApplicationRef, ComponentFactoryResolver, DOCUMENT, EmbeddedViewRef, inject, Injectable, Injector, Type } from '@angular/core';
import { delay, take } from 'rxjs/operators';
import { DialogComponent } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly componentFactoryResolver = inject(ComponentFactoryResolver);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly wrapperSelector = 'ngx-webrtc-wrapper';

  open(component: Type<any>, data: any = {}): DialogComponent {
    return this.appendComponent(component, data);
  }

  private appendComponent(component: Type<any>, data: any): DialogComponent {
    // 1. Create a component reference from the component
    const componentRef = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this.injector);

    const { instance } = componentRef;

    // Set inputs
    Object.keys(data).forEach((key: string) => instance[key] = data[key]);

    // 2. Attach incoming component to the appRef so that it's inside the ng component tree
    this.appRef.attachView(componentRef.hostView);

    // 3. Get DOM element from component
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
      .rootNodes[0] as HTMLElement;

    // 4. Append DOM element to the container
    this.getContainer().append(domElem);

    // 5. Destroy after fade out
    (instance as DialogComponent).afterClosed
      .pipe(
        take(1),
        delay(250),
      )
      .subscribe(() => {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
      });

    return instance as DialogComponent;
  }

  private getContainer(): HTMLElement {
    let container: HTMLElement = this.document.querySelector(`.${this.wrapperSelector}`) as HTMLElement;

    if (!container) {
      container = this.document.createElement('div');
      container.setAttribute('class', this.wrapperSelector);
      container.setAttribute('style', 'position: fixed; top: 0; width: 100%; z-index: 1;');
      this.document.body.appendChild(container);
    }

    return container;
  }
}
