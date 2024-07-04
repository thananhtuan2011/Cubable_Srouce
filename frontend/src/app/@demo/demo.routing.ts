import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IRouteData } from '@core';

import { EditorDemoComponent } from './editor-demo.component';
import { SpreadsheetDemoComponent } from './spreadsheet-demo.component';

const routeData: IRouteData = { cache: false };
const routes: Routes = [
	{ path: 'demo/editor', component: EditorDemoComponent, data: routeData },
	{ path: 'demo/spreadsheet', component: SpreadsheetDemoComponent, data: routeData },
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild( routes );
