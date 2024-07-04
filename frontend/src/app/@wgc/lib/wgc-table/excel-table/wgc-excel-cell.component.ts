import {
	Component, Input, Output,
	EventEmitter, ViewChild, ElementRef,
	OnInit, ChangeDetectionStrategy, AfterViewInit,
	ChangeDetectorRef, ViewEncapsulation, Optional,
	Inject, HostBinding
} from '@angular/core';
import { FormControl, Validators, ValidatorFn, FormControlStatus } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ResizeEvent } from 'angular-resizable-element';
import _ from 'lodash';

import {
	DefaultValue, CoerceBoolean, CoerceNumber,
	DateTimeConfig, DATE_TIME_CONFIG, untilCmpDestroyed,
	Unsubscriber
} from '@core';
import { REGEXP, CONSTANT as APP_CONSTANT } from '@resources';

import { WGCSearchBoxComponent } from '../../wgc-search-box';
import { WGCIDatePickerPickedEvent } from '../../wgc-date-picker';

export type WGCIExcelCellType = 'website' | 'email' | 'number' | 'phone' | 'date' | 'list' | 'strict-list' | 'multi-list';

@Unsubscriber()
@Component({
	selector		: 'td[wgcExcelCell]',
	templateUrl		: './wgc-excel-cell.pug',
	styleUrls		: [ './wgc-excel-cell.scss' ],
	host			: { class: 'wgc-excel-cell' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCExcelCellComponent implements OnInit, AfterViewInit {

	@HostBinding( 'style.width' )
	get styleWidth(): string { return this.width; }

	@HostBinding( 'style.minWidth' )
	get styleMinWidth(): string { return this.width; }

	@HostBinding( 'style.height' )
	get styleHeight(): string { return this.height; }

	@HostBinding( 'style.minHeight' )
	get styleMinHeight(): string { return this.height; }

	@HostBinding( 'class.wgc-excel-cell--focusing' )
	get classFocusing(): boolean { return this.focusing; }

	@HostBinding( 'class.wgc-excel-cell--valid' )
	get classValid(): boolean { return !this.isInvalid; }

	@HostBinding( 'class.wgc-excel-cell--invalid' )
	get classInvalid(): boolean { return this.isInvalid; }

	@HostBinding( 'class.wgc-excel-cell--dirty' )
	get classDirty(): boolean { return this.formControl.dirty; }

	@HostBinding( 'class.wgc-excel-cell--pristine' )
	get classPristine(): boolean { return this.formControl.pristine; }

	@HostBinding( 'class.wgc-excel-cell--touched' )
	get classTouched(): boolean { return this.formControl.touched; }

	@HostBinding( 'class.wgc-excel-cell--untouched' )
	get classUntouched(): boolean { return this.formControl.untouched; }

	@HostBinding( 'class.wgc-excel-cell--enabled' )
	get classEnable(): boolean { return this.formControl.enabled; }

	@HostBinding( 'class.wgc-excel-cell--disabled' )
	get classDisabled(): boolean { return this.formControl.disabled; }

	@HostBinding( 'class.wgc-excel-cell--has-list' )
	get classHasList(): boolean { return !!this.list?.length; }

	@HostBinding( 'attr.data-error' )
	get attrDataError(): string { return this.error; }

	@ViewChild( 'excellCellContent' ) public excellCellContent: ElementRef<any>;
	@ViewChild( WGCSearchBoxComponent ) public searchBox: WGCSearchBoxComponent;

	@Input() public list: any[];
	@Input() public textContent: string;
	@Input() @DefaultValue() @CoerceNumber() public itemSize: number = 40;
	@Input() @CoerceBoolean() public required: boolean;
	@Input() @CoerceBoolean() public readonly: boolean;
	@Input() @CoerceBoolean() public focusing: boolean;
	@Input() public type: WGCIExcelCellType;

	@Output() public textContentChange: EventEmitter<string> = new EventEmitter<string>();
	@Output() public focus: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public blur: EventEmitter<Event> = new EventEmitter<Event>();

	public width: string;
	public height: string;
	public error: string;
	public isInvalid: boolean;
	public formControl: FormControl = new FormControl();

	private _translateMessages: ObjectType<string> = {
		required		: 'WGC.MESSAGE.VALUE_REQUIRED',
		website			: 'WGC.MESSAGE.WEBSITE_VALUE_INVALID',
		email			: 'WGC.MESSAGE.EMAIL_VALUE_INVALID',
		number			: 'WGC.MESSAGE.NUMBER_VALUE_INVALID',
		phone			: 'WGC.MESSAGE.PHONE_VALUE_INVALID',
		'strict-list'	: 'WGC.MESSAGE.VALUE_NOT_IN_LIST',
		default			: 'WGC.MESSAGE.VALUE_NOT_IN_LIST',
	};

	get rowIndex(): number {
		const el: HTMLElement = this._elementRef.nativeElement;

		return _.indexOf( el.parentNode.parentNode.children, el.parentNode );
	}

	get columnIndex(): number {
		const el: HTMLElement = this._elementRef.nativeElement;

		return _.indexOf( el.parentNode as any, el );
	}

	get filteredList(): any[] {
		return this.searchBox?.filteredData;
	}

	get useVirtualScroll(): boolean {
		return this.filteredList?.length >= APP_CONSTANT.USE_VIRTUAL_SCROLL_WITH;
	}

	/**
	 * @constructor
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {ElementRef} _elementRef
	 * @param {TranslateService} _translateService
	 * @param {DateTimeConfig} _dateTimeConfig
	 */
	constructor(
		private _cdRef: ChangeDetectorRef,
		private _elementRef: ElementRef,
		private _translateService: TranslateService,
		@Optional() @Inject( DATE_TIME_CONFIG ) private _dateTimeConfig: DateTimeConfig
	) {}

	/**
	 * @constructor
	 */
	ngOnInit() {
		this.formControl.statusChanges
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( status: FormControlStatus ) => {
			setTimeout( () => {
				let error: string;

				if ( this.formControl?.errors ) {
					let type: string = this.type;

					if ( this.formControl.errors.required ) type = 'required';

					error = this._translateService.instant( this._translateMessages[ type ] || this._translateMessages.default );
				}

				this.error = error;
				this.isInvalid = status === 'INVALID';

				this._cdRef.markForCheck();
			} );
		} );

		const validatorFns: ValidatorFn[] = [];

		this.required && validatorFns.push( Validators.required );

		switch ( this.type ) {
			case 'website':
				validatorFns.push( Validators.pattern( REGEXP.URL ) );
				break;
			case 'email':
				validatorFns.push( Validators.pattern( REGEXP.EMAIL ) );
				break;
			case 'number':
				validatorFns.push( Validators.pattern( REGEXP.NUMBER ) );
				break;
			case 'phone':
				validatorFns.push( Validators.pattern( REGEXP.PHONE ) );
				break;
			case 'strict-list':
				this.list && validatorFns.push( Validators.pattern( new RegExp( `^(${_.join( this.list, '|' )})$` ) ) );
				break;
		}

		this.formControl.setValidators( validatorFns );
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		if ( this.textContent ) {
			this.excellCellContent.nativeElement.innerText = this.textContent;
		} else {
			this.textContent = this.excellCellContent.nativeElement.innerText;
		}

		this.textContent && setTimeout( () => this.formControl.markAsDirty() );
	}

	/**
	 * @param {ResizeEvent} event
	 * @return {void}
	 */
	public onResizing( event: ResizeEvent ) {
		const width: number = event.rectangle.width;
		const height: number = event.rectangle.height;

		this.width = `${width > 200 ? width : 200}px`;
		this.height = `${height > 40 ? height : 40}px`;
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public onInput( event: Event ) {
		this.textContent = ( event.target as Node ).textContent;

		this.textContentChange.emit( this.textContent );
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public onKeydown( event: KeyboardEvent ) {
		if ( event.key !== 'Enter' ) return;

		event.preventDefault();
		this.excellCellContent.nativeElement.blur();
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public onFocus( event: Event ) {
		this.focusing = true;

		this.focus.emit( event );
	}

	/**
	 * @param {Event} event
	 * @return {void}
	 */
	public onBlur( event: Event ) {
		this.focusing = false;

		this.blur.emit( event );
	}

	/**
	 * @param {WGCIDatePickerPickedEvent} event
	 * @return {void}
	 */
	public onDatePicked( event: WGCIDatePickerPickedEvent ) {
		this.setTextContent( event.date.format( this._dateTimeConfig.dateFormat || APP_CONSTANT.DATE_FORMAT ) );
	}

	/**
	 * @param {string} textContent
	 * @return {void}
	 */
	public setTextContent( textContent: string ) {
		if ( this.type === 'multi-list' && this.textContent?.length ) {
			let valueArr: string[] = _.chain( this.textContent )
			.replace( /, /g, ',' )
			.split( ',' )
			.uniq()
			.value();

			valueArr = _.union( valueArr, [ textContent ] );
			textContent = valueArr?.length ? _.arrayJoin( valueArr, ', ' ) : textContent;
		}

		this.textContent = textContent;

		this.excellCellContent.nativeElement.focus();

		setTimeout( () => {
			this.excellCellContent.nativeElement.innerHTML = '';

			// eslint-disable-next-line deprecation/deprecation
			document.execCommand( 'insertHTML', false, textContent || '' );
		} );
	}

}
