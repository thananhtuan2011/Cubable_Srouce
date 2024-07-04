import {
	Component, ElementRef, TemplateRef,
	ViewChild, Input, Output,
	EventEmitter, ChangeDetectionStrategy, OnChanges
} from '@angular/core';
import { Subject } from 'rxjs';

import { DefaultValue, AliasOf, CoerceBoolean, CoerceNumber } from '@core';

@Component({
	selector		: 'wgc-list-item',
	templateUrl		: './wgc-list-item.pug',
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCListItemComponent implements OnChanges {

	@ViewChild( TemplateRef, { static: true } ) public templateRef: TemplateRef<any>;

	@Input() public id: string;
	@Input() @CoerceNumber() public order: number;
	@Input() public label: string;
	@Input() public description: string;
	@Input() public icon: string;
	@Input() public dotColor: string;
	@Input( 'class' ) public classes: string;
	@Input() @AliasOf( 'classes' ) public ngClass: string;
	@Input() @CoerceBoolean() public active: boolean;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public readonly: boolean;
	@Input() @CoerceBoolean() public focusing: boolean;
	@Input() @CoerceBoolean() public hovering: boolean;
	@Input() @CoerceBoolean() public dragging: boolean;
	@Input() @CoerceBoolean() public draggable: boolean;
	@Input() @CoerceBoolean() public highlight: boolean;
	@Input() @CoerceBoolean() public autoUnhighlight: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public truncate: boolean = true;
	@Input() @DefaultValue() @CoerceNumber() public truncateLimitLine: number = 2;

	@Output() public saved: EventEmitter<string> = new EventEmitter<string>();
	@Output() public cancelled: EventEmitter<string> = new EventEmitter<string>();
	@Output() public editing: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() public labelChange: EventEmitter<string> = new EventEmitter<string>();
	@Output() public dotColorChange: EventEmitter<string> = new EventEmitter<string>();
	@Output() public highlightChange: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output( 'click' ) public clickEventEmitter: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
	@Output( 'focus' ) public focusEventEmitter: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
	@Output( 'blur' ) public blurEventEmitter: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

	public isEditing: boolean;
	public isDropped: boolean;
	public changes$: Subject<void> = new Subject<void>();
	public editingSubject$: Subject<void> = new Subject<void>();

	/**
	 * @constructor
	 * @param {ElementRef} elementRef
	 */
	constructor( public elementRef: ElementRef ) {}

	/**
	 * @constructor
	 */
	ngOnChanges() {
		this.changes$.next();
	}

	/**
	 * @param {boolean} highlight
	 * @return {void}
	 */
	public onHighlightStateChange( highlight: boolean ) {
		if ( this.isDropped ) {
			this.isDropped = highlight;
			return;
		}

		this.highlightChange.emit( this.highlight = highlight );
	}

	/**
	 * @return {void}
	 */
	public edit() {
		this.editingSubject$.next();
	}

	/**
	 * @param {string} label
	 * @return {void}
	 */
	public save( label: string ) {
		this.isEditing = false;

		if ( this.label === label ) return;

		this.label = label;
		this.saved.emit( this.label );
	}

	/**
	 * @param {string} label
	 * @return {void}
	 */
	public cancel( label?: string ) {
		this.isEditing = false;

		this.cancelled.emit( label );
	}

	/**
	 * @param {MouseEvent} event
	 * @return {void}
	 */
	public click( event?: MouseEvent ) {
		this.clickEventEmitter.emit( event );
	}

	/**
	 * @param {MouseEvent} event
	 * @return {void}
	 */
	public focus( event?: MouseEvent ) {
		this.focusing = true;

		this.focusEventEmitter.emit( event );
	}

	/**
	 * @param {MouseEvent} event
	 * @return {void}
	 */
	public blur( event?: MouseEvent ) {
		this.focusing = false;

		this.blurEventEmitter.emit( event );
	}

}
