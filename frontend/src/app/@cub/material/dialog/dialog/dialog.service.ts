import {
	inject,
	Injectable,
	Injector,
	ViewContainerRef
} from '@angular/core';
import {
	GlobalPositionStrategy,
	Overlay
} from '@angular/cdk/overlay';
import {
	ComponentPortal,
	TemplatePortal
} from '@angular/cdk/portal';
import {
	Observable
} from 'rxjs';
import {
	takeUntil
} from 'rxjs/operators';
import _ from 'lodash';

import {
	CUBOverlayResizedEvent
} from '../../overlay2';
import {
	CUBIModalInstance,
	CUBModalConfig,
	CUBModalRef,
	CUBModalService
} from '../../modal';

import {
	CUBDialogContainerComponent
} from '../dialog-container/dialog-container.component';

export enum CUBDialogDirection {
	Horizontal = 'horizontal',
	Vertical = 'vertical',
}

export type CUBDialogConfig = CUBModalConfig & {
	resizable?: boolean;
	direction?: CUBDialogDirection;
	viewContainerRef?: ViewContainerRef;
};

export interface CUBIDialogInstance
	extends CUBIModalInstance {}

export type CUBDialogInstance = CUBIDialogInstance;

function addSlideAnimation(
	dialogRef: CUBDialogRef,
	callback: () => void
) {
	dialogRef
	.overlayRef
	.addPanelClass(
		'cub-dialog-pane--sliding'
	);

	setTimeout(
		() => {
			dialogRef
			.overlayRef
			.removePanelClass(
				'cub-dialog-pane--sliding'
			);

			callback();
		},
		225
	);
}

export const CUB_DIALOG_CONTEXT: string
	= 'CUB_DIALOG_CONTEXT';
export const CUB_DIALOG_REF: string
	= 'CUB_DIALOG_REF';

export class CUBDialogRef extends CUBModalRef {

	private _afterResized:
		Observable<CUBOverlayResizedEvent>;

	get config(): CUBDialogConfig {
		return super.config;
	}

	get container(): CUBDialogContainerComponent {
		return this.overlayRef.instance as
			CUBDialogContainerComponent;
	}

	get instance(): CUBDialogInstance {
		return super.instance;
	}

	public close() {
		this
		.canClose$
		.subscribe(( canClose: boolean ) => {
			if ( canClose === false ) {
				return;
			}

			this
			.overlayRef
			.originalRef
			.detachBackdrop();

			addSlideAnimation(
				this,
				() => {
					this
					.overlayRef
					.removePanelClass(
						'cub-dialog-pane--opened'
					);

					this.overlayRef.dispose();
				}
			);
		});
	}

	public afterResized():
		Observable<CUBOverlayResizedEvent> {
		return this._afterResized
			||= this
			.container
			.resized$
			.pipe(
				takeUntil(
					this
					.overlayRef
					.config
					.destroyed$
				),
				takeUntil( this.afterClosed() )
			);
	}

}

@Injectable({
	providedIn: 'any',
})
export class CUBDialogService {

	private readonly _injector: Injector
		= inject( Injector );
	private readonly _overlay: Overlay
		= inject( Overlay );
	private readonly _modalService: CUBModalService
		= inject( CUBModalService );

	public open(
		component: any,
		context?: ObjectType,
		config?: CUBDialogConfig
	): CUBDialogRef {
		config = {
			direction: CUBDialogDirection.Horizontal,

			...config,

			overlayConfig: {
				disposeOnNavigation: true,

				...config.overlayConfig,
			},
		};

		const panelClass: string[]
			= [ 'cub-dialog-pane' ];
		const positionStrategy: GlobalPositionStrategy
			= this._overlay.position().global();

		switch ( config.direction ) {
			case CUBDialogDirection.Horizontal:
				panelClass.push(
					'cub-dialog-pane--horizontal'
				);
				positionStrategy.right( '0px' );
				break;
			case CUBDialogDirection.Vertical:
				panelClass.push(
					'cub-dialog-pane--vertical'
				);
				positionStrategy.bottom( '0px' );
				break;
		}

		config.overlayConfig.panelClass
			= panelClass;
		config.overlayConfig.positionStrategy
			= positionStrategy;

		const dialogRef: CUBDialogRef
			= this._modalService.create(
				config,
				null,
				CUBDialogRef
			) as CUBDialogRef;

		dialogRef
		.afterOpened()
		.subscribe(() => {
			addSlideAnimation(
				dialogRef,
				() => {
					dialogRef
					.overlayRef
					.addPanelClass(
						'cub-dialog-pane--opened'
					);
				}
			);
		});

		const container: CUBDialogContainerComponent
			= dialogRef.open(
				new ComponentPortal(
					CUBDialogContainerComponent,
					config.viewContainerRef
				) as any
			) as CUBDialogContainerComponent;

		container.ref = dialogRef;

		if ( _.isFunction( component ) ) {
			const instance: CUBDialogInstance
				= container.attachComponentPortal(
					new ComponentPortal(
						component as any,
						container.viewContainerRef,
						Injector.create({
							parent: this._injector,
							providers: [
								{
									provide: CUB_DIALOG_CONTEXT,
									useValue: context,
								},
								{
									provide: CUB_DIALOG_REF,
									useValue: dialogRef,
								},
							],
						})
					)
				).instance;

			dialogRef.forwardInstance( instance );
		} else {
			container.attachTemplatePortal(
				new TemplatePortal(
					component,
					container.viewContainerRef,
					{
						dialogRef,
						context,
					}
				)
			);
		}

		return dialogRef;
	}

}
