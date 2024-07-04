import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ContentChild,
	ElementRef,
	EventEmitter,
	inject,
	Input,
	Output,
	TemplateRef,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation
} from '@angular/core';
import _ from 'lodash';

import {
	CoerceBoolean,
	CoerceCssPixel
} from 'angular-core';

import {
	CUBScrollBarDirective
} from '../../scroll-bar';

import {
	CUBPopupRef
} from '../popup-trigger-for/popup.service';

import {
	CUBPopupContentComponent
} from './popup-content/popup-content.component';
import {
	CUBPopupHeaderComponent
} from './popup-header/popup-header.component';
import {
	CUBPopupFooterComponent
} from './popup-footer/popup-footer.component';

@Component({
	selector: 'cub-popup',
	templateUrl: './popup.pug',
	styleUrls: [ './popup.scss' ],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBPopupComponent {

	@Input() @CoerceCssPixel() public width: string;
	@Input() @CoerceCssPixel() public minWidth: string;
	@Input() @CoerceCssPixel() public maxWidth: string;
	@Input() @CoerceCssPixel() public height: string;
	@Input() @CoerceCssPixel() public minHeight: string;
	@Input() @CoerceCssPixel() public maxHeight: string;
	@Input() @CoerceBoolean() public draggable: boolean;
	@Input( 'class' ) public classList: ObjectType<boolean>;

	@Output() public opened: EventEmitter<Event>
		= new EventEmitter<Event>();
	@Output() public closed: EventEmitter<Event>
		= new EventEmitter<Event>();

	@ViewChild( TemplateRef, { static: true } )
	public readonly templateRef: TemplateRef<any>;

	@ContentChild( CUBPopupHeaderComponent )
	public readonly popupHeader: CUBPopupHeaderComponent;
	@ContentChild( CUBPopupContentComponent )
	public readonly popupContent: CUBPopupContentComponent;
	@ContentChild( CUBPopupFooterComponent )
	public readonly popupFooter: CUBPopupFooterComponent;

	public readonly elementRef: ElementRef
		= inject( ElementRef );
	public readonly vcRef: ViewContainerRef
		= inject( ViewContainerRef );

	public ref: CUBPopupRef;
	public context: ObjectType;
	public scrollBar: CUBScrollBarDirective;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	get isOpened(): boolean {
		return !!this.ref?.isOpened;
	}

	/**
	 * @return {void}
	 */
	public markAsOpened() {
		this.opened.emit();

		this.markForCheck();

		this._cdRef.detach();
	}

	/**
	 * @return {void}
	 */
	public markAsClosed() {
		this.closed.emit();

		this.markForCheck();
	}

	/**
	 * @return {void}
	 */
	public close() {
		this.ref?.close();
	}

	/**
	 * @return {void}
	 */
	public markForCheck() {
		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	public detectChanges() {
		this._cdRef.detectChanges();
	}

}
