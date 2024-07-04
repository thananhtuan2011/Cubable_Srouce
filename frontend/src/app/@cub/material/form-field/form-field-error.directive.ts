import {
	Directive,
	forwardRef,
	inject,
	Input,
	TemplateRef
} from '@angular/core';

@Directive({
	selector: '[cubFormFieldError]',
	exportAs: 'cubFormFieldError',
})
export class CUBFormFieldErrorDirective {}

@Directive({
	selector: 'ng-template[cubFormFieldError]',
	exportAs: 'cubFormFieldError',
	providers: [
		{
			provide:
				CUBFormFieldErrorDirective,
			useExisting: forwardRef(
				() => CUBFormFieldErrorTemplateDirective
			),
		},
	],
})
export class CUBFormFieldErrorTemplateDirective {

	@Input( 'cubFormFieldError' )
	public key: string;

	public readonly templateRef: TemplateRef<any>
		= inject( TemplateRef );

}
