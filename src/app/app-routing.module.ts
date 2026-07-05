import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SketchPadComponent } from './sketchpad/sketch-pad/sketch-pad.component';
import { HeartbeatComponent } from './heartbeat/heartbeat/heartbeat.component';

const routes: Routes = [
  {
    path: '',
    component: SketchPadComponent,
  },
  {
    path: 'heartbeat',
    component: HeartbeatComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
