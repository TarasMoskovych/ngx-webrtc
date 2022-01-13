import { animate, style, transition, trigger } from '@angular/animations';

const STATES = {
  HIDDEN: {
    opacity: 0,
    'margin-top': '100%',
  },
  SHOWN: {
    opacity: 1,
    'margin-top': 0,
  },
};

export const fadeAnimation = trigger('fade', [
  transition(':enter', [
    style(STATES.HIDDEN),
    animate('250ms ease-in-out', style(STATES.SHOWN)),
  ]),
  transition(':leave', [
    style(STATES.SHOWN),
    animate('250ms ease-in-out', style(STATES.HIDDEN)),
  ]),
]);
