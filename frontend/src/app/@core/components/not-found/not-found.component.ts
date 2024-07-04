import {
	Component, Input, SimpleChanges,
	OnChanges, OnInit, ChangeDetectorRef,
	OnDestroy, HostBinding, ChangeDetectionStrategy
} from '@angular/core';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { Subscription } from 'rxjs';
import _ from 'lodash';

import {
	Unsubscriber, untilCmpDestroyed, destroyCmp,
	DefaultValue, CoerceNumber, CoerceArray
} from 'angular-core';

export type INotFoundSize = 'normal' | 'large';
export type INotFoundMode = 'empty' | 'error' | 'search' | 'custom';

export interface INotFoundData {
	name?: string;
	size?: INotFoundSize;
	mode?: INotFoundMode;
	debounceTime?: number;
	emptyImage?: string;
	emptyImageSize?: number[];
	emptyTitle?: string;
	emptyDescription?: string;
	errorImage?: string;
	errorImageSize?: number[];
	errorTitle?: string;
	errorDescription?: string;
}

@Unsubscriber()
@Component({
	selector		: 'not-found',
	templateUrl		: './not-found.pug',
	styleUrls		: [ './not-found.scss' ],
	host			: { class: 'not-found' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent implements OnChanges, OnInit, OnDestroy {

	@HostBinding( 'class.not-found--large' )
	get classLarge(): boolean { return this.size === 'large'; }

	@Input() public name: string;
	@Input() @DefaultValue() public size: INotFoundSize = 'normal';
	@Input() @DefaultValue() public mode: INotFoundMode = 'empty';
	@Input() @DefaultValue() @CoerceNumber() public debounceTime: number = 500;
	@Input() public emptyImage: string;
	@Input() @CoerceArray() public emptyImageSize: number[];
	@Input() public emptyTitle: string;
	@Input() public emptyDescription: string;
	@Input() public errorImage: string;
	@Input() @CoerceArray() public errorImageSize: number[];
	@Input() public errorTitle: string;
	@Input() public errorDescription: string;
	@Input() public customImage: string;
	@Input() @CoerceArray() public customImageSize: number[];
	@Input() public customTitle: string;
	@Input() public customDescription: string;

	public loaded: boolean;
	public image: string;
	public imageSize: number[];

	private _loaderValue$$: Subscription;
	private _setLoadedDebounce: ReturnType<typeof _.debounce>
		= _.debounce( this._setLoaded.bind( this ), this.debounceTime );

	/**
	 * @constructor
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {LoadingBarService} _loader
	 */
	constructor( private _cdRef: ChangeDetectorRef, private _loader: LoadingBarService ) {}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.mode ) {
			this._changeState();

			!changes.mode.firstChange && this._init();
		}
	}

	/**
	 * @constructor
	 */
	ngOnInit() {
		this._init();

		this._setLoadedDebounce.cancel();

		this._setLoadedDebounce = _.debounce( this._setLoaded.bind( this ), this.debounceTime );

		this._changeState();
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		this._setLoadedDebounce.cancel();
	}

	/**
	 * @return {void}
	 */
	private _init() {
		switch ( this.mode ) {
			case 'empty':
				this.image = this.emptyImage ??= 'assets/images/icons/empty.webp';
				this.imageSize = [ this.emptyImageSize?.[ 0 ], this.emptyImageSize?.[ 1 ] || this.emptyImageSize?.[ 0 ] ];
				break;
			case 'error':
				this.image = this.errorImage ??= 'assets/images/icons/error.webp';
				this.imageSize = [ this.errorImageSize?.[ 0 ], this.errorImageSize?.[ 1 ] || this.errorImageSize?.[ 0 ] ];
				break;
			case 'custom':
				this.image = this.customImage;
				this.imageSize = [ this.customImageSize?.[ 0 ], this.customImageSize?.[ 1 ] || this.customImageSize?.[ 0 ] ];
				break;
		}
	}

	/**
	 * @return {void}
	 */
	private _changeState() {
		this.loaded = false;

		this._loaderValue$$?.unsubscribe();
		this._setLoadedDebounce.cancel();
		this._setLoadedDebounce();

		this._loaderValue$$ = this._loader.value$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( this._setLoadedDebounce.bind( this ) );
	}

	/**
	 * @param {number=} progress
	 * @return {void}
	 */
	private _setLoaded( progress: number = 0 ) {
		this.loaded = progress === 0 || progress === 100;

		this.loaded && destroyCmp( this );
		this._cdRef.markForCheck();
	}

}
