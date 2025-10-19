import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../app-routing.module';
import { EditorLayoutComponent } from './layout/editor-layout/editor-layout.component';
import { ResizeBarComponent } from './layout/resize/x/resize-bar.component';
import { ResizeVerticalComponent } from './layout/resize/y/resize-vertical.component';
import { ColorPalette1dComponent } from './sketch-pad/color-palette-1d/color-palette-1d.component';
import { ColorPaletteComponent } from './sketch-pad/color-palette/color-palette.component';
import { CompactSketchPadComponent } from './sketch-pad/compact-sketchpad/compact-sketch-pad.component';
import { DrawCanvasComponent } from './sketch-pad/draw-canvas/draw-canvas.component';
import { SketchPadComponent } from './sketch-pad/sketch-pad.component';
import { DetailsComponent } from './sketch-pad/details/details.component';
import { MementoComponent } from './sketch-pad/memento/memento.component';

window['madeby'] = () => console.log('lukas huhn');

@NgModule({
  imports: [BrowserModule, CommonModule, AppRoutingModule],
  providers: [],
  declarations: [
    ResizeBarComponent,
    ResizeVerticalComponent,
    SketchPadComponent,
    EditorLayoutComponent,
    CompactSketchPadComponent,
    ColorPalette1dComponent,
    ColorPaletteComponent,
    DrawCanvasComponent,
    DetailsComponent,
    MementoComponent,
  ],
  exports: [],
})
export class SketchpadModule {}
