import {
	Pipe,
	PipeTransform,
	inject
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import moment, {
	Moment,
	isMoment
} from 'moment-timezone';

@Pipe({
	name: 'cubFromNow',
	standalone: true,
})
export class CUBFromNowPipe implements PipeTransform {

	private readonly _translateService: TranslateService
		= inject( TranslateService );

	/**
	 * Displays timeago or relative time from now
	 * @param input
	 * @returns timeago or relative time
	 */
	public transform(
		input: string | Moment
	): string {
		if ( !input ) {
			return;
		}

		const output: Moment
			= isMoment( input )
				? input
				: moment( input );

		if ( !output.isValid() ) {
			return;
		}

		const now: Moment = moment();
		const diff: number = now.diff( output, 's' );
		let str: string;

		if ( diff < 60 ) { // < 1m
			str = this._translateService.instant(
				'CUB.LABEL.JUST_NOW'
			);
		} else if ( diff < 60 * 60 ) { // < 1h
			const count: number
				= Math.ceil( diff / 60 );

			str = this._translateService.instant(
				'CUB.LABEL.MINUTE_COUNT',
				{ count }
			);
		} else if ( diff < 60 * 60 * 24 ) { // < 1d
			const count: number
				= Math.ceil( diff / 60 / 60 );

			str = this._translateService.instant(
				'CUB.LABEL.HOUR_COUNT',
				{ count }
			);
		} else if ( diff < 60 * 60 * 24 * 7 ) { // < 7d
			let count: number
				= diff / 60 / 60 / 24;

			const countCompare: number
				= Math.ceil( count );

			count =
				count < countCompare
					? Math.trunc( count )
					: Math.round( count );

			str = this._translateService.instant(
				'CUB.LABEL.DAY_COUNT',
				{ count }
			);
		}

		return str || output.format( 'DD MMMM, YYYY' );
	}

}
