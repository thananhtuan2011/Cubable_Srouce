import {
	ChangeDetectionStrategy,
	Component,
	ComponentRef,
	ElementRef,
	EmbeddedViewRef,
	inject,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation
} from '@angular/core';
import {
	BasePortalOutlet,
	CdkPortalOutlet,
	ComponentPortal,
	TemplatePortal
} from '@angular/cdk/portal';
import {
	ResizeEvent
} from 'angular-resizable-element';
import {
	Subject
} from 'rxjs';

import {
	CUBDialogDirection,
	CUBDialogRef
} from '../dialog/dialog.service';

type ResizedEvent = {
	width: number;
	height: number;
};

@Component({
	selector: 'cub-dialog-container',
	templateUrl: './dialog-container.pug',
	styleUrls: [ './dialog-container.scss' ],
	host: { class: 'cub-dialog-container' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBDialogContainerComponent
	extends BasePortalOutlet {

	public readonly elementRef: ElementRef
		= inject( ElementRef );
	public readonly viewContainerRef: ViewContainerRef
		= inject( ViewContainerRef );
	public readonly resized$: Subject<ResizedEvent>
		= new Subject();

	public ref: CUBDialogRef;

	@ViewChild( CdkPortalOutlet, { static: true } )
	protected readonly portalOutlet: CdkPortalOutlet;

	get isVerticalDir(): boolean {
		return this.ref.config.direction
			=== CUBDialogDirection.Vertical;
	}

	get isHorizontalDir(): boolean {
		return this.ref.config.direction
			=== CUBDialogDirection.Horizontal;
	}

	/**
	 * @param {ComponentPortal} portal
	 * @return {ComponentRef}
	 */
	public attachComponentPortal(
		portal: ComponentPortal<any>
	): ComponentRef<any> {
		return this
		.portalOutlet
		.attachComponentPortal( portal );
	}

	/**
	 * @param {TemplatePortal} portal
	 * @return {EmbeddedViewRef}
	 */
	public attachTemplatePortal(
		portal: TemplatePortal<any>
	): EmbeddedViewRef<any> {
		return this
		.portalOutlet
		.attachTemplatePortal( portal );
	}

	/**
	 * @param {ResizeEvent} e
	 * @return {void}
	 */
	protected onResizing(
		e: ResizeEvent
	) {
		let width: number;
		let height: number;

		if ( this.isHorizontalDir ) {
			width = e.rectangle.width;
		} else if ( this.isVerticalDir ) {
			height = e.rectangle.height;
		}

		this
		.ref
		.overlayRef
		.updateSize({ width, height });
	}

	/**
	 * @return {void}
	 */
	protected onResizeEnd() {
		const { width, height }: DOMRect
			= this
			.elementRef
			.nativeElement
			.getBoundingClientRect();

		this.resized$.next({ width, height });
	}

}
