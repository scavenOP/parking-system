import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SystemLogsPage } from './system-logs.page';

const routes: Routes = [
  {
    path: '',
    component: SystemLogsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SystemLogsPageRoutingModule {}