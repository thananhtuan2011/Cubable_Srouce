import {
	Component, Input, TemplateRef,
	ViewChild, ContentChild, ChangeDetectionStrategy,
	OnChanges
} from '@angular/core';
import { Subject } from 'rxjs';

import { CoerceBoolean, AliasOf } from '@core';

import { WGCTabHeaderDirective } from '../tab-header/wgc-tab-header.directive';
import { WGCTabContentDirective } from '../tab-content/wgc-tab-content.directive';

@Component({
	selector		: 'wgc-tab',
	templateUrl		: './wgc-tab.pug',
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCTabComponent implements OnChanges {

	@ViewChild( TemplateRef, { static: true } ) public templateRef: TemplateRef<any>;

	@ContentChild( WGCTabHeaderDirective ) public tabHeader: WGCTabContentDirective;
	@ContentChild( WGCTabContentDirective ) public tabContent: WGCTabContentDirective;

	@Input() public data: any;
	@Input() public label: string;
	@Input() public icon: string;
	@Input( 'class' ) public classes: string;
	@Input() @AliasOf( 'classes' ) public ngClass: string;
	@Input() @CoerceBoolean() public disabled: boolean;

	public changes$: Subject<void> = new Subject<void>();

	get header(): TemplateRef<any> { return this.tabHeader?.templateRef; }
	get content(): TemplateRef<any> { return this.tabContent?.templateRef || this.templateRef; }

	/**
	 * @constructor
	 */
	ngOnChanges() {
		this.changes$.next();
	}

}
