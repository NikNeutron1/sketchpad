import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SketchpadModule } from './sketchpad/sketchpad.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, SketchpadModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
