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
	CUBMenuComponent
} from '../menu/menu.component';
import {
	CUBMenuItemComponent
} from '../menu/menu-item/menu-item.component';

import {
	CUBMenuConfig,
	CUBMenuRef,
	CUBMenuService,
	CUBMenuType
} from './menu.service';

@Directive({
	selector: `
		[cubMenuTriggerFor],
		button[cubMenuItem][cubSubMenuTriggerFor],
		button[cubMenuSelectItem][cubSubMenuTriggerFor]
	`,
	exportAs: 'cubMenuTriggerFor',
	providers: [ CUBMenuItemComponent ],
})
export class CUBMenuTriggerForDirective
	extends CUBOverlayDispatcher {

	@Input( 'cubMenuTriggerOrigin' )
	public origin: ElementRef | HTMLElement;
	@Input( 'cubMenuTriggerPosition' )
	public position: CUBOverlayPosition;
	@Input( 'cubMenuTriggerContext' )
	public context: ObjectType;
	@Input( 'cubMenuTriggerType' )
	public type: CUBMenuType;
	@Input( 'cubMenuTriggerOtherConfig' )
	public otherConfig: CUBMenuConfig;
	@Input( 'cubMenuTriggerHasBackdrop' )
	public hasBackdrop: CUBOverlayHasBackdrop;
	@Input( 'cubMenuTriggerDisableOpen' ) @CoerceBoolean()
	public disableOpen: boolean;
	@Input( 'cubMenuTriggerDisableClose' ) @CoerceBoolean()
	public disableClose: boolean;

	@Output() public menuOpened: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public menuClosed: EventEmitter<void>
		= new EventEmitter<void>();

	private readonly _vcRef: ViewContainerRef
		= inject( ViewContainerRef );

	private _menuService: CUBMenuService;
	private _menuRef: CUBMenuRef;
	private _mainMenu: CUBMenuComponent;
	private _subMenu: CUBMenuComponent;

	@Input( 'cubMenuTriggerFor' )
	get mainMenu(): CUBMenuComponent {
		return this._mainMenu;
	}
	set mainMenu(
		menu: CUBMenuComponent
	) {
		if ( menu === this._mainMenu ) {
			return;
		}

		this._mainMenu = menu;
	}

	@Input( 'cubSubMenuTriggerFor' )
	get subMenu(): CUBMenuComponent {
		return this._subMenu;
	}
	set subMenu(
		menu: CUBMenuComponent
	) {
		if ( menu === this._subMenu ) {
			return;
		}

		this._subMenu = menu;
	}

	get menu(): CUBMenuComponent {
		return this._subMenu
			|| this._mainMenu;
	}

	get isOpened(): boolean {
		return this.isAttached;
	}

	get isContextMenu(): boolean {
		return this.type
			=== CUBMenuType.ContextMenu;
	}

	/**
	 * @constructor
	 * @param {CUBMenuItemComponent} _menuItemComp
	 */
	constructor(
		private _menuItemComp: CUBMenuItemComponent
	) {
		const menuService: CUBMenuService
			= inject( CUBMenuService );

		super( menuService );

		this._menuService
			= menuService;
	}

	@HostListener( 'click' )
	@HostListener( 'keydown.space' )
	protected onClickOrKeydownSpace() {
		if ( this.isContextMenu
			|| this.disableOpen ) {
			return;
		}

		this.open();
	}

	@HostListener(
		'contextmenu',
		[ '$event' ]
	)
	protected onContextMenu(
		e: MouseEvent
	 ) {
		this.close();

		if ( !this.isContextMenu
			|| this.disableOpen ) {
			return;
		}

		e.preventDefault();

		this.open(
			undefined,
			{
				offsetX: e.pageX,
				offsetY: e.pageY,
			}
		);
	}

	/**
	 * @param {ObjectType=} context
	 * @param {CUBMenuConfig=} config
	 * @return {void}
	 */
	public open(
		context: ObjectType = this.context,
		config?: CUBMenuConfig
	) {
		if ( !this.menu
			|| this.isOpened ) {
			return;
		}

		this._menuRef
			= this
			._menuService
			.open(
				this.originElement,
				this.menu,
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

		this._menuRef?.close();
	}

	/**
	 * @return {void}
	 */
	protected override onAttached() {
		this.menuOpened.emit();
	}

	/**
	 * @return {void}
	 */
	protected override onDetached() {
		this.menuClosed.emit();
	}

	/**
	 * @param {MouseEvent} e
	 * @return {void}
	 */
	protected override onOutsideClicked(
		e: MouseEvent
	) {
		if ( this.disableClose
			|| ( this.isContextMenu
				&& e.type === 'auxclick' ) ) {
			return;
		}

		this.close();
	}

	/**
	 * @param {CUBMenuConfig=} config
	 * @return {CUBMenuConfig}
	 */
	protected override getConfig(
		config?: CUBMenuConfig
	): CUBMenuConfig {
		config = {
			...super.getConfig(),
			..._.omitBy(
				{
					type: this.type,
					disableClose:
						this.disableClose,
					viewContainerRef:
						this.isDestroyed
							? this.menu.vcRef
							: this._vcRef,
				},
				_.isUndefined
			),
			...config,
		};

		if ( this._subMenu ) {
			config.originY = 'top';
			config.overlayY = 'top';
			config.position = 'after';
			config.panelClass = [
				'cub-overlay-menu-pane',
				'cub-overlay-sub-menu-pane',
			];

			this
			._menuItemComp
			.autoClose = false;

			this._menuItemComp.point();
		}

		return config;
	}

}
