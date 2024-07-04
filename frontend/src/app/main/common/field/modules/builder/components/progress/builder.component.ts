import {
	ChangeDetectionStrategy,
	Component,
	inject,
	OnInit
} from '@angular/core';
import {
	FormBuilder,
	FormControlStatus,
	FormGroup
} from '@angular/forms';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	ProgressField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Unsubscriber()
@Component({
	selector: 'progress-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'progress-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressFieldBuilderComponent
	extends FieldBuilder<ProgressField>
	implements OnInit {

	protected internalField: ProgressField;
	protected progressRangeForm: FormGroup;

	private readonly _fb: FormBuilder
		= inject( FormBuilder );

	get startValue(): number {
		return parseFloat(
			this
			.progressRangeForm
			.controls
			.startValue
			.value || _.toPercent(
				this.internalField.startValue
			)
		);
	}

	get endValue(): number {
		return parseFloat(
			this
			.progressRangeForm
			.controls
			.endValue
			.value || _.toPercent(
				this.internalField.endValue
			)
		);
	}

	get isRangeValid(): boolean {
		return this.startValue
				< this.endValue;
	}

	override ngOnInit() {
		super.ngOnInit();

		this.progressRangeForm
			= this._fb.group({
				startValue: undefined,
				endValue: undefined,
			});

		this
		.progressRangeForm
		.valueChanges
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(() => {
			this.canSubmit$.next(
				this.isRangeValid
			);
		});

		this
		.progressRangeForm
		.statusChanges
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(
			( status: FormControlStatus ) => {
				this.canSubmit$.next(
					status === 'VALID'
						&& this.isRangeValid
				);
			}
		);
	}

	/**
	 * @param {string} value
	 * @return {void}
	 */
	protected onStartValueChanged(
		value: string
	) {
		if ( this.progressRangeForm.invalid ) {
			return;
		}

		const newValue: number
			= parseFloat( value );

		this.internalField.startValue
			= _.isInteger( newValue )
				? newValue / 100
				: null;
	}

	/**
	 * @param {string} value
	 * @return {void}
	 */
	protected onEndValueChanged(
		value: string
	) {
		if ( this.progressRangeForm.invalid ) {
			return;
		}

		const newValue: number
			= parseFloat( value );

		this.internalField.endValue
			= _.isInteger( newValue )
				? newValue / 100
				: null;
	}

	/**
	 * @param {boolean} isAuto
	 * @return {void}
	 */
	protected onSwitchMode(
		isAuto: boolean
	) {
		if ( this.internalField.isAuto
				=== isAuto ) {
			return;
		}

		this
		.internalField
		.isAuto = isAuto;

		if ( isAuto ) {
			this.canSubmit$.next( true );

			this.validateInitialValue();
			return;
		}

		this.internalField.startValue ||= 0;
		this.internalField.endValue ||= 1;

		this
		.progressRangeForm
		.updateValueAndValidity();
	}

	/**
	 * @return {void}
	 */
	protected override done() {
		if ( this.internalField.isAuto ) {
			this.internalField.startValue = 0;
			this.internalField.endValue = 1;
		}

		super.done();
	}

}
