import {
	Directive,
	ElementRef,
	EventEmitter,
	HostListener,
	inject,
	Input,
	Output,
	ViewContainerRef
} from '@angular/core';
import _ from 'lodash';

import {
	CoerceBoolean
} from 'angular-core';

import {
	CUBOverlayDispatcher,
	CUBOverlayHasBackdrop,
	CUBOverlayPosition
} from '../../overlay';

import {
	CUBPopupComponent
} from '../popup/popup.component';

import {
	CUBPopupConfig,
	CUBPopupRef,
	CUBPopupService
} from './popup.service';

@Directive({
	selector: '[cubPopupTriggerFor]',
	exportAs: 'cubPopupTriggerFor',
})
export class CUBPopupTriggerForDirective
	extends CUBOverlayDispatcher {

	@Input( 'cubPopupTriggerOrigin' )
	public origin: ElementRef | HTMLElement;
	@Input( 'cubPopupTriggerPosition' )
	public position: CUBOverlayPosition;
	@Input( 'cubPopupTriggerContext' )
	public context: ObjectType;
	@Input( 'cubPopupTriggerOtherConfig' )
	public otherConfig: CUBPopupConfig;
	@Input( 'cubPopupTriggerHasBackdrop' )
	public hasBackdrop: CUBOverlayHasBackdrop;
	@Input( 'cubPopupTriggerDisableOpen' ) @CoerceBoolean()
	public disableOpen: boolean;
	@Input( 'cubPopupTriggerDisableClose' ) @CoerceBoolean()
	public disableClose: boolean;

	@Output() public popupOpened: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public popupClosed: EventEmitter<void>
		= new EventEmitter<void>();

	private readonly _vcRef: ViewContainerRef
		= inject( ViewContainerRef );

	private _popupService: CUBPopupService;
	private _popupRef: CUBPopupRef;
	private _popup: CUBPopupComponent;

	@Input( 'cubPopupTriggerFor' )
	get popup(): CUBPopupComponent {
		return this._popup;
	}
	set popup(
		popup: CUBPopupComponent
	) {
		if ( popup === this._popup ) {
			return;
		}

		this._popup = popup;
	}

	get isOpened(): boolean {
		return this.isAttached;
	}

	/**
	 * @constructor
	 */
	constructor() {
		const popupService: CUBPopupService
			= inject( CUBPopupService );

		super( popupService );

		this._popupService
			= popupService;
	}

	@HostListener( 'click' )
	@HostListener( 'keydown.space' )
	protected onClickOrKeydownSpace() {
		if ( this.isOpened
			|| this.disableOpen ) {
			return;
		}

		this.open();
	}

	/**
	 * @param {ObjectType=} context
	 * @param {CUBPopupConfig=} config
	 * @return {void}
	 */
	public open(
		context: ObjectType = this.context,
		config?: CUBPopupConfig
	) {
		if ( !this.popup
			|| this.isOpened ) {
			return;
		}

		this._popupRef
			= this
			._popupService
			.open(
				this.originElement,
				this.popup,
				context,
				this.getConfig( config ),
				this.getCallbacks()
			);
	}

	/**
	 * @return {void}
	 */
	public close() {
		if ( !this.isOpened ) {
			return;
		}

		this._popupRef?.close();
	}

	/**
	 * @return {void}
	 */
	protected override onAttached() {
		this.popupOpened.emit();
	}

	/**
	 * @return {void}
	 */
	protected override onDetached() {
		this.popupClosed.emit();
	}

	/**
	 * @return {void}
	 */
	protected override onOutsideClicked() {
		if ( this.disableClose ) {
			return;
		}

		this.close();
	}

	/**
	 * @param {CUBPopupConfig=} config
	 * @return {CUBPopupConfig}
	 */
	protected override getConfig(
		config?: CUBPopupConfig
	): CUBPopupConfig {
		config = {
			...super.getConfig(),
			..._.omitBy(
				{
					disableClose:
						this.disableClose,
					viewContainerRef:
						this.isDestroyed
							? this.popup.vcRef
							: this._vcRef,
				},
				_.isUndefined
			),
			...config,
		};

		return config;
	}

}
