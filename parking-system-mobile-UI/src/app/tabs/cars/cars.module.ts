import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CarsPageRoutingModule } from './cars-routing.module';
import { CarsPage } from './cars.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, CarsPageRoutingModule, CarsPage]
})
export class CarsPageModule {}