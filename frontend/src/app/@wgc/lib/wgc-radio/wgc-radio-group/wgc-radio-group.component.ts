import {
	Component, Input, ContentChildren,
	QueryList, AfterContentInit, ViewEncapsulation,
	forwardRef, SimpleChanges, OnChanges,
	HostListener, Output, EventEmitter,
	ChangeDetectionStrategy, HostBinding
} from '@angular/core';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { startWith, takeUntil } from 'rxjs/operators';
import _ from 'lodash';

import { Unsubscriber, CoerceBoolean, DefaultValue, untilCmpDestroyed } from '@core';
import { WGCRadioComponent } from '../wgc-radio/wgc-radio.component';

export type WGCRadioGroupDirection = 'vertical' | 'horizontal';

@Unsubscriber()
@Component({
	selector		: 'wgc-radio-group',
	templateUrl		: './wgc-radio-group.pug',
	styleUrls		: [ './wgc-radio-group.scss' ],
	host			: { class: 'wgc-radio-group' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
	providers: [{
		provide		: NG_VALUE_ACCESSOR,
		useExisting	: forwardRef( () => WGCRadioGroupComponent ),
		multi		: true,
	}],
})
export class WGCRadioGroupComponent implements OnChanges, AfterContentInit, ControlValueAccessor {

	@HostBinding( 'class.wgc-radio-group--vertical' )
	get classVertical(): boolean { return this.direction === 'vertical'; }

	@HostBinding( 'class.wgc-radio-group--horizontal' )
	get classHorizontal(): boolean { return this.direction === 'horizontal'; }

	@ContentChildren( WGCRadioComponent, { descendants: true } ) public radioList: QueryList<WGCRadioComponent>;

	@Input() public ngModel: any;
	@Input() public label: any;
	@Input() public disableControl: boolean;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public readonly: boolean;
	@Input() @CoerceBoolean() public required: boolean;
	@Input() @DefaultValue() public direction: WGCRadioGroupDirection = 'vertical';
	@Input() public formControl: FormControl;

	@Output() public ngModelChange: EventEmitter<any> = new EventEmitter<any>();

	private _innerValue: any;

	@HostListener( 'click', [ '$event' ] )
	public triggerClick( event: MouseEvent ) {
		if ( this.disabled || this.disableControl || this.readonly || !this.formControl ) return;

		event.stopPropagation();
		this.formControl.markAsTouched();
	}

	/**
	 * @constructor
	 * @param {any} value
	 */
	public writeValue( value: any ) {
		if ( value === this._innerValue ) return;

		this._innerValue = value;
	}

	/**
	 * @constructor
	 * @param {Function} fn
	 */
	public registerOnChange( fn: Function ) {
		this._onChangeCallback = fn;
	}

	/**
	 * @constructor
	 * @param {Function} fn
	 */
	public registerOnTouched( fn: Function ) {
		this._onTouchedCallback = fn;
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.ngModel ) return;

		_.forEach( this.radioList?.toArray(), ( item: WGCRadioComponent ) => {
			item.checked = item.value !== undefined && item.value === this.ngModel;
		} );
	}

	/**
	 * @constructor
	 */
	ngAfterContentInit() {
		this.radioList
		.changes
		.pipe(
			startWith( this.radioList ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( items: QueryList<WGCRadioComponent> ) => {
			const itemArr: WGCRadioComponent[] = items?.toArray();

			_.forEach( itemArr, ( item: WGCRadioComponent, index: number ) => {
				item.checked = item.value !== undefined && item.value === this.ngModel;
				item.disabled = item.disabled || this.disabled || this.disableControl;
				item.readonly = item.readonly || this.readonly;

				item
				.checkedChange
				.pipe(
					takeUntil( this.radioList.changes ),
					untilCmpDestroyed( this )
				)
				.subscribe( ( checked: boolean ) => {
					if ( !checked ) {
						item.checked = true;
						return;
					}

					this._innerValue = this.ngModel = item.value;

					_.forEach( itemArr, ( _item: WGCRadioComponent, _index: number ) => {
						_item.checked = index === _index;
					} );
					this._onTouchedCallback();
					this._onChangeCallback( this._innerValue );
				} );
			} );
		} );
	}

	private _onTouchedCallback: Function = () => {};
	private _onChangeCallback: Function = ( _v: any ) => {};

}
