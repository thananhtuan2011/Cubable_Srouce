import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
	inject
} from '@angular/core';
import _ from 'lodash';
import { ULID } from 'ulidx';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBConfirmService
} from '@cub/material/confirm';

import {
	DataType
} from '@main/common/field/interfaces';
import {
	NavigationBarService
} from '@main/common/navigation-bar/services';

import {
	BoardField,
	IBoard
} from '../../../interfaces';
import {
	BoardFieldService
} from '../../../services';

import {
	SharingFormDirective
} from '../../view/modules/form-view/components';
import {
	DataFormUpdate,
	FormView
} from '../../view/modules/form-view/interfaces';
import {
	FormViewService
} from '../../view/modules/form-view/services';

import {
	BoardForm,
	BoardFormField
} from '../interfaces';
import {
	ContentTab,
	FormMode
} from '../resources';

import {
	SidebarComponent
} from './sidebar.component';
import {
	EditingComponent
} from './editing.component';

const fieldTypeNotSupport: ReadonlySet<DataType> = new Set([
	DataType.CreatedBy,
	DataType.CreatedTime,
	DataType.LastModifiedBy,
	DataType.LastModifiedTime,
	DataType.Lookup,
	DataType.Formula,
	DataType.Dropdown,
	DataType.People,
]);

@Unsubscriber()
@Component({
	selector		: 'builder',
	templateUrl		: '../templates/builder.pug',
	styleUrls		: [ '../styles/builder.scss' ],
	host			: { class: 'builder' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class BuilderComponent
implements OnInit {

	@ViewChild( 'sidebar' )
	public sidebar: SidebarComponent;
	@ViewChild( 'editing' )
	public editing: EditingComponent;
	@ViewChild( SharingFormDirective )
	protected sharingForm: SharingFormDirective;

	@Input() public board: IBoard;
	@Input() public form: FormView;

	@Output() public isInternalFormChange: EventEmitter<void>
		= new EventEmitter<void>();

	protected fieldTypeNotSupport: ReadonlySet<DataType>
		= fieldTypeNotSupport;
	protected readonly contentTab: typeof ContentTab = ContentTab;
	protected readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	protected isChanged: boolean;
	protected isValid: boolean = true;
	protected tabIndex: number = ContentTab.CONTENT;
	protected previewMode: number = FormMode.PREVIEW;
	protected formDetail: BoardForm;
	protected fields: BoardField[];
	protected bkFields: BoardField[];
	protected showAddedFieldID: ULID;

	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _formViewService: FormViewService
		= inject( FormViewService );
	private readonly _confirmService: CUBConfirmService
		= inject( CUBConfirmService );
	private readonly _navigationBarService: NavigationBarService
		= inject( NavigationBarService );

	ngOnInit() {
		this._boardFieldService
		.get( this.board.id )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( fields: BoardField[] ) => {
				this.fields = _.filter(
					fields,
					( field: BoardField ) =>
						!fieldTypeNotSupport.has( field.dataType )
				);

				this.bkFields = _.cloneDeep( this.fields );

				this._getFormDetail();
				this.cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected updateForm() {
		_.forEach( this.formDetail?.fields, ( field: BoardFormField ) => {
			if ( _.isStrictEmpty( field.description ) ) {
				field.description = '';
			}

			if ( _.isStrictEmpty( field.descriptionField ) ) {
				field.descriptionField = '';
			}
		} );

		let dataUpdate: DataFormUpdate = {
			name: this.formDetail.name,
			hasCoverImage: this.formDetail?.hasCoverImage,
			hasRecaptcha: this.formDetail?.hasRecaptcha,
			hasAvatar: this.formDetail?.hasAvatar,
			title: this.formDetail?.title
				? this.formDetail?.title
				: this.form.name,
			coverImage: this.formDetail?.coverImage,
			avatar: this.formDetail?.avatar,
			description: this.formDetail?.description,
			submitButtonName: this.formDetail?.submitButtonName,
			fields: this.formDetail?.fields,
			settings: this.formDetail?.settings,
		};

		const propertiesToCheck: string[]
			= [ 'settings', 'avatar', 'coverImage', 'description', 'submitButtonName' ];

		_.forEach( propertiesToCheck, ( property: string ) => {
			if ( _.isStrictEmpty( dataUpdate[ property ] ) ) {
				dataUpdate = _.omit( dataUpdate, property );
			}
		} );

		this._formViewService
		.update( this.formDetail.id, dataUpdate )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => this.isInternalFormChange.emit(),
		});
	}

	/**
	 * @return {void}
	 */
	protected cancel() {
		if ( !this.isChanged ) {
			this.isInternalFormChange.emit();

			return;
		};

		this._confirmService
		.open(
			'BASE.BOARD.FORM.MESSAGE.CANCEL',
			'BASE.BOARD.FORM.LABEL.CANCEL',
			{
				warning: true,
				buttonDiscard: 'BASE.BOARD.FORM.LABEL.KEEP',
				buttonApply: {
					text: 'BASE.BOARD.FORM.LABEL.CONFIRM_CANCEL',
					type: 'destructive',
				},
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this.isInternalFormChange.emit();
			},
		});
	}

	/**
	 * @param {BoardField[]} fields
	 * @return {void}
	 */
	protected changeFields( fields: BoardField[] ) {
		this.fields = [...fields ];
	}

	/**
	 * @param {BoardField} field
	 * @return {void}
	 */
	protected changeField( field: BoardField ) {
		const index: number
			= _.findIndex( this.fields, { id: field.id } );

		this.fields[ index ] = field;

		_.assign( this.sidebar.fields[ index ], field );

		this.sidebar.fields = [ ...this.sidebar.fields];
		this._setChange();
	}

	/**
	 * @param {BoardForm} form
	 * @return {void}
	 */
	protected changeForm( form: BoardForm ) {
		this._setChange();
		this.formDetail = { ...form };
	}

	/**
	 * @param {BoardFormField} field
	 * @return {void}
	 */
	protected changeFormField( field: BoardFormField ) {
		this._setChange();

		if ( !field ) return;

		const index: number
			= _.findIndex(
				this.formDetail.fields,
				{ id: field.id }
			);

		this.formDetail.fields[ index ] = field;
		this.sidebar.form = this.formDetail;
	}

	/**
	 * @return {void}
	 */
	private _setChange() {
		this.isChanged = true;
		this._navigationBarService.canRedirect$.next( false );
	}

	/**
	 * @return {void}
	 */
	private _getFormDetail() {
		this._formViewService
		.getDetail( this.form.id )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( formDetail: BoardForm ) => {
				this.formDetail = formDetail;

				this.cdRef.markForCheck();
			},
		});
	}

}
