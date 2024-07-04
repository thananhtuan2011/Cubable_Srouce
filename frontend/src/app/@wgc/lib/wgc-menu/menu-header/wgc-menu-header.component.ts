import {
	Component, TemplateRef, ViewChild,
	ContentChild, Input, ChangeDetectionStrategy,
	AfterViewInit, AfterContentInit, ChangeDetectorRef,
	OnDestroy
} from '@angular/core';

import { WGCMenuHeaderTitleComponent } from '../menu-header-title/wgc-menu-header-title.component';

import { WGCMenuHeaderDirective } from './wgc-menu-header.directive';

@Component({
	selector		: 'wgc-menu-header',
	templateUrl		: './wgc-menu-header.pug',
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCMenuHeaderComponent implements AfterViewInit, AfterContentInit, OnDestroy {

	@ViewChild( TemplateRef, { static: true } ) private _templateRef: TemplateRef<any>;

	@ContentChild( WGCMenuHeaderDirective ) private _menuHeader: WGCMenuHeaderDirective;
	@ContentChild( WGCMenuHeaderTitleComponent ) public menuHeaderTitle: WGCMenuHeaderTitleComponent;

	public templateRef: TemplateRef<any> = null;

	private _classList: string = null;

	@Input( 'class' )
	get classList(): string { return this._classList; }
	set classList( classes: string ) { this._classList = classes; }

	/**
	 * @constructor
	 * @param {ChangeDetectorRef} _cdRef
	 */
	constructor( private _cdRef: ChangeDetectorRef ) {}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		setTimeout( () => {
			this.templateRef ||= this._templateRef;

			this._cdRef.markForCheck();
		} );
	}

	/**
	 * @constructor
	 */
	ngAfterContentInit() {
		setTimeout( () => {
			this.templateRef ||= this._menuHeader?.templateRef;

			this._cdRef.markForCheck();
		} );
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		this.templateRef = null;
	}

}
