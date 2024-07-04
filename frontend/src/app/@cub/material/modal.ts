import {
	ElementRef,
	inject,
	Injectable
} from '@angular/core';
import {
	Portal
} from '@angular/cdk/portal';
import {
	isObservable,
	Observable,
	of,
	Subject
} from 'rxjs';
import {
	take,
	takeUntil
} from 'rxjs/operators';

import {
	CUBOverlay2Service,
	CUBOverlayConfig,
	CUBOverlayRef
} from './overlay2';

export type CUBModalConfig = {
	disableClose?: boolean;
	overlayConfig?: CUBOverlayConfig;
};

export interface CUBIModalInstance {
	onBeforeClose?():
		boolean | Observable<boolean>;
	onClosed?(): any;
}

export type CUBModalInstance = CUBIModalInstance;

export class CUBModalRef {

	private readonly _opened$: Subject<void>
		= new Subject<void>();
	private readonly _closed$: Subject<any>
		= new Subject<any>();

	private _config: CUBModalConfig;
	private _overlayRef: CUBOverlayRef<CUBModalInstance>;
	private _overlayService: CUBOverlay2Service;
	private _instance: CUBModalInstance;
	private _isCloseDisabled: boolean;
	private _afterOpened: Observable<void>;
	private _afterClosed: Observable<any>;

	get config(): CUBModalConfig {
		return this._config;
	}

	get overlayRef(): CUBOverlayRef<CUBModalInstance> {
		return this._overlayRef;
	}

	get origin(): ElementRef {
		return this._overlayRef.origin;
	}

	get instance(): CUBModalInstance {
		return this._instance
			|| this._overlayRef.instance;
	}

	get isOpened(): boolean {
		return this._overlayRef.isAttached;
	}

	get isClosedDisabled(): boolean {
		return this._isCloseDisabled;
	}

	get canClose$(): Observable<boolean> {
		const instance: CUBModalInstance
			= this.instance;

		if ( !instance ) {
			return of( true );
		}

		const canClose$: boolean | Observable<boolean>
			= instance.onBeforeClose?.();

		return (
			isObservable( canClose$ )
				? canClose$
				: of( canClose$ )
		).pipe( take( 1 ) );
	}

	constructor(
		config: CUBModalConfig,
		origin: null | ElementRef | HTMLElement,
		_overlayService: CUBOverlay2Service
	) {
		this._overlayService = _overlayService;

		this._config = config;
		this._overlayRef
			= this._overlayService.create(
				config.overlayConfig,
				origin
			);
		this._isCloseDisabled
			= config.disableClose;

		this
		._overlayRef
		.onDisposed()
		.subscribe(() => {
			this._opened$.complete();
			this._closed$.complete();
		});

		this
		._overlayRef
		.onAttached()
		.subscribe(() => {
			this._opened$.next();
		});

		this
		._overlayRef
		.onDetached()
		.subscribe(() => {
			const instance: CUBModalInstance
				= this.instance;

			this._closed$.next(
				instance.onClosed?.()
			);
		});

		this
		._overlayRef
		.onKeydown()
		.subscribe(( e: KeyboardEvent ) => {
			if ( this._isCloseDisabled ) {
				return;
			}

			switch ( e.key ) {
				case 'Escape':
					e.stopPropagation();
					e.preventDefault();

					this.close();
					break;
			}
		});

		this
		._overlayRef
		.onOutsideClicked()
		.subscribe(() => {
			if ( this._isCloseDisabled ) {
				return;
			}

			this.close();
		});
	}

	public forwardInstance(
		instance: CUBModalInstance
	) {
		this._instance = instance;
	}

	public updateConfig(
		config: CUBModalConfig
	) {
		this._config = {
			...this._config,
			...config,
		};

		this._isCloseDisabled
			= this._config.disableClose;

		this._overlayRef.updateConfig(
			this.config.overlayConfig
		);
	}

	public enableClose() {
		this._isCloseDisabled = false;
	}

	public disableClose() {
		this._isCloseDisabled = true;
	}

	public open(
		portal: Portal<CUBModalInstance>
	): CUBModalInstance {
		return this
		._overlayRef
		.attach( portal );
	}

	public close() {
		this
		.canClose$
		.subscribe(( canClose: boolean ) => {
			if ( canClose === false ) {
				return;
			}

			this._overlayRef.dispose();
		});
	}

	public afterOpened(): Observable<void> {
		return this._afterOpened
			||= this._opened$.pipe(
				takeUntil(
					this
					._overlayRef
					.config
					.destroyed$
				),
				takeUntil(
					this
					._overlayRef
					.onDisposed()
				)
			);
	}

	public afterClosed(): Observable<any> {
		return this._afterClosed
			||= this._closed$.pipe(
				takeUntil(
					this
					._overlayRef
					.config
					.destroyed$
				),
				takeUntil(
					this
					._overlayRef
					.onDisposed()
				)
			);
	}

}

@Injectable({
	providedIn: 'root',
})
export class CUBModalService {

	private readonly _overlayService: CUBOverlay2Service
		= inject( CUBOverlay2Service );

	public create(
		config: CUBModalConfig,
		origin: null | ElementRef | HTMLElement = null,
		ctor: typeof CUBModalRef = CUBModalRef
	): CUBModalRef {
		return new ctor(
			config,
			origin,
			this._overlayService
		);
	}

}
