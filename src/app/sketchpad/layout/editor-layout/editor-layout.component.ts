import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-editor-layout',
  templateUrl: './editor-layout.component.html',
  styleUrls: ['./editor-layout.component.scss'],
})
export class EditorLayoutComponent {
  @Input()
  sidebarWidth = 600;

  @Input()
  sidebarHeight = 290;
}
