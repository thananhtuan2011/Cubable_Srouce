import {
	Directive
} from '@angular/core';

import {
	CUBScrollBar
} from './scroll-bar';

@Directive({
	selector: '[cubScrollBar]',
	exportAs: 'cubScrollBar',
})
export class CUBScrollBarDirective
	extends CUBScrollBar {}
