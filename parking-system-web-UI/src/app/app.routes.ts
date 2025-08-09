import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { SignupComponent } from './signup/signup';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { CarsComponent } from './cars/cars';
import { ParkingSearchComponent } from './parking-search/parking-search';
import { ReservationsComponent } from './reservations/reservations';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'cars', component: CarsComponent, canActivate: [AuthGuard] },
  { path: 'parking-search', component: ParkingSearchComponent, canActivate: [AuthGuard] },
  { path: 'reservations', component: ReservationsComponent, canActivate: [AuthGuard] }
];
