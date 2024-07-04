import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewEncapsulation,
	inject
} from '@angular/core';
import {
	ULID
} from 'ulidx';
import {
	Subject,
	Subscription
} from 'rxjs';
import {
	debounceTime
} from 'rxjs/operators';
import _ from 'lodash';

import {
	CoerceBoolean,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	FieldHelper
} from '@main/common/field/helpers';
import {
	ViewLayoutService
} from '@main/workspace/modules/base/modules/board/modules/view/services';
import {
	FieldLayoutConfig,
	ViewLayout
} from '@main/workspace/modules/base/modules/board/modules/view/interfaces';
import {
	BoardField
} from '@main/workspace/modules/base/modules/board/interfaces';
import {
	Field
} from '@main/common/field/interfaces';
import {
	FIELD_READONLY
} from '@main/common/field/objects';

import {
	RecordData,
	RecordDetail, RecordPermission
} from '../../../interfaces';
import {
	RecordService
} from '../../../services';

@Unsubscriber()
@Component({
	selector: 'information',
	templateUrl: '../templates/information.pug',
	styleUrls: [ '../styles/information.scss' ],
	host: { class: 'information' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformationComponent
implements OnInit, AfterViewInit, OnDestroy {

	@Input() @CoerceBoolean() public isTopSticky: boolean;
	@Input() public viewID: ULID;
	@Input() public itemName: string;
	@Input() public boardFields: BoardField[];
	@Input() public itemDetail: RecordDetail;
	@Input() public lookupContext: any;

	@Output() public stickEditorTop: EventEmitter<boolean>
		= new EventEmitter<boolean>();
	@Output() public isLoaded: EventEmitter<boolean>
		= new EventEmitter<boolean>();

	protected readonly FIELD_READONLY: typeof FIELD_READONLY
		= FIELD_READONLY;

	protected isShowFieldsHidden: boolean;
	protected editable: boolean | Record<ULID, boolean>;
	protected fields: Field[];
	protected filteredFields: Field[];
	protected records: RecordData[];
	protected informationObserver: IntersectionObserver;
	protected informationSubscription: Subscription;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _viewLayoutService: ViewLayoutService
		= inject( ViewLayoutService );
	private readonly _recordService: RecordService
		= inject( RecordService );
	private readonly _fieldHelper: FieldHelper
		= new FieldHelper();
	private readonly _elementRef: ElementRef
		= inject( ElementRef );

	get hiddenFields(): Field[] {
		return _.filter(
			this.filteredFields,
			( f: Field ) => ( f.extra as BoardField )?.isHidden
		);
	}

	ngOnInit() {
		if ( !this.viewID ) {
			this.fields ||= [];

			_.forEach(
				this.boardFields,
				( f: BoardField ) => {
					this.fields.push( this._fieldHelper.createField( f ) );
				} );

			this._getRowsPermission();

			return;
		}

		this._getPersonalLayout();
	}

	ngAfterViewInit(): void {
		const informationSubject: Subject<IntersectionObserverEntry[]>
			= new Subject<IntersectionObserverEntry[]>();

		this.informationSubscription
			= informationSubject
			.pipe(
				debounceTime( 10 )
			).subscribe( ( entries: IntersectionObserverEntry[] ) => {
				_.forEach( entries, ( entry: IntersectionObserverEntry ) => {
					if (
						entry.isIntersecting
						&& this.isTopSticky
					) {
						this.isTopSticky = false;
					} else if (
						!entry.isIntersecting
						&& entry.boundingClientRect.top < 0
					) {
						this.isTopSticky = true;
					}
				} );

				this.stickEditorTop.emit( this.isTopSticky );
			});

		// Intersection Observer
		const options: IntersectionObserverInit = {
			root: null,
			rootMargin: '3px 0px 0px 0px',
			threshold: 0,
		};
		this.informationObserver
			= new IntersectionObserver(
				( entries: IntersectionObserverEntry[] ) => {
					informationSubject.next( entries );
				},
				options
			);

		this.informationObserver.observe( this._elementRef.nativeElement );
	}

	ngOnDestroy(): void {
		this.informationObserver.disconnect();
		this.informationSubscription?.unsubscribe();
	}

	protected filter( fields: Field[] ) {
		this.filteredFields
			= fields;

		this._cdRef.markForCheck();

		setTimeout(
			() => {
				this.isLoaded.emit( true );
			}
		);
	}

	/**
	 * @return {void}
	 */
	private _getPersonalLayout() {
		this._viewLayoutService
		.getPersonalLayout( this.viewID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( layout: ViewLayout ) => {
				_.forEach(
					layout?.field?.fields,
					( config: FieldLayoutConfig ) => {
						const currentPosition: number
							= _.findIndex(
								this.boardFields, { id: config.id }
							);

						if ( currentPosition < 0 ) return;

						const newFieldData: BoardField = _.assign(
							this.boardFields[ currentPosition ],
							_.pick( config, 'isHidden' )
						);

						if ( config.position ) {
							this.boardFields.splice( currentPosition, 1 );
							this.boardFields.splice(
								config.position,
								0,
								newFieldData
							);
						}
					}
				);

				this._getRowsPermission();

				this.fields = _.chain( this.boardFields )
				.sortBy({ isHidden: true })
				.map( ( f: BoardField ) => this._fieldHelper.createField( f ) )
				.value();

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _getRowsPermission() {
		const fieldIDs: ULID[] = _.reduce(
			this.boardFields,
			( ids: ULID[], f: BoardField ) => {
				if (
					!f.canEditAllRow
					&& !FIELD_READONLY.has( f.dataType )
				) ids.push( f.id );

				return ids;
			},
			[]
		);

		if ( !fieldIDs.length ) return;

		this._recordService
		.listEditable(
			fieldIDs,
			this.viewID,
			this.itemDetail.id
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( p: Record<BoardField[ 'id' ], RecordPermission> ) => {
				this.editable = _.isStrictEmpty( p[ this.itemDetail.id ] )
					? false
					: p[ this.itemDetail.id ];

				this._cdRef.markForCheck();
			},
		});
	}

}
