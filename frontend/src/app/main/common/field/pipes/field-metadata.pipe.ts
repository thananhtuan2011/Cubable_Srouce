import {
	Pipe,
	PipeTransform
} from '@angular/core';

import {
	Memoize
} from '@core';

import {
	DataType
} from '../interfaces';
import {
	FIELD_METADATA,
	FieldMetadata
} from '../resources';

export type FieldMetadataProperty
	= keyof FieldMetadata;

@Pipe({
	name: 'fieldMetadata',
	standalone: true,
})
export class FieldMetadataPipe implements PipeTransform {

	/**
	 * @param {DataType} dataType
	 * @param {FieldMetadataProperty=} property
	 * @return {any}
	 */
	@Memoize()
	public transform(
		dataType: DataType,
		property?: FieldMetadataProperty
	): any {
		const metadata: FieldMetadata
			= FIELD_METADATA.get( dataType );

		return property
			? metadata[ property ]
			: metadata;
	}

}
