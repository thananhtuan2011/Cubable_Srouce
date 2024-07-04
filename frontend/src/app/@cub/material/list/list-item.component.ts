import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	HostListener,
	inject,
	Input,
	Output,
	ViewEncapsulation
} from '@angular/core';
import {
	Subject
} from 'rxjs';

import {
	CoerceBoolean
} from 'angular-core';

@Component({
	selector: 'button[cubListItem]',
	template: '<ng-content></ng-content>',
	styleUrls: [ './list-item.scss' ],
	host: { class: 'cub-list-item' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBListItemComponent {

	@HostBinding( 'class.cub-list-item--active' )
	@Input() @CoerceBoolean()
	public active: boolean;
	@HostBinding( 'class.cub-list-item--pointing' )
	@Input() @CoerceBoolean()
	public pointing: boolean;
	@Input() @CoerceBoolean()
	public disabled: boolean;

	@Output() public pointingChange: EventEmitter<boolean>
		= new EventEmitter<boolean>();

	public readonly elementRef: ElementRef
		= inject( ElementRef );
	public readonly focused$: Subject<FocusEvent>
		= new Subject<FocusEvent>();

	/**
	 * @return {void}
	 */
	public click() {
		this
		.elementRef
		.nativeElement
		.click();
	}

	/**
	 * @return {void}
	 */
	public focus() {
		this
		.elementRef
		.nativeElement
		.focus();
	}

	/**
	 * @return {void}
	 */
	public blur() {
		this
		.elementRef
		.nativeElement
		.blur();
	}

	/**
	 * @param {boolean=} emitEvent
	 * @return {void}
	 */
	public point(
		emitEvent: boolean = true
	) {
		if ( this.pointing ) {
			return;
		}

		this.pointing = true;

		if ( !emitEvent ) {
			return;
		}

		this
		.pointingChange
		.emit( this.pointing );
	}

	/**
	 * @param {boolean=} emitEvent
	 * @return {void}
	 */
	public unpoint(
		emitEvent: boolean = true
	) {
		if ( !this.pointing ) {
			return;
		}

		this.pointing = false;

		if ( !emitEvent ) {
			return;
		}

		this
		.pointingChange
		.emit( this.pointing );
	}

	/**
	 * @return {void}
	 */
	public scrollToElement() {
		this
		.elementRef
		.nativeElement
		.scrollIntoView({
			block: 'nearest',
		});
	}

	@HostListener(
		'focus',
		[ '$event' ]
	)
	protected onFocus(
		e: FocusEvent
	) {
		this.focused$.next( e );
	}

	@HostListener( 'mousemove' )
	protected onMousemove() {
		if ( this.disabled ) {
			return;
		}

		this.point();
	}

	@HostListener( 'mouseleave' )
	protected onMouseleave() {
		if ( this.disabled ) {
			return;
		}

		this.unpoint();
	}

}
