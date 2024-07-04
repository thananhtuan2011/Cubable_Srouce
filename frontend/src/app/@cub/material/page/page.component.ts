import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	HostBinding,
	Input,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';

import { CoerceBoolean } from 'angular-core';

import {
	CUBScrollBarDirective,
	CUBScrollBarMode
} from '../scroll-bar';

import { CUBPageHeaderDirective } from './page-header.directive';
import { CUBPageContentDirective } from './page-content.directive';

@Component({
	selector		: 'cub-page',
	templateUrl		: './page.pug',
	styleUrls		: [ './page.scss' ],
	host			: { class: 'cub-page' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBPageComponent {

	@HostBinding( 'class.cub-page--stretch' )
	get classStretch(): boolean { return this.stretch; }

	@ViewChild( CUBScrollBarDirective ) public scrollBar: CUBScrollBarDirective;

	@ContentChild( CUBPageHeaderDirective ) public pageHeader: CUBPageHeaderDirective;
	@ContentChild( CUBPageContentDirective ) public pageContent: CUBPageContentDirective;

	@Input() @CoerceBoolean() public stretch: boolean;
	@Input() @CoerceBoolean() public suppressScrollX: boolean;
	@Input() @CoerceBoolean() public suppressScrollY: boolean;
	@Input() public scrollBarMode: CUBScrollBarMode;

}
