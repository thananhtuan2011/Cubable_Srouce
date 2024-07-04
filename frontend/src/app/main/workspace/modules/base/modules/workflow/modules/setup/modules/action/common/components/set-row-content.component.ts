import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	inject,
	ViewChildren,
	QueryList
} from '@angular/core';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	CoerceBoolean,
	DefaultValue,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	BoardField
} from '@main/workspace/modules/base/modules/board/interfaces';
import {
	BoardFieldService
} from '@main/workspace/modules/base/modules/board/services';
import {
	DataType
} from '@main/common/field/interfaces';
import {
	Field
} from '@main/common/field/objects';
import {
	FieldHelper
} from '@main/common/field/helpers';
import {
	FieldInputFactoryDirective
} from '@main/common/field/modules/input/components';
import {
	EventAdvance
} from '@main/common/field/modules/comparison/interfaces';

import {
	WorkflowBlock
} from '../../../../../../interfaces';
import {
	findBoardId
} from '../../../../../../helpers';

import {
	ActionSetting,
	ChangeValueSetting,
	FieldValueSetting
} from '../../interfaces';
import {
	CalculateType,
	RowActionType,
	ValueType
} from '../../resources';

type FieldValueSettingExtra = FieldValueSetting & {
	isInvalid?: boolean;
};

type FieldExtra = Field & {
	isAdded?: boolean;
};

const fieldTypeNotSupport: ReadonlySet<DataType> = new Set([
	DataType.CreatedBy,
	DataType.CreatedTime,
	DataType.LastModifiedBy,
	DataType.LastModifiedTime,
	DataType.Lookup,
	DataType.Formula,
]);

@Unsubscriber()
@Component({
	selector: 'set-row-content',
	templateUrl: '../templates/set-row-content.pug',
	styleUrls: [ '../styles/set-row-content.scss' ],
	host: { class: 'set-row-content' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetRowContentComponent
implements OnInit {

	@ViewChildren( FieldInputFactoryDirective )
	public readonly fieldInput: QueryList<FieldInputFactoryDirective>;

	@Input() @DefaultValue() @CoerceBoolean()
	public required: boolean = true;
	@Input() public baseID: ULID;
	@Input() public settings: ActionSetting;
	@Input() public blockSetup: WorkflowBlock;
	@Input() public eventAdvance: EventAdvance[];

	@Output() public settingsChange: EventEmitter<ActionSetting>
		= new EventEmitter<ActionSetting>();

	public readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	public showInvalidState: boolean;

	protected readonly ROW_ACTION_TYPE: typeof RowActionType
		= RowActionType;
	protected readonly DATA_TYPE: typeof DataType
		= DataType;
	protected readonly VALUE_TYPE: typeof ValueType
		= ValueType;

	protected fields: FieldExtra[];
	protected fieldsMap: Map<ULID, FieldExtra>;

	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _fieldHelper: FieldHelper
		= new FieldHelper();

	get canFieldAdd(): boolean {
		return _.filter(
			this.fields,
			{ isAdded: false }
		).length > 0;
	}

	ngOnInit() {
		this.loadFieldsFromBoard();
	}

	/**
	 * @param {FieldExtra} field
	 * @return {void}
	 */
	protected addField( field: FieldExtra ) {
		( this.settings as ChangeValueSetting ).fields ||= [];

		let fieldValueSettingExtra: FieldValueSettingExtra
			= {
				field: {
					...field,
					dataType: field.dataType,
				},
				fieldID: field.extra.id,
			} as FieldValueSettingExtra;

		if ( this.eventAdvance ) {
			fieldValueSettingExtra
				= {
					...fieldValueSettingExtra,
					value: { valueType: ValueType.STATIC },
				};

			if ( field.dataType === DataType.Number ) {
				fieldValueSettingExtra.value
					= {
						...fieldValueSettingExtra.value,
						calculateType: CalculateType.EQUAL,
					};
			}
		}

		( this.settings as ChangeValueSetting )
		.fields
		.push( fieldValueSettingExtra );

		field.isAdded = true;

		setTimeout(
			() => this.settingsChange.emit( this.settings )
		);
	}

	/**
	 * @param {ULID} fieldID
	 * @return {void}
	 */
	protected removeFieldInput( fieldID: ULID ) {
		_.remove(
			( this.settings as ChangeValueSetting ).fields,
			( fv: FieldValueSettingExtra ) => fv.fieldID === fieldID
		);

		const field: FieldExtra
			= _.find(
				this.fields,
				( f: FieldExtra ) => f.extra.id === fieldID
			);

		field.isAdded = false;

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {any} value
	 * @param {number} index
	 * @return {void}
	 */
	protected onFieldValueChange( value: any, index: number ) {
		( this.settings as ChangeValueSetting )
		.fields[ index ]
		.value
			= value;

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	public loadFieldsFromBoard() {
		const boardID: ULID
			= findBoardId(
				this.blockSetup
			);

		if ( !boardID ) {
			this.fields = null;
			return;
		}

		this._boardFieldService
		.get( boardID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( fields: BoardField[] ) => {
				this.fields
					= _.compact(
						_.map(
							fields,
							( f: BoardField ) => {
								if (
									!fieldTypeNotSupport.has(
										f.dataType
									)
								) {
									const newF: FieldExtra
										= this._fieldHelper
										.createField( f );

									const existFv: boolean
										= !!_.find(
											(
												this.settings as
												ChangeValueSetting
											)
											.fields,
											( fv: FieldValueSettingExtra ) => {
												return fv.fieldID
													=== newF.extra.id;
											}
										);

									newF.isAdded
										= existFv;

									newF.isRequired
										= true;

									return newF;
								}
							}
						)
					);

				this.fieldsMap = new Map(
					Object.entries(
						_.keyBy(
							this.fields,
							( field: FieldExtra ) => {
								return field.extra.id;
							}
						)
					)
				);

				this.cdRef.markForCheck();
			},
		});
	}

}
