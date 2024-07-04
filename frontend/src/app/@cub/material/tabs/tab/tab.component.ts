import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	Input,
	TemplateRef,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';

import {
	AliasOf,
	CoerceBoolean
} from 'angular-core';

import {
	CUBTabContentDirective
} from './tab-content.directive';
import {
	CUBTabHeaderDirective
} from './tab-header.directive';

@Component({
	selector		: 'cub-tab',
	template		: '<ng-template><ng-content></ng-content></ng-template>',
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBTabComponent {

	@Input() public label: string;
	@Input() public leadingIcon: string;
	@Input() public trailingIcon: string;
	@Input() @AliasOf( 'leadingIcon' )
	public icon: string;
	@Input() @CoerceBoolean()
	public disabled: boolean;

	@ViewChild( TemplateRef, { static: true } )
	protected readonly templateRef: TemplateRef<any>;
	@ContentChild( CUBTabHeaderDirective )
	protected readonly tabHeader: CUBTabHeaderDirective;
	@ContentChild( CUBTabContentDirective )
	protected readonly tabContent: CUBTabContentDirective;

	get header(): TemplateRef<any> {
		return this.tabHeader?.templateRef;
	}

	get content(): TemplateRef<any> {
		return this.tabContent?.templateRef
			|| this.templateRef;
	}

}
