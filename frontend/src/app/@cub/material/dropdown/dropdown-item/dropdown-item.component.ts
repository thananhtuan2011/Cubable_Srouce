import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	Directive,
	forwardRef,
	Input,
	TemplateRef,
	ViewEncapsulation
} from '@angular/core';

import {
	CoerceBoolean
} from 'angular-core';

import {
	CUBIconColor
} from '../../icon';

@Directive({
	selector: 'ng-template[cubDropdownItemLabel]',
	exportAs: 'cubDropdownItemLabel',
	providers: [
		{
			provide: CUBDropdownItemLabelDirective,
			useExisting: forwardRef( () => TemplateRef<any> ),
		},
	],
})
export class CUBDropdownItemLabelDirective {}

@Directive({
	selector: 'ng-template[cubDropdownItemDescription]',
	exportAs: 'cubDropdownItemDescription',
	providers: [
		{
			provide: CUBDropdownItemDescriptionDirective,
			useExisting: forwardRef( () => TemplateRef<any> ),
		},
	],
})
export class CUBDropdownItemDescriptionDirective {}


@Component({
	selector: 'cub-dropdown-item',
	template: '',
	host: { class: 'cub-dropdown-item' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBDropdownItemComponent {

	@Input() public value: any;
	@Input() public label: string;
	@Input() public description: string;
	@Input() public icon: string;
	@Input() public iconColor: string | CUBIconColor;
	@Input() public iconSize: string;
	@Input() public color: string;
	@Input() public metadata: any;
	@Input() @CoerceBoolean()
	public disabled: boolean;

	public isSelected: boolean;
	public isNotAvailable: boolean;

	@ContentChild( CUBDropdownItemLabelDirective )
	public readonly labelTemplate: CUBDropdownItemLabelDirective;
	@ContentChild( CUBDropdownItemDescriptionDirective )
	public readonly descriptionTemplate: CUBDropdownItemDescriptionDirective;

	get isBlank(): boolean {
		return this.value === undefined
			|| this.value === null;
	}

}
