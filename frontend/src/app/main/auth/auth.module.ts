import {
	NgModule
} from '@angular/core';
import {
	PlatformModule
} from '@angular/cdk/platform';
import {
	MSAL_INSTANCE,
	MsalModule,
	MsalService
} from '@azure/msal-angular';
import {
	PublicClientApplication
} from '@azure/msal-browser';

import {
	ENVIRONMENT
} from '@environments/environment';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBChipModule
} from '@cub/material/chip';
import {
	CUBDividerModule
} from '@cub/material/divider';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBLoadingModule
} from '@cub/material/loading';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';
import {
	CUBButtonToggleModule
} from '@cub/material/button-toggle';
import {
	CUBToastModule
} from '@cub/material/toast';
import {
	CUBTooltipModule
} from '@cub/material/tooltip';
import {
	CUBSliderModule
} from '@cub/material/slider';
import {
	CUBPalettePipe
} from '@cub/pipes';

// TEMP
import { WGCAvatarModule } from '@wgc/wgc-avatar';
import { WGCButtonModule } from '@wgc/wgc-button';
import { WGCFormFieldModule } from '@wgc/lib/wgc-form-field';
import { WGCLoadingModule } from '@wgc/wgc-loading';
import { WGCButtonToggleModule } from '@wgc/wgc-button-toggle';
import { WGCClipboardCopyModule } from '@wgc/wgc-clipboard-copy';
import { WGCDividerModule } from '@wgc/wgc-divider';
import { WGCIconModule } from '@wgc/wgc-icon';
import { WGCTableModule } from '@wgc/wgc-table';
import { WGCTooltipModule } from '@wgc/wgc-tooltip';
import { WGCTruncateModule } from '@wgc/wgc-truncate';
import { WGCScrollBarModule } from '@wgc/wgc-scroll-bar';
import { WGCDropdownModule } from '@wgc/wgc-dropdown';

import {
	CommonModule
} from './modules/common/common.module';
import {
	AuthRoutingModule
} from './auth-routing.module';
import {
	ResetPasswordComponent,
	SignInComponent,
	SignUpComponent,
	VerifyIdentityComponent,
	InvitationComponent,
	GeneralInfoComponent
} from './components';

@NgModule({
	imports: [
		PlatformModule,

		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'AUTH',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		// TEMP
		WGCButtonModule, WGCFormFieldModule, WGCLoadingModule,
		WGCTooltipModule, WGCButtonToggleModule, WGCTableModule,
		WGCIconModule, WGCAvatarModule, WGCClipboardCopyModule,
		WGCTruncateModule, WGCScrollBarModule, WGCDividerModule,
		WGCDropdownModule,

		CUBButtonModule,
		CUBFormFieldModule,
		CUBLoadingModule,
		CUBDividerModule,
		CUBButtonToggleModule,
		CUBIconModule,
		CUBChipModule,
		CUBScrollBarModule,
		CUBToastModule,
		CUBTooltipModule,
		CUBSliderModule,
		CUBPalettePipe,

		CommonModule,

		MsalModule,

		AuthRoutingModule,
	],
	exports: [
		SignUpComponent,
		ResetPasswordComponent,
		VerifyIdentityComponent,
		SignInComponent,
		InvitationComponent,
		GeneralInfoComponent,
	],
	declarations: [
		SignUpComponent,
		ResetPasswordComponent,
		VerifyIdentityComponent,
		SignInComponent,
		InvitationComponent,
		GeneralInfoComponent,
	],
	providers: [
		{
			provide: MSAL_INSTANCE,
			useFactory: () => {
				return new PublicClientApplication({
					auth: {
						clientId: ENVIRONMENT.MICROSOFT_CLIENT_ID,
						redirectUri: ENVIRONMENT.APP_URL,
					},
				});
			},
		},
		MsalService,
	],
})
export class AuthModule {}
