import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
	inject
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import {
	ULID,
	ulid
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	DataType
} from '@main/common/field/interfaces';
import {
	Field
} from '@main/common/field/objects';

import {
	BoardField,
	BoardFieldCreate,
	IBoard
} from '../../../interfaces';
import {
	BoardFieldService
} from '../../../services';

import {
	BoardForm, BoardFormField
} from '../interfaces';

export type BoardFieldExtend = BoardField & {
	isAdded: boolean;
};

@Unsubscriber()
@Component({
	selector		: 'sidebar',
	templateUrl		: '../templates/sidebar.pug',
	styleUrls		: [ '../styles/sidebar.scss' ],
	host			: { class: 'sidebar' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnChanges {

	@Input() public fieldTypeNotSupport: ReadonlySet<DataType>;

	@Input() public board: IBoard;
	@Input() public form: BoardForm;
	@Input() public fields: BoardFieldExtend[];
	@Input() public bkFields: BoardFieldExtend[];

	@Output() public formChange: EventEmitter<BoardForm>
		= new EventEmitter<BoardForm>();
	@Output() public fieldsChange: EventEmitter<BoardFieldExtend[]>
		= new EventEmitter<BoardFieldExtend[]>();
	@Output() public showAddedFieldID: EventEmitter<ULID>
		= new EventEmitter<ULID>();

	protected readonly avatarControl: FormControl
		= new FormControl( undefined );
	protected readonly coverImageControl: FormControl
		= new FormControl( undefined );
	protected readonly recaptchaControl: FormControl
		= new FormControl( undefined );
	protected readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );

	get fieldsAdded(): BoardFieldExtend[] {
		return _.filter( this.fields, { isAdded: true } );
	}

	get fieldsAvailable(): BoardFieldExtend[] {
		return _.filter( this.fields, { isAdded: false } );
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.fields?.currentValue ) {
			const bkFieldsLK: ObjectType<BoardFieldExtend>
				= _.keyBy( this.bkFields, 'id' );

			_.forEach( this.fields, ( _field: BoardFieldExtend ) => {
				if ( !bkFieldsLK[ _field.id ] ) {
					_field.isAdded = false;
				}
			} );

			this.bkFields = _.cloneDeep( this.fields );
		}
		if ( changes.form?.currentValue ) {
			const fieldLK: ObjectType<BoardFormField>
				= _.keyBy( this.form.fields, 'id' );

			_.forEach( this.fields, ( _field: BoardFieldExtend ) => {
				if ( fieldLK[ _field.id ] ) {
					_field.isAdded = true;
				} else {
					_field.isAdded = false;
				}
			} );

			this.bkFields = _.cloneDeep( this.fields );
		}
	}

	/**
	 * @return {void}
	 */
	protected addAllField() {
		this.fields
			= _.map( this.fields, ( _field: BoardFieldExtend ) => {
				return {
					..._field,
					isAdded: true,
				};
			} );

		this._convertToBoardFormField();
	}

	/**
	 * @return {void}
	 */
	protected removeAllField() {
		this.fields
			= _.map( this.fields, ( _field: BoardFieldExtend ) => {
				return {
					..._field,
					isAdded: false,
				};
			} );

		this._convertToBoardFormField();
	}

	/**
	 * @param {BoardFieldExtend} field
	 * @return {void}
	 */
	protected addField( field: BoardFieldExtend ) {
		field.isAdded = true;

		this.showAddedFieldID.emit( field.id );
		this._convertToBoardFormField( field );
	}

	/**
	 * @param {string} event
	 * @return {void}
	 */
	protected searchField( event: string ) {
		if ( !event ) {
			this.fields = _.filter(
				_.cloneDeep( this.bkFields ),
				( _field: BoardFieldExtend ) =>
					!_.find( this.form.fields, { id: _field.id } )
			);

			return;
		}

		this.fields = _.filter(
			_.cloneDeep( this.bkFields ),
			( field: BoardFieldExtend ) => _.search( field.name, event )
		);

		this.cdRef.markForCheck();
	}

	/**
	 * @param {Field} field
	 * @return {void}
	 */
	protected createField( field: Field ) {
		const createData: BoardFieldCreate = {
			id		: ulid(),
			boardID	: this.board.id,
			name	: field.name,
			dataType: field.dataType,
		};

		if ( field.description ) createData.description = field.description;
		if ( field.isRequired ) createData.isRequired = field.isRequired;
		if ( !_.isStrictEmpty( field.initialData ) ) {
			createData.initialData = field.initialData;
		}
		if ( !_.isStrictEmpty( field.toJson()?.params ) ) {
			createData.params = field.toJson().params;
		}

		this._boardFieldService.fieldsAdded$.next([ createData as BoardField ]);

		this.fields ||= [];

		this._boardFieldService
		.create( createData )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( res: BoardField ) => {
				const newField: BoardFieldExtend = res as BoardFieldExtend;

				newField.isAdded = false;
				this.fields.push( newField );
				this.bkFields = _.cloneDeep( this.fields );
				this.fieldsChange.emit( this.fields );

				this.cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {boolean} e
	 * @return {void}
	 */
	protected avatarChange( e: boolean ) {
		this.form.hasAvatar = e;

		this.formChange.emit( this.form );
	}

	/**
	 * @param {boolean} e
	 * @return {void}
	 */
	protected coverAvatarChange( e: boolean ) {
		this.form.hasCoverImage = e;

		this.formChange.emit( this.form );
	}

	/**
	 * @param {boolean} e
	 * @return {void}
	 */
	protected recaptchaChange( e: boolean ) {
		this.form.hasRecaptcha = e;

		this.formChange.emit( this.form );
	}

	/**
	 * @param {BoardFieldExtend=} field
	 * @return {void}
	 */
	private _convertToBoardFormField( fieldChanged?: BoardFieldExtend ) {
		const formFieldsLK: ObjectType<BoardFormField>
			= _.keyBy( this.form.fields, 'id' );

		if ( fieldChanged ) {
			this._pushNewField( fieldChanged );
		} else {
			_.forEach( this.fields, ( field: BoardFieldExtend ) => {
				if ( field.isAdded ) {
					if ( !formFieldsLK[ field.id ] ) {
						this._pushNewField( field );
					}
				} else {
					if ( formFieldsLK[ field.id ] ) {
						_.remove(
							this.form.fields,
							( _field: BoardFormField ) => _field.id === field.id
						);
					}
				}
			} );
		}

		this.formChange.emit( this.form );

	}

	/**
	 * @param {BoardFieldExtend} fieldAdded
	 * @return {void}
	 */
	private _pushNewField( fieldAdded: BoardFieldExtend ) {
		this.form.fields ||= [];

		this.form.fields.push({
			id: fieldAdded.id,
			isRequired: false,
			descriptionField: fieldAdded.description,
			customFieldName: fieldAdded.name,
			dataType: fieldAdded.dataType,
		});
	}

}
