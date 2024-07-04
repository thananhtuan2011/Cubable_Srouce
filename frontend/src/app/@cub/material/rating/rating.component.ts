import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Input,
	OnChanges,
	OnInit,
	SimpleChanges,
	ViewEncapsulation
} from '@angular/core';
import _ from 'lodash';

import {
	CoerceBoolean,
	CoerceNumber,
	DefaultValue
} from 'angular-core';

import {
	CUB_VALUE_ACCESSOR,
	CUBValueAccessor
} from '../value-accessor';

@Component({
	selector: 'cub-rating',
	templateUrl: './rating.pug',
	styleUrls: [ './rating.scss' ],
	host: { class: 'cub-rating' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		CUB_VALUE_ACCESSOR(
			CUBRatingComponent
		),
	],
})
export class CUBRatingComponent
	extends CUBValueAccessor<number>
	implements OnChanges, OnInit {

	@Input() @DefaultValue() @CoerceNumber()
	public range: number = 10;
	@Input() @DefaultValue()
	public emoji: string = '2B50';
	@Input() @CoerceBoolean()
	public readonly: boolean;

	@HostBinding( 'attr.disabled' )
	get attrDisabled(): boolean {
		return this.isDisabled
			|| undefined;
	}

	@HostBinding( 'attr.readonly' )
	get attrReadonly(): boolean {
		return this.readonly
			|| undefined;
	}

	get canEdit(): boolean {
		return !this.isDisabled
			&& !this.readonly;
	}

	protected points: number[];
	protected selectingPoint: number;

	ngOnChanges(
		changes: SimpleChanges
	) {
		if ( !changes.range ) {
			return;
		}

		this._generatePoints();
	}

	ngOnInit() {
		this._generatePoints();
	}

	/**
	 * @param {number} value
	 * @return {void}
	 */
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	override writeValue( value: number ) {
		super.writeValue( value );

		this._generatePoints();
	}

	/**
	 * @param {number=} point
	 * @return {void}
	 */
	protected selectPoint(
		point: number
	) {
		this.selectingPoint = point;
	}

	/**
	 * @param {number=} point
	 * @return {void}
	 */
	protected setPoint(
		point: number
	) {
		this.writeValue( point );
		this.onChange( point );
	}

	/**
	 * @return {void}
	 */
	private _generatePoints() {
		const range: number
			= Number( this.range );
		const newRange: number
			= Math.max( this.value, range );

		this.points
			= _.range( 1, newRange + 1 );
	}

}
