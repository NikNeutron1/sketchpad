import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SketchPadComponent } from './sketchpad/sketch-pad/sketch-pad.component';

const routes: Routes = [
  {
    path: '',
    component: SketchPadComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
