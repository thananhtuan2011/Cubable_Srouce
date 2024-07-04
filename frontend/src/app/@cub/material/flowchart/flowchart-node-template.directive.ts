import {
	Directive,
	inject,
	Input,
	TemplateRef
} from '@angular/core';

@Directive({
	selector: '[cubFlowchartNodeTemplate]',
	exportAs: 'cubFlowchartNodeTemplate',
})
export class CUBFlowchartNodeTemplateDirective {

	@Input() public type: any;

	public readonly templateRef: TemplateRef<any>
		= inject( TemplateRef );

}
