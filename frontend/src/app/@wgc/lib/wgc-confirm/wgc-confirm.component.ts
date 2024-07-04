import {
	Component, ViewContainerRef, ViewEncapsulation,
	TemplateRef, ChangeDetectionStrategy, HostBinding
} from '@angular/core';

export type WGCIConfirmType = 'dialog' | 'popup';

export interface WGCIConfirm {
	message: string;
	title?: string;
	config?: WGCIConfirmConfig;
}

export interface WGCIConfirmConfig {
	data?: any;
	buttonApply?: string;
	buttonDiscard?: string;
	warning?: boolean;
	warningMessage?: string;
	translate?: boolean;
	translateParams?: ObjectType;
	autoClose?: boolean;
	hasBackdrop?: boolean;
	backdropClass?: string;
	panelClass?: string;
	type?: WGCIConfirmType;
	viewContainerRef?: ViewContainerRef;
}

@Component({
	selector		: 'wgc-confirm',
	templateUrl		: './wgc-confirm.pug',
	styleUrls		: [ './wgc-confirm.scss' ],
	host			: { class: 'wgc-confirm' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCConfirmComponent {

	@HostBinding( 'class.wgc-dialog-container' )
	get classDialogContainer() { return this.config?.type === 'dialog'; }

	public message: string | TemplateRef<any>;
	public title: string;
	public close: ( answer?: boolean ) => void;
	public config: WGCIConfirmConfig = { type: 'dialog' };

	get isMessageString(): boolean { return typeof this.message === 'string'; }

}
