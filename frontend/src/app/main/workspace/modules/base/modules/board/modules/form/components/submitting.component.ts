import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Input,
	OnInit,
	inject
} from '@angular/core';
import {
	ActivatedRoute
} from '@angular/router';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	isMatchedCondition
} from '@cub/filter';

import {
	FieldHelper
} from '@main/common/field/helpers';
import {
	DataType,
	Field
} from '@main/common/field/interfaces';
import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';
import {
	IUserData
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	ReferenceField
} from '@main/common/field/objects';

import {
	BoardField
} from '../../../interfaces';

import {
	BoardForm,
	BoardFormField,
	FormSubmit
} from '../interfaces';
import {
	FormMode
} from '../resources';
import {
	BoardFormService
} from '../services/form-public.service';

const readonlyField: ReadonlySet<DataType> = new Set([
	DataType.Formula,
]);

@Unsubscriber()
@Component({
	selector: 'submitting',
	templateUrl: '../templates/submitting.pug',
	styleUrls: [ '../styles/submitting.scss' ],
	host: { class: 'submitting' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [ BoardFormService ],
})
export class SubmittingComponent
implements OnInit {

	@Input() public boardID: ULID;
	@Input() public formMode: FormMode;
	@Input() public form: BoardForm;
	@Input() public submitFunc: Function;

	protected readonly DATA_TYPE: typeof DataType
		= DataType;
	protected readonly FORM_MODE: typeof FormMode
		= FormMode;

	private readonly _fieldHelper: FieldHelper
		= new FieldHelper();

	protected isRecaptchaResolved: boolean;
	protected isSubmitted: boolean;
	protected validConditions: Record<BoardField[ 'id' ], boolean>;;
	protected workspaceID: ULID;
	protected fields: Field[];
	protected formSubmit: FormSubmit;
	protected fieldsLK: ObjectType<BoardField | BoardFormField>;
	protected readonlyField: typeof readonlyField = readonlyField;

	protected metadata: Record<ULID, ObjectType>;

	private readonly _userService: UserService
		= inject( UserService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _activatedRoute: ActivatedRoute
		= inject( ActivatedRoute );

	private _userID: ULID;

	ngOnInit() {
		this.workspaceID
			= this._activatedRoute.snapshot.paramMap.get( 'workspaceID' );
		this.metadata ||= {};

		this.fields = _.map(
			this.form.fields,
			( f: BoardFormField ) => {
				switch ( f.dataType ) {
					case ReferenceField.dataType:
						this.metadata[ f.id ] = {
							isFormView: true,
							formID: this.form.id,
							workspaceID: this.workspaceID,
						};
						break;
				}

				return this._fieldHelper.createField(
						f as unknown as Field<any>
				);
			}
		);

		this._initFields();

		this._initFormSubmit();
	}

	/**
	 * @return {void}
	 */
	protected submit() {
		const submitData: FormSubmit = {
			id: this.form.id,
			cells: this.formSubmit.cells,
		};

		(
			this.formMode === FormMode.INTERNAL
				? this.submitFunc( submitData )
				: this.submitFunc(
					this.workspaceID,
					submitData
				)
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => {
				this.isSubmitted = true;

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected sendAnotherResponse() {
		this._initFormSubmit();

		this.isSubmitted = false;
	}

	/**
	 * @param {number} value
	 * @return {void}
	 */
	protected onFormChange( value: any, index: number ) {
		this.formSubmit.cells[ this.form.fields[ index ].id ]
			= value;

		_.forEach(
			this.form.fields,
			( field: BoardFormField , _index: number) => {
				this._checkValidCondition( _index, field );
			}
		);
	}

	/**
	 * @return {void}
	 */
	private _initFields() {
		this.fieldsLK =
				_.keyBy( this.form.fields, 'id' );

		this._userService.storedUserChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( userData: IUserData ) => {
				if ( userData ) {
					this._userID = userData.user.id;
				}
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _initFormSubmit() {
		this.formSubmit ||= {};

		if ( this.form.fields ) {
			_.forEach(
				this.form.fields,
				( field: BoardFormField ) => {
					this.formSubmit.cells ||= {};

					if ( field.dataType === this.DATA_TYPE.Checkbox ) return;

					this.formSubmit.cells[ field.id ] = null;
				}
			);
		}

		this.formSubmit = {
			...this.formSubmit,
			id: this.form.id,
		};
	}

	/**
	 * @return {void}
	 * @param {number} index
	 * @param {BoardFormField} field
	 */
	private _checkValidCondition( index: number, field: BoardFormField ) {
		this.validConditions ||= {};

		if ( index === 0 || !field?.filter?.options.length ) {
			this.validConditions[ field.id ] = true;
			return;
		}

		if (
			field?.hasConditions
			&& field?.filter?.options.length
		) {
			this.validConditions[ field.id ]
			= isMatchedCondition(
					{
						cells: this.formSubmit.cells,
					},
					this.form.fields[ index ].filter.conditions as any,
					{
						boardFields: this.fieldsLK,
						userID: this._userID,
					}
				);
		}

		if ( !this.validConditions[ field.id ] ) {
			this.formSubmit.cells[ field.id ] = null;
		}
	}
}
