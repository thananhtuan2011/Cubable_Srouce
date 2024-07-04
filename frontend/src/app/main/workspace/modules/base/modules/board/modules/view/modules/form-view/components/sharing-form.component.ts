import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Inject,
	OnInit,
	Optional,
	inject
} from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBMenuRef,
	CUB_MENU_CONTEXT,
	CUB_MENU_REF
} from '@cub/material/menu';

import { SharingType } from '../../../resources/constant';
import { ViewService } from '../../../services/view.service';

import {
	FormView,
	FormViewPublic
} from '../interfaces/form-view.interface';
import {
	FormViewService
} from '../services/form-view.service';

export type SharingFormMenuContext = {
	hasIFrame: boolean;
	form: FormView;
};

@Unsubscriber()
@Component({
	selector		: 'sharing-form',
	templateUrl		: '../templates/sharing-form.pug',
	styleUrls		: [ '../styles/sharing-form.scss' ],
	host			: { class: 'sharing-form' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class SharingFormComponent
implements OnInit {

	protected readonly sharingType: typeof SharingType
		= SharingType;
	protected readonly formViewService: FormViewService
		= inject( FormViewService );

	protected hasIFrame: boolean;
	protected publicLink: string;
	protected form: FormView;

	private readonly _viewService: ViewService
		= inject( ViewService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	private _qrCodeDownloadLink: SafeUrl;

	get publicIframe(): string {
		if ( !this.form ) return '';

		return '<iframe height="500" width="500" allowfullscreen="false"'
			+ ` src="${this.publicLink}"`
			+ ` name="${this.form.name}"`
			+ ` title="${this.form.name}">`
			+ '</iframe>';
	}

	/**
	 * @constructor
	 * @param {CUBMenuRef} menuRef
	 * @param {FieldMenuContext} menuContext
	 */
	constructor(
		@Optional() @Inject( CUB_MENU_REF )
		protected menuRef: CUBMenuRef,
		@Optional() @Inject( CUB_MENU_CONTEXT )
		protected menuContext: SharingFormMenuContext
	) {
		this.form = menuContext.form;
		this.hasIFrame = menuContext.hasIFrame;
	}

	ngOnInit() {
		this._getPublicLink();
	}

	/**
	 * @param {boolean} e
	 * @return {void}
	 */
	protected onSharingPrivateChange( e: boolean ) {
		const sharingStatusBk: SharingType = this.form.sharingStatus;

		this.form.sharingStatus = e
			? SharingType.ACCESSIBLE_ALL
			: SharingType.MANAGEABLE_ONLY;

		this._viewService
		.share( this.form.id, this.form.sharingStatus )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			error: () => {
				this.form.sharingStatus = sharingStatusBk;

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected onSharingPublicChange() {
		this.formViewService
		.setPublic(
			this.form.id,
			this.form.isPublic
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( data: { publicLink: string } ) => {
				this.publicLink = data.publicLink;

				this._cdRef.markForCheck();
			},
			error: () => {
				this.form.isPublic = !this.form.isPublic;

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {SafeUrl} url
	 * @return {void}
	 */
	protected onChangeQRUrl( url: SafeUrl ) {
		this._qrCodeDownloadLink = url;
	}

	/**
	 * @return {void}
	 */
	protected downloadQR() {
		fetch(
			( this._qrCodeDownloadLink as any )
			.changingThisBreaksApplicationSecurity
		)
		.then( ( response: Response ) => response.blob() )
		.then(( blob: Blob ) => {
			const link: HTMLAnchorElement
				= document.createElement( 'a' );

			link.href = URL.createObjectURL( blob );
			link.download = this.form.name;

			link.click();
			link.remove();
		});
	}

	/**
	 * @return {void}
	 */
	private _getPublicLink() {
		this.formViewService
		.getPublicLink( this.form.id )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( data: FormViewPublic ) => {
				this.form.isPublic = data.isPublic;
				this.publicLink = data.publicLink;

				this._cdRef.markForCheck();
			},
		});
	}

}
