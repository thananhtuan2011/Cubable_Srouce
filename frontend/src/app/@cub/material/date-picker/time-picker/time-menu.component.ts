import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Output,
	ViewEncapsulation
} from '@angular/core';
import _ from 'lodash';

type TimeGap = {
	hour: number;
	minute: number;
	text: string;
};

export const createTimeString:
	ReturnType<typeof _.memoize>
	= _.memoize(
		function(
			hour: number,
			minute: number
		): string {
			const hourStr: string
				= _.padStart(
					String( hour ),
					2,
					'0'
				);
			const minuteStr: string
				= _.padStart(
					String( minute ),
					2,
					'0'
				);

			return `${hourStr}:${minuteStr}`;
		},
		function(
			hour: number,
			minute: number
		): string {
			return `${hour}-${minute}`;
		}
	);

export type CUBTime
	= Pick<TimeGap, 'hour' | 'minute'>;

const TIME_GAPS: TimeGap[] = _.map(
	_.range( 0, 48 ),
	( i: number ): TimeGap => {
		const hour: number
			= Math.floor( i / 2 );
		const minute: number
			= Math.floor(
				i % 2 === 0 ? 0 : 30
			);

		return {
			hour,
			minute,
			text: createTimeString(
				hour,
				minute
			),
		};
	}
);

@Component({
	selector: 'cub-time-menu',
	templateUrl: './time-menu.pug',
	host: { class: 'cub-time-menu' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBTimeMenuComponent {

	@Output() public picked: EventEmitter<CUBTime>
		= new EventEmitter<CUBTime>();

	protected readonly TIME_GAPS: TimeGap[]
		= TIME_GAPS;

	/**
	 * @param {TimeGap=} timeGap
	 * @return {void}
	 */
	protected pickTime(
		timeGap: TimeGap
	) {
		this.picked.emit(
			_.omit( timeGap, 'text' )
		);
	}

}
