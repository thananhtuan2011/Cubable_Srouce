import {
	Injectable,
	inject
} from '@angular/core';
import {
	untilCmpDestroyed
} from '@core';
import _ from 'lodash';
import {
	of
} from 'rxjs';
import {
	map
} from 'rxjs/operators';

import {
	BoardFieldService
} from '@main/workspace/modules/base/modules/board/services';
import {
	BoardField
} from '@main/workspace/modules/base/modules/board/interfaces';

import {
	Field
} from '../interfaces';
import {
	EventAdvance
} from '../modules/comparison/interfaces';
import {
	OtherFieldsPipe
} from '../modules/comparison/pipes';

import {
	FieldHelper
} from './field.helper';

export type EventAndFieldsType = {
	eventAdvanceSelected: EventAdvance;
	eventFields: Field[];
};

@Injectable()
export class EventHelper {

	private readonly _fieldHelper: FieldHelper
		= new FieldHelper();
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );

	/**
	 * @param {EventAdvance} event
	 * @param {Field[]} fields
	 * @param {Field} field
	 * @return {Observable<EventFieldType>}
	 */
	public getEventAndFields(
		event: EventAdvance,
		fields: Field[],
		field: Field
	) {
		const otherFieldPipe: OtherFieldsPipe
			= new OtherFieldsPipe();
		let eventAdvanceSelected: EventAdvance;
		let eventFields: Field[];

		if ( !event ) {
			eventAdvanceSelected
				= undefined;
			eventFields
				= fields;
			return of({
				eventAdvanceSelected,
				eventFields,
			});
		}

		eventAdvanceSelected = event;

		if ( event.fields ) {
			if (
				event.lookupCondition
				&& event.lookupCondition?.fieldID
			) {
				event.fields
					= _.filter(
						event.fields,
						( f: Field ) => {
							return f.extra.id !== event.lookupCondition.fieldID;
						}
					);
			}

			eventFields
				= otherFieldPipe.transform(
					event.fields,
					field as Field
				) as Field[];

			return of({
				eventAdvanceSelected,
				eventFields,
			});
		} else {
			if ( !event.boardID ) {
				eventFields
					= event.fields
					= [];

				return of({
					eventAdvanceSelected,
					eventFields,
				});
			}

			return this._boardFieldService
			.get( event.boardID )
			.pipe(
				untilCmpDestroyed(this),
				map( ( fieldsResult: BoardField[] ) => {
					const _fields: Field[]
						= _.map(
							fieldsResult,
							( f: BoardField ) =>
								this. _fieldHelper.createField( f )
						);

					event.fields
						= _fields;
					eventFields
						= otherFieldPipe.transform(
							_fields,
							field as Field
						) as Field[];

					return { eventAdvanceSelected, eventFields };
				})
			);
		}
	}
}
