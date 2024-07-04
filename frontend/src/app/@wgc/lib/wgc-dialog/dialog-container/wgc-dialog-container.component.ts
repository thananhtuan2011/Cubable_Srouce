import {
	Component, ViewEncapsulation, ViewChild,
	ComponentRef, EmbeddedViewRef, ViewContainerRef,
	ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { ComponentPortal, TemplatePortal, CdkPortalOutlet, BasePortalOutlet } from '@angular/cdk/portal';

export type WGCIDialogPagerType = 'previous' | 'next';

@Component({
	selector		: 'wgc-dialog-container',
	templateUrl		: './wgc-dialog-container.pug',
	styleUrls		: [ './wgc-dialog-container.scss' ],
	host			: { class: 'wgc-dialog-container' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCDialogContainerComponent extends BasePortalOutlet {

	@ViewChild( CdkPortalOutlet, { static: true } ) public portalOutlet: CdkPortalOutlet;

	public isFreezing: boolean;
	public isFullscreen: boolean;
	public isPreviousPagerDisplayed: boolean;
	public isPreviousPagerDisabled: boolean;
	public isNextPagerDisplayed: boolean;
	public isNextPagerDisabled: boolean;
	public close: ( data?: any ) => void;
	public freeze: () => void;
	public unfreeze: () => void;
	public fullscreen: () => void;
	public exitFullscreen: () => void;
	public pagerClick: ( type: WGCIDialogPagerType ) => void;

	/**
	 * @constructor
	 * @param {ViewContainerRef} viewContainerRef
	 * @param {ChangeDetectorRef} _cdRef
	 */
	constructor( public viewContainerRef: ViewContainerRef, private _cdRef: ChangeDetectorRef ) {
		super();
	}

	/**
	 * @param {ComponentPortal} portal
	 * @return {ComponentRef}
	 */
	public attachComponentPortal( portal: ComponentPortal<any> ): ComponentRef<any> {
		return this.portalOutlet.attachComponentPortal( portal );
	}

	/**
	 * @param {TemplatePortal} portal
	 * @return {EmbeddedViewRef}
	 */
	public attachTemplatePortal( portal: TemplatePortal<any> ): EmbeddedViewRef<any> {
		return this.portalOutlet.attachTemplatePortal( portal );
	}

	/**
	 * @param {WGCIDialogPagerType} type
	 * @return {void}
	 */
	public enablePager( type?: WGCIDialogPagerType ) {
		switch ( type ) {
			case 'previous':
				this.isPreviousPagerDisabled = false;
				break;
			case 'next':
				this.isNextPagerDisabled = false;
				break;
			default:
				this.isPreviousPagerDisabled = this.isNextPagerDisabled = false;
		}

		this._cdRef.markForCheck();
	}

	/**
	 * @param {WGCIDialogPagerType} type
	 * @return {void}
	 */
	public disablePager( type?: WGCIDialogPagerType ) {
		switch ( type ) {
			case 'previous':
				this.isPreviousPagerDisabled = true;
				break;
			case 'next':
				this.isNextPagerDisabled = true;
				break;
			default:
				this.isPreviousPagerDisabled = this.isNextPagerDisabled = true;
		}

		this._cdRef.markForCheck();
	}

	/**
	 * @param {WGCIDialogPagerType} type
	 * @return {void}
	 */
	public showPager( type?: WGCIDialogPagerType ) {
		switch ( type ) {
			case 'previous':
				this.isPreviousPagerDisplayed = true;
				break;
			case 'next':
				this.isNextPagerDisplayed = true;
				break;
			default:
				this.isPreviousPagerDisplayed = this.isNextPagerDisplayed = true;
		}

		this._cdRef.markForCheck();
	}

	/**
	 * @param {WGCIDialogPagerType} type
	 * @return {void}
	 */
	public hidePager( type?: WGCIDialogPagerType ) {
		switch ( type ) {
			case 'previous':
				this.isPreviousPagerDisplayed = false;
				break;
			case 'next':
				this.isNextPagerDisplayed = false;
				break;
			default:
				this.isPreviousPagerDisplayed = this.isNextPagerDisplayed = false;
		}

		this._cdRef.markForCheck();
	}

}
