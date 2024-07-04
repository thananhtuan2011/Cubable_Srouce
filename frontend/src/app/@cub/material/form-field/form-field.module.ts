import {
	NgModule
} from '@angular/core';
import {
	A11yModule
} from '@angular/cdk/a11y';

import {
	CoreModule
} from 'angular-core';

import {
	CUBControlErrorsPipe
} from '../../pipes';

import {
	CUBButtonModule
} from '../button';
import {
	CUBIconModule
} from '../icon';
import {
	CUBTooltipModule
} from '../tooltip';

import {
	CUBFormFieldComponent
} from './form-field.component';
import {
	CUBFormFieldDisplayDirective
} from './form-field-display.directive';
import {
	CUBFormFieldErrorDirective,
	CUBFormFieldErrorTemplateDirective
} from './form-field-error.directive';
import {
	CUBFormFieldHelpTextDirective
} from './form-field-help-text.directive';
import {
	CUBFormFieldInputDirective
} from './form-field-input.directive';
import {
	CUBFormFieldLabelDirective
} from './form-field-label.directive';
import {
	CUBFormFieldPlaceholderDirective
} from './form-field-placeholder.directive';
import {
	CUBFormFieldPrefixDirective
} from './form-field-prefix.directive';
import {
	CUBFormFieldSuffixDirective
} from './form-field-suffix.directive';

@NgModule({
	imports: [
		A11yModule,

		CoreModule,

		CUBControlErrorsPipe,

		CUBButtonModule,
		CUBIconModule,
		CUBTooltipModule,
	],
	exports: [
		CUBControlErrorsPipe,

		CUBFormFieldComponent,
		CUBFormFieldDisplayDirective,
		CUBFormFieldErrorDirective,
		CUBFormFieldErrorTemplateDirective,
		CUBFormFieldHelpTextDirective,
		CUBFormFieldInputDirective,
		CUBFormFieldLabelDirective,
		CUBFormFieldPlaceholderDirective,
		CUBFormFieldPrefixDirective,
		CUBFormFieldSuffixDirective,
	],
	declarations: [
		CUBFormFieldComponent,
		CUBFormFieldDisplayDirective,
		CUBFormFieldErrorDirective,
		CUBFormFieldErrorTemplateDirective,
		CUBFormFieldHelpTextDirective,
		CUBFormFieldInputDirective,
		CUBFormFieldLabelDirective,
		CUBFormFieldPlaceholderDirective,
		CUBFormFieldPrefixDirective,
		CUBFormFieldSuffixDirective,
	],
	providers: [],
})
export class CUBFormFieldModule {}
