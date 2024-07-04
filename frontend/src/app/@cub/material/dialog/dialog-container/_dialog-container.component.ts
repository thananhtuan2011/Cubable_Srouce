import {
	ChangeDetectionStrategy,
	Component,
	ComponentRef,
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

import type {
	CUBDialogRef
} from '../dialog/_dialog.service';

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

	public readonly viewContainerRef: ViewContainerRef
		= inject( ViewContainerRef );

	public ref: CUBDialogRef;

	@ViewChild( CdkPortalOutlet, { static: true } )
	protected readonly portalOutlet: CdkPortalOutlet;

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
		const width: number
			= e.rectangle.width;

		this
		.ref
		.updateSize({ width });
	}

	/**
	 * @param {ResizeEvent} e
	 * @return {void}
	 */
	protected onResizeEnd(
		e: ResizeEvent
	) {
		const width: number
			= e.rectangle.width;

		this
		.ref
		.updateSize({ width });

		this
		.ref
		.afterResized()
		.next( width );
	}

}
