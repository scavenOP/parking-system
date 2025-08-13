import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SystemLogsPageRoutingModule } from './system-logs-routing.module';
import { SystemLogsPage } from './system-logs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SystemLogsPageRoutingModule
  ],
  declarations: [SystemLogsPage]
})
export class SystemLogsPageModule {}