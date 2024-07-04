import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	Input,
	NgZone,
	OnDestroy,
	Output,
	ViewChild,
	ViewEncapsulation,
	inject
} from '@angular/core';

import {
	CoerceBoolean,
	CoerceNumber,
	DefaultValue
} from '@core';

export enum CUBShowMoreVariant {
	EndOfLine = 'endOfLine',
	BreakLine = 'breakLine',
}

@Component({
	selector: 'cub-show-more, [cubShowMore]',
	templateUrl: './show-more.pug',
	styleUrls: [ './show-more.scss' ],
	host: { class: 'cub-show-more' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBShowMoreComponent
implements AfterViewInit, OnDestroy {

	@ViewChild( 'showMoreContent' )
	public showMoreContent: ElementRef<any>;

	@HostBinding( 'style.--limit-line' )
	@Input() @CoerceNumber()
	public limitLine: number;
	@Input() @DefaultValue()
	public variant: CUBShowMoreVariant
			= CUBShowMoreVariant.BreakLine;
	@Input() @CoerceBoolean()
	public opened: boolean;

	@Output() public openedChange: EventEmitter<boolean>
		= new EventEmitter<boolean>();

	protected readonly variantType: typeof CUBShowMoreVariant
		= CUBShowMoreVariant;

	protected isHidden: boolean = false;

	private readonly _ngZone: NgZone
		= inject( NgZone );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	private _resizeObserver: ResizeObserver;

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		this._resizeObserver
			= new ResizeObserver(
				this._detect.bind( this )
			);

		this
		._resizeObserver
		.observe(
			this.showMoreContent.nativeElement
		);
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		this._resizeObserver.disconnect();
	}

	/**
	 * @return {void}
	 */
	public toggle() {
		this
		._ngZone
		.run(
			() => {
				this.opened = !this.opened;

				this.openedChange.emit( this.opened );
			}
		);
	}

	/**
	 * @return {void}
	 */
	private _detect() {
		const element: HTMLElement
			= this.showMoreContent.nativeElement;

		if ( !element ) return;

		this
		._ngZone
		.run(
			() => {
				this.isHidden
					= element.offsetHeight < element.scrollHeight
					|| element.offsetWidth < element.scrollWidth;

				this._cdRef.markForCheck();
			}
		);
	}

}
