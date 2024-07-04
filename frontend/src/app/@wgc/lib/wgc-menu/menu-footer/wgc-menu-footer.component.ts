import {
	Component, TemplateRef, ViewChild,
	ContentChild, Input, ChangeDetectionStrategy,
	AfterViewInit, AfterContentInit, ChangeDetectorRef,
	OnDestroy
} from '@angular/core';

import { WGCMenuFooterDirective } from './wgc-menu-footer.directive';

@Component({
	selector		: 'wgc-menu-footer',
	templateUrl		: './wgc-menu-footer.pug',
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCMenuFooterComponent implements AfterViewInit, AfterContentInit, OnDestroy {

	@ViewChild( TemplateRef, { static: true } ) private _templateRef: TemplateRef<any>;

	@ContentChild( WGCMenuFooterDirective ) private _menuFooter: WGCMenuFooterDirective;

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
			this.templateRef ||= this._menuFooter?.templateRef;

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
