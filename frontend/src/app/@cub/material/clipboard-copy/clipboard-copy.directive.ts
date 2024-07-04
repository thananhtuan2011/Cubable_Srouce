import {
	Directive,
	ElementRef,
	EventEmitter,
	HostListener,
	inject,
	Input,
	OnDestroy,
	Output
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import _ from 'lodash';

import {
	CoerceBoolean,
	CoerceNumber,
	DefaultValue
} from 'angular-core';

import {
	CUBTooltipRef,
	CUBTooltipService
} from '../tooltip';

@Directive({
	selector: '[cubClipboardCopy]',
	exportAs: 'cubClipboardCopy',
})
export class CUBClipboardCopyDirective implements OnDestroy {

	@Input( 'cubClipboardCopy' )
	public clipboardCopy: string;
	@Input() public copiedMessage: string;
	@Input() @CoerceBoolean()
	public disabled: boolean;
	@Input() @DefaultValue() @CoerceNumber()
	public displayTime: number = 1500;

	@Output() public copied: EventEmitter<MouseEvent>
		= new EventEmitter<MouseEvent>();

	public isCopied: boolean;

	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _translateService: TranslateService
		= inject( TranslateService );
	private readonly _tooltipService: CUBTooltipService
		= inject( CUBTooltipService );

	private _timeout: NodeJS.Timeout;

	@HostListener( 'click', [ '$event' ] )
	protected onClick( e: MouseEvent ) {
		if ( this.disabled ) return;

		navigator.clipboard.writeText(
			_.toString( this.clipboardCopy )
		);

		this.copied.emit( e );

		this._openCopiedTooltip();
	}

	ngOnDestroy() {
		clearTimeout( this._timeout );
	}

	/**
	 * @return {void}
	 */
	private _openCopiedTooltip() {
		if ( this.isCopied ) return;

		this.isCopied = true;
		this.copiedMessage
			||= this._translateService.instant( 'CUB.LABEL.COPIED' );

		const tooltipRef: CUBTooltipRef
			= this._tooltipService.open(
				this._elementRef,
				this.copiedMessage
			);

		this._timeout = setTimeout(
			() => {
				this.isCopied = false;

				tooltipRef.close();
			},
			this.displayTime
		);
	}

}
