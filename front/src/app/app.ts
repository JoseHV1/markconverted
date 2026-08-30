import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouteLoaderComponent } from './shared/components/route-loader/route-loader.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouteLoaderComponent],
  template: `
<app-route-loader />
<router-outlet />
  `,
  styles: [],
})
export class App {}
