import { Routes } from '@angular/router';
import { ConferenceComponent, HomeComponent } from './components';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'conference',
    component: ConferenceComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
