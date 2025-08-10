import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { SignupComponent } from './signup/signup';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { CarsComponent } from './cars/cars';
import { ParkingSearchComponent } from './parking-search/parking-search';
import { ReservationsComponent } from './reservations/reservations';
import { BookingSummaryComponent } from './booking-summary/booking-summary';
import { QrScannerComponent } from './qr-scanner/qr-scanner';
import { LogsViewerComponent } from './logs-viewer/logs-viewer';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { UserGuard } from './guards/user.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'cars', component: CarsComponent, canActivate: [UserGuard] },
  { path: 'parking-search', component: ParkingSearchComponent, canActivate: [UserGuard] },
  { path: 'reservations', component: ReservationsComponent, canActivate: [AuthGuard] },
  { path: 'booking-summary', component: BookingSummaryComponent, canActivate: [AuthGuard] },
  { path: 'qr-scanner', component: QrScannerComponent },
  { path: 'logs', component: LogsViewerComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AdminGuard] }
];
