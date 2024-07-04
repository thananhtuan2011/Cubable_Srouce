import { NgModule } from '@angular/core';

import { CoreModule, FormModule } from '@core';

import { WGCButtonModule } from '../wgc-button';
import { WGCColorPickerModule } from '../wgc-color-picker';
import { WGCTooltipModule } from '../wgc-tooltip';
import { WGCSliderModule } from '../wgc-slider';
import { WGCTruncateModule } from '../wgc-truncate';

import { WGCFormFieldComponent } from './form-field/wgc-form-field.component';
import { WGCFormFieldErrorDirective } from './form-field-error/wgc-form-field-error.directive';
import { WGCFormFieldInputDirective } from './form-field-input/wgc-form-field-input.directive';
import { WGCFormFieldLabelDirective } from './form-field-label/wgc-form-field-label.directive';
import { WGCFormFieldHintDirective } from './form-field-hint/wgc-form-field-hint.directive';
import { WGCFormFieldPrefixDirective } from './form-field-prefix/wgc-form-field-prefix.directive';
import { WGCFormFieldSuffixDirective } from './form-field-suffix/wgc-form-field-suffix.directive';
import { WGCFormFieldDescriptionDirective } from './form-field-description/wgc-form-field-description.directive';

@NgModule({
	imports: [
		FormModule, CoreModule,

		WGCButtonModule, WGCColorPickerModule, WGCTooltipModule,
		WGCSliderModule, WGCTruncateModule,
	],
	exports: [
		WGCFormFieldComponent, WGCFormFieldErrorDirective, WGCFormFieldInputDirective,
		WGCFormFieldLabelDirective, WGCFormFieldHintDirective, WGCFormFieldPrefixDirective,
		WGCFormFieldSuffixDirective, WGCFormFieldDescriptionDirective,
	],
	declarations: [
		WGCFormFieldComponent, WGCFormFieldErrorDirective, WGCFormFieldInputDirective,
		WGCFormFieldLabelDirective, WGCFormFieldHintDirective, WGCFormFieldPrefixDirective,
		WGCFormFieldSuffixDirective, WGCFormFieldDescriptionDirective,
	],
	providers: [],
})
export class WGCFormFieldModule {}
