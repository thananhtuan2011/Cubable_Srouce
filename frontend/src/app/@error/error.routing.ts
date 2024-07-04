import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IRouteData } from '@core';

import { ErrorComponent, MaintenanceComponent } from './components';

const routeData: IRouteData = { cache: false };
const routes: Routes = [
	{ path: '500', component: ErrorComponent, data: routeData },
	{ path: '404', component: ErrorComponent, data: routeData },
	{ path: '403', component: ErrorComponent, data: routeData },
	{ path: '400', component: ErrorComponent, data: routeData },
	{ path: 'maintenance', component: MaintenanceComponent, data: routeData },
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild( routes );
