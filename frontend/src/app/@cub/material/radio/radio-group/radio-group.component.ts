import {
	AfterContentInit,
	ChangeDetectionStrategy,
	Component,
	ContentChildren,
	forwardRef,
	HostBinding,
	Input,
	QueryList,
	ViewEncapsulation
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { startWith, takeUntil } from 'rxjs/operators';
import _ from 'lodash';

import {
	CoerceBoolean,
	DefaultValue,
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	// CUB_VALUE_ACCESSOR,
	CUBValueAccessor
} from '../../value-accessor';

import { CUBRadioComponent } from '../radio/radio.component';

export type CUBRadioGroupDirection = 'vertical' | 'horizontal';

@Unsubscriber()
@Component({
	selector: 'cub-radio-group',
	templateUrl: './radio-group.pug',
	styleUrls: [ './radio-group.scss' ],
	host: { class: 'cub-radio-group' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: forwardRef( () => CUBRadioGroupComponent ),
		multi: true,
	}],
})
export class CUBRadioGroupComponent
	extends CUBValueAccessor
	implements AfterContentInit {

	@HostBinding( 'class.cub-radio-group-vertical' )
	get classVertical(): boolean { return this.direction === 'vertical'; }

	@HostBinding( 'class.cub-radio-group-horizontal' )
	get classHorizontal(): boolean { return this.direction === 'horizontal'; }

	@ContentChildren( CUBRadioComponent, { descendants: true } )
	public radios: QueryList<CUBRadioComponent>;

	@Input() public label: string;
	@Input() @CoerceBoolean() public readonly: boolean;
	@Input() @DefaultValue() public direction: CUBRadioGroupDirection = 'vertical';

	/**
	 * @param {any} value
	 * @return {void}
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	override writeValue( value: any ) {
		super.writeValue( value );

		this.radios?.forEach(( item: CUBRadioComponent ) => {
			item.checked = item.value !== undefined
				&& item.value === this.value;

			item.markForCheck();
		});
	}

	/**
	 * @constructor
	 */
	ngAfterContentInit() {
		this.radios.changes
		.pipe(
			startWith( this.radios ),
			untilCmpDestroyed( this )
		)
		.subscribe(( items: QueryList<CUBRadioComponent> ) => {
			items.forEach(( item: CUBRadioComponent ) => {
				item.checked
					= item.value !== undefined && item.value === this.value;
				item.disabled = item.disabled || this.isDisabled;
				item.readonly = item.readonly || this.readonly;

				item.markForCheck();

				item
				.checkedChange
				.pipe(
					takeUntil( this.radios.changes ),
					untilCmpDestroyed( this )
				)
				.subscribe(( checked: boolean ) => {
					if ( !checked ) {
						item.checked = true;

						item.markForCheck();
						return;
					}

					this.writeValue( item.value );
					this.onChange( item.value );
				});
			});
		});
	}

}
