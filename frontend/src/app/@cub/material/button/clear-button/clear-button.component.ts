import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	HostBinding,
	HostListener,
	inject,
	Input,
	ViewEncapsulation
} from '@angular/core';

import {
	CoerceCssPixel
} from 'angular-core';

@Component({
	selector: 'button[cubClearButton]',
	templateUrl: './clear-button.pug',
	styleUrls: [ './clear-button.scss' ],
	host: { class: 'cub-clear-button' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBClearButtonComponent {

	@HostBinding( 'style.--clear-button-size' )
	@Input() @CoerceCssPixel()
	public size: string;

	@HostBinding( 'attr.type' )
	protected readonly attrType: string = 'button';

	private readonly _elementRef: ElementRef
		= inject( ElementRef );

	@HostListener( 'keydown.enter', [ '$event' ] )
	@HostListener( 'keydown.space', [ '$event' ] )
	protected onKeydownEnterAndSpace(
		e: KeyboardEvent
	) {
		if ( this._elementRef.nativeElement
				!== document.activeElement ) {
			return;
		}

		e.preventDefault();
	}

}
