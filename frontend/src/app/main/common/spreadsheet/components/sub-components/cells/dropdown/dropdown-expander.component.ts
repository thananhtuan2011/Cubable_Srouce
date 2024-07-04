import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	inject,
	Inject,
	Optional
} from '@angular/core';
import {
	BehaviorSubject
} from 'rxjs';

import {
	untilCmpDestroyed
} from '@core';

import {
	DropdownOption
} from '@main/common/field/interfaces';
import {
	DropdownField
} from '@main/common/field/objects';

import {
	CUBMenuRef,
	CUBMenuService
} from '@cub/material/menu';
import {
	CUB_POPUP_CONTEXT,
	CUB_POPUP_REF,
	CUBPopupRef
} from '@cub/material/popup';

import {
	DropdownSelectorComponent,
	DropdownSelectorContext
} from './dropdown-selector.component';

export type DropdownExpanderContext
	= DropdownSelectorContext & {
		readonly: boolean;
		selectedOptions$: BehaviorSubject<DropdownOption[]>;
	};

@Component({
	selector: 'dropdown-expander',
	templateUrl: './dropdown-expander.pug',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownExpanderComponent {

	protected field: DropdownField;
	protected readonly: boolean;
	protected selectedOptions$: BehaviorSubject<DropdownOption[]>;
	protected selectorRef: CUBMenuRef;

	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );

	/**
	 * @constructor
	 * @param {CUBPopupRef} popupRef
	 * @param {DropdownExpanderContext} popupContext
	 */
	constructor(
		@Optional() @Inject( CUB_POPUP_REF )
		protected popupRef: CUBPopupRef,
		@Optional() @Inject( CUB_POPUP_CONTEXT )
		protected popupContext: DropdownExpanderContext
	) {
		this.field = this.popupContext.field;
		this.readonly = this.popupContext.readonly;
		this.selectedOptions$
			= this.popupContext.selectedOptions$;
	}

	/**
	 * @return {void}
	 */
	protected close() {
		this.selectorRef?.close();
		this.popupRef?.close();
	}

	/**
	 * @return {void}
	 */
	protected openSelector() {
		if ( this.selectorRef?.isOpened ) {
			return;
		}

		this.popupRef.updateConfig({
			disableClose: true,
		});

		this.selectorRef
			= this._menuService.open(
				this._elementRef,
				DropdownSelectorComponent,
				this.popupContext,
				{ position: 'start-below' }
			);

		this.selectorRef
		.afterClosed()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => {
			setTimeout(() => {
				this.popupRef.updateConfig({
					disableClose: false,
				});
			} );
		} );
	}

	/**
	 * @param {DropdownOption} option
	 * @return {void}
	 */
	protected deselectOption(
		option: DropdownOption
	) {
		this.popupContext
		.onOptionDeselected?.( option );
	}

}
