import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IRouteData } from '@core';

import { GuidelineComponent } from './guideline.component';

const routeData: IRouteData = { cache: false };
const routes: Routes = [
	{ path: 'guideline', component: GuidelineComponent, data: routeData },
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild( routes );
