import {
	ChangeDetectorRef,
	Directive,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges,
	TemplateRef,
	EventEmitter,
	ViewChild,
	inject
} from '@angular/core';
import {
	Observer,
	Observable
} from 'rxjs';
import {
	finalize
} from 'rxjs/operators';
import {
	ulid
} from 'ulidx';
import _ from 'lodash';

import {
	untilCmpDestroyed
} from '@core';

import {
	CUBMenuTriggerForDirective,
	CUBScrollBarComponent
} from '@cub/material';

import {
	IError
} from '@error/interfaces';

import {
	FieldMenuDirective
} from '@main/common/field/components';
import {
	FieldHelper
} from '@main/common/field/helpers';
import {
	Field
} from '@main/common/field/objects';
import {
	BoardFieldCreate,
	BoardField,
	IBoard
} from '@main/workspace/modules/base/modules/board/interfaces';
import {
	BoardFieldService
} from '@main/workspace/modules/base/modules/board/services';
import {
	IBase
} from '@main/workspace/modules/base/interfaces';

import {
	FieldLayoutConfig,
	FieldLayoutDataUpdate,
	View,
	LayoutDataUpdate,
	RecordLayoutConfig,
	RecordLayoutDataUpdate,
	ViewLayout
} from '../../view/interfaces';
import {
	ViewLayoutService
} from '../../view/services';

import {
	ContextData
} from '../interfaces';
import {
	RecordService
} from '../services';

@Directive()
export abstract class RecordBase
implements OnChanges, OnDestroy {

	protected static readonly inputsMetadata: string[] = [ 'board' ];

	@ViewChild( FieldMenuDirective )
	public fieldMenu: FieldMenuDirective;
	@ViewChild( 'displaySettingsTemplate', { static: true } )
	public displaySettingsTemplate: TemplateRef<any>;
	@ViewChild( 'fieldSettingsScrollBar' )
	public fieldSettingsScrollBar: CUBScrollBarComponent;
	@ViewChild( 'fieldSettingsMenuTriggerFor' )
	public fieldSettingsMenuTriggerFor: CUBMenuTriggerForDirective;

	@Input() public board: IBoard;
	@Input() public view: View;
	@Input() public viewLayout: ViewLayout;
	@Input() public context: ContextData;
	@Input() public base: IBase;

	@Output() public viewLayoutChange: EventEmitter<ViewLayout>
		= new EventEmitter<ViewLayout>();

	protected readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	protected readonly fieldHelper: FieldHelper
		= new FieldHelper();
	protected readonly boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	protected readonly recordService: RecordService
		= inject( RecordService );
	protected readonly viewLayoutService: ViewLayoutService
		= inject( ViewLayoutService );
	protected readonly onThrottleUpdateLayout: ReturnType<typeof _.throttle>
		= _.throttle(
			() => this.updateLayout(),
			2000,
			{ leading: true }
		);

	protected loaded: boolean = true;
	protected fields: BoardField[];
	protected fieldsBackup: BoardField[];

	private _viewLayoutBackup: ViewLayout;

	get otherFields(): Field[] {
		return _.map(
			this.fields,
			( f: BoardField ) => this.fieldHelper.createField( f )
		);
	}

	ngOnChanges( changes: SimpleChanges ) {
		changes.view?.currentValue && this._initData();

		if ( changes.viewLayout?.currentValue ) {
			this._viewLayoutBackup = _.cloneDeep( this.viewLayout );
		}
	}

	ngOnDestroy() {
		this.onThrottleUpdateLayout.flush();
	}

	/**
	 * @param {Field} field
	 * @return {void}
	 */
	protected createField( field: Field ) {
		const createData: BoardFieldCreate = {
			id: ulid(),
			boardID: this.board.id,
			name: field.name,
			dataType: field.dataType,
		};

		if ( field.description ) createData.description = field.description;
		if ( field.isRequired ) createData.isRequired = field.isRequired;
		if ( !_.isStrictEmpty( field.initialData ) ) {
			createData.initialData = field.initialData;
		}
		if ( !_.isStrictEmpty( field.toJson()?.params ) ) {
			createData.params = field.toJson()?.params;
		}
		this.boardFieldService.fieldsAdded$.next([ createData as BoardField ]);

		this.createFieldOb( createData )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe();
	}

	/**
	 * @param {BoardFieldCreate} data
	 * @return {Observable}
	 */
	protected createFieldOb(
		data: BoardFieldCreate
	): Observable<BoardField> {
		return new Observable( ( observer: Observer<BoardField> ) => {
			this.fields ||= [];

			this.fields.push( data as BoardField );

			this.boardFieldService
			.create( data )
			.pipe(
				finalize( () => this.cdRef.markForCheck() ),
				untilCmpDestroyed( this )
			)
			.subscribe({
				next: ( res: BoardField ) => {
					_.assign( data, res );

					this.fieldsBackup = _.cloneDeep( this.fields );

					observer.next( res );
					observer.complete();
				},
				error: ( err: IError ) => {
					this.fields = _.cloneDeep( this.fieldsBackup );

					observer.error( err );
				},
			});
		} );
	};

	/**
	 * @param {LayoutDataUpdate} data
	 * @return {Observable}
	 */
	protected updateLayoutData(
		data: LayoutDataUpdate
	) {
		const fieldsLk: Record<BoardField[ 'id' ], BoardField>
			= _.keyBy( this.fields, 'id' );
		const viewLayoutFieldsLk: Record<FieldLayoutConfig[ 'id' ], FieldLayoutConfig>
			= _.keyBy( this.viewLayout.field.fields, 'id' );
		const viewLayoutRecordsLk: Record<RecordLayoutConfig[ 'id' ], RecordLayoutConfig>
			= _.keyBy( this.viewLayout.record.records, 'id' );

		_.forEach( data.fields, ( f: FieldLayoutDataUpdate ) => {
			const oldFieldLayoutConfig: FieldLayoutDataUpdate
				= viewLayoutFieldsLk[ f.id ];

			viewLayoutFieldsLk[ f.id ]
				? _.remove( this.viewLayout.field.fields, { id: f.id } )
				: this.viewLayout.field.fields ||= [];

			const fieldLayoutConfig: FieldLayoutConfig = { id: f.id };

			if ( _.has( f, 'position' ) ) fieldLayoutConfig.position = f.position;
			if ( _.has( f, 'isHidden' ) ) {
				fieldLayoutConfig.isHidden = f.isHidden;

				_.assign( fieldsLk[ f.id ], { isHidden: f.isHidden } );
			}
			if ( _.has( f, 'width' ) ) fieldLayoutConfig.width = f.width;

			this.viewLayout.field.fields.push(
				_.assign( oldFieldLayoutConfig, fieldLayoutConfig )
			);
		} );

		_.forEach( data.records, ( r: RecordLayoutDataUpdate ) => {
			const oldRecordLayoutConfig: FieldLayoutDataUpdate
				= viewLayoutFieldsLk[ r.id ];

			viewLayoutRecordsLk[ r.id ]
				? _.remove( this.viewLayout.record.records, { id: r.id } )
				: this.viewLayout.record.records ||= [];

			const recordLayoutConfig: RecordLayoutConfig = { id: r.id };

			if ( _.has( r, 'position' ) ) recordLayoutConfig.position = r.position;

			this.viewLayout.record.records.push(
				_.assign( oldRecordLayoutConfig, recordLayoutConfig )
			);
		} );

		this.cdRef.markForCheck();
		this.onThrottleUpdateLayout();
	}

	/**
	 * @return {void}
	 */
	protected updateLayout() {
		this.viewLayoutService
		.updatePersonalLayout(
			this.view.id,
			this.viewLayout
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => {
				this._viewLayoutBackup = _.cloneDeep( this.viewLayout );
				this.fieldsBackup = _.cloneDeep( this.fields );

				this.viewLayoutChange.emit( this.viewLayout );
			},
			error: () => {
				this.viewLayout = _.cloneDeep( this._viewLayoutBackup );
				this.fields = _.cloneDeep( this.fieldsBackup );
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _initData() {
		this.loaded = false;

		this.boardFieldService
		.get( this.board.id, true )
		.pipe(
			finalize( () => this.cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( fields: BoardField[] ) => {
				if ( !_.isStrictEmpty( this.viewLayout.field.fields ) ) {
					_.forEach( fields, ( field: BoardField ) => {
						_.assign(
							field,
							this.viewLayout.field.fields[ field.id ]
						);
					} );
				}

				_.forEach(
					this.viewLayout.field.fields,
					( config: FieldLayoutConfig ) => {
						const currentPosition: number
							= _.findIndex( fields, { id: config.id } );

						if ( currentPosition < 0 ) return;

						const newFieldData: BoardField = _.assign(
							fields[ currentPosition ],
							_.pick( config, 'width', 'isHidden' )
						);

						if ( _.isFinite( config.position ) ) {
							fields.splice( currentPosition, 1 );
							fields.splice( config.position, 0, newFieldData );
						}
					}
				);

				this.loaded = true;
				this.fields = fields;
				this.fieldsBackup = _.cloneDeep( this.fields );

				this.cdRef.markForCheck();
				this.initFields();
			},
			error: () => this.loaded = true,
		});

		this.initRecords();
	}

	/**
	 * @return {void}
	 */
	protected abstract initFields();

	/**
	 * @return {void}
	 */
	protected abstract initRecords();

}
