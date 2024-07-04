import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	HostListener,
	inject,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	QueryList,
	Renderer2,
	SimpleChanges,
	TemplateRef,
	ViewChild,
	ViewChildren
} from '@angular/core';
import {
	OverlayContainer
} from '@angular/cdk/overlay';
import {
	merge
} from 'rxjs';
import _ from 'lodash';

import {
	ScrollEvent,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBConfirmService
} from '@cub/material/confirm';
import {
	CUBMenuComponent
} from '@cub/material/menu';
import {
	CUBToastService
} from '@cub/material/toast';

import {
	FieldBuilderService
} from '@main/common/field/modules/builder/services';
import {
	FieldMenuService
} from '@main/common/field/services';
import {
	AttachmentField,
	CheckboxField,
	CreatedByField,
	CreatedTimeField,
	CurrencyField,
	DateField,
	DropdownField,
	EmailField,
	FormulaField,
	LastModifiedByField,
	LastModifiedTimeField,
	LinkField,
	LookupField,
	NumberField,
	ParagraphField,
	PeopleField,
	PhoneField,
	ProgressField,
	RatingField,
	ReferenceField,
	TextField
} from '@main/common/field/objects';
import {
	VirtualScrollComponent
} from './sub-components/virtual-scroll/virtual-scroll.component';
import {
	GroupVirtualScrollViewportComponent
} from './sub-components/virtual-scroll/group-virtual-scroll-viewport.component';

import {
	CellDataEditedEvent,
	CellIndex,
	CellSelectedEvent
} from './sub-classes/cell';
import {
	Column,
	ColumnDuplicatedEvent,
	ColumnInsertedEvent,
	ColumnMovedEvent
} from './sub-classes/column';
import {
	ActionClickedEvent,
	Config,
	ExportData,
	MainClass,
	SearchInfo
} from './sub-classes/main';
import {
	Row,
	RowDuplicatedEvent,
	RowInsertedEvent,
	RowMovedEvent
} from './sub-classes/row';

export * from './sub-classes/cell';
export * from './sub-classes/column';
export * from './sub-classes/main';
export * from './sub-classes/row';

@Unsubscriber()
@Component({
	selector: 'spreadsheet',
	templateUrl: './spreadsheet.pug',
	styleUrls: [ './spreadsheet.scss' ],
	host: { class: 'spreadsheet' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpreadsheetComponent
	extends MainClass
	implements AfterViewInit, OnChanges, OnDestroy, OnInit {

	@Input() public config: Config;
	@Input() public columns: Column[];
	@Input() public rows: Row[];
	@Input() public context: ObjectType;

	@Output() public columnsChange: EventEmitter<Column[]>
		= new EventEmitter<Column[]>();
	@Output() public columnAdded: EventEmitter<Column>
		= new EventEmitter<Column>();
	@Output() public columnCalculated: EventEmitter<Column>
		= new EventEmitter<Column>();
	@Output() public columnDeleted: EventEmitter<Column[]>
		= new EventEmitter<Column[]>();
	@Output() public columnDuplicated: EventEmitter<ColumnDuplicatedEvent>
		= new EventEmitter<ColumnDuplicatedEvent>();
	@Output() public columnFieldEdited: EventEmitter<Column>
		= new EventEmitter<Column>();
	@Output() public columnFreezed: EventEmitter<number>
		= new EventEmitter<number>();
	@Output() public columnGrouped: EventEmitter<Column>
		= new EventEmitter<Column>();
	@Output() public columnHidden: EventEmitter<Column[]>
		= new EventEmitter<Column[]>();
	@Output() public columnInserted: EventEmitter<ColumnInsertedEvent>
		= new EventEmitter<ColumnInsertedEvent>();
	@Output() public columnMoved: EventEmitter<ColumnMovedEvent>
		= new EventEmitter<ColumnMovedEvent>();
	@Output() public columnResized: EventEmitter<Column>
		= new EventEmitter<Column>();
	@Output() public columnSelected: EventEmitter<Column[] | null>
		= new EventEmitter<Column[] | null>();
	@Output() public columnSorted: EventEmitter<Column>
		= new EventEmitter<Column>();
	@Output() public columnUncalculated: EventEmitter<Column>
		= new EventEmitter<Column>();
	@Output() public columnUngrouped: EventEmitter<Column>
		= new EventEmitter<Column>();
	@Output() public columnUnhidden: EventEmitter<Column>
		= new EventEmitter<Column>();
	@Output() public columnUnsorted: EventEmitter<Column>
		= new EventEmitter<Column>();

	@Output() public rowsChange: EventEmitter<Row[]>
		= new EventEmitter<Row[]>();
	@Output() public rowAdded: EventEmitter<Row>
		= new EventEmitter<Row>();
	@Output() public rowDuplicated: EventEmitter<RowDuplicatedEvent>
		= new EventEmitter<RowDuplicatedEvent>();
	@Output() public rowDeleted: EventEmitter<Row[]>
		= new EventEmitter<Row[]>();
	@Output() public rowExpanded: EventEmitter<Row>
		= new EventEmitter<Row>();
	@Output() public rowInserted: EventEmitter<RowInsertedEvent>
		= new EventEmitter<RowInsertedEvent>();
	@Output() public rowMoved: EventEmitter<RowMovedEvent>
		= new EventEmitter<RowMovedEvent>();
	@Output() public rowSelected: EventEmitter<Row[] | null>
		= new EventEmitter<Row[] | null>();

	@Output() public cellDataEdited: EventEmitter<CellDataEditedEvent[]>
		= new EventEmitter<CellDataEditedEvent[]>();
	@Output() public cellSelected: EventEmitter<CellSelectedEvent[] | null>
		= new EventEmitter<CellSelectedEvent[] | null>();

	@Output() public actionClicked: EventEmitter<ActionClickedEvent>
		= new EventEmitter<ActionClickedEvent>();
	@Output() public searching: EventEmitter<SearchInfo>
		= new EventEmitter<SearchInfo>();
	@Output() public export: EventEmitter<ExportData>
		= new EventEmitter<ExportData>();

	protected readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	protected readonly elementRef: ElementRef
		= inject( ElementRef );
	protected readonly renderer: Renderer2
		= inject( Renderer2 );
	protected readonly overlayContainer: OverlayContainer
		= inject( OverlayContainer );
	protected readonly confirmService: CUBConfirmService
		= inject( CUBConfirmService );
	protected readonly toastService: CUBToastService
		= inject( CUBToastService );
	protected readonly fieldBuilder: FieldBuilderService
		= inject( FieldBuilderService );
	protected readonly fieldMenuService: FieldMenuService
		= inject( FieldMenuService );

	@ViewChild( VirtualScrollComponent, { static: true } )
	protected readonly virtualScroll: VirtualScrollComponent;
	@ViewChild( GroupVirtualScrollViewportComponent )
	protected readonly groupVSViewport: GroupVirtualScrollViewportComponent;
	@ViewChild( 'columnActionMenu' )
	protected readonly columnActionMenu: CUBMenuComponent;
	@ViewChild( 'rowActionMenu' )
	protected readonly rowActionMenu: CUBMenuComponent;
	@ViewChild( 'attachmentGroupDataTemplate', { static: true } )
	protected readonly attachmentGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'checkboxGroupDataTemplate', { static: true } )
	protected readonly checkboxGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'createdByGroupDataTemplate', { static: true } )
	protected readonly createdByGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'createdTimeGroupDataTemplate', { static: true } )
	protected readonly createdTimeGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'currencyGroupDataTemplate', { static: true } )
	protected readonly currencyGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'dateGroupDataTemplate', { static: true } )
	protected readonly dateGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'dropdownGroupDataTemplate', { static: true } )
	protected readonly dropdownGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'emailGroupDataTemplate', { static: true } )
	protected readonly emailGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'formulaGroupDataTemplate', { static: true } )
	protected readonly formulaGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'lastModifiedByGroupDataTemplate', { static: true } )
	protected readonly lastModifiedByGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'lastModifiedTimeGroupDataTemplate', { static: true } )
	protected readonly lastModifiedTimeGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'linkGroupDataTemplate', { static: true } )
	protected readonly linkGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'lookupGroupDataTemplate', { static: true } )
	protected readonly lookupGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'numberGroupDataTemplate', { static: true } )
	protected readonly numberGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'paragraphGroupDataTemplate', { static: true } )
	protected readonly paragraphGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'peopleGroupDataTemplate', { static: true } )
	protected readonly peopleGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'phoneGroupDataTemplate', { static: true } )
	protected readonly phoneGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'progressGroupDataTemplate', { static: true } )
	protected readonly progressGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'ratingGroupDataTemplate', { static: true } )
	protected readonly ratingGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'referenceGroupDataTemplate', { static: true } )
	protected readonly referenceGroupDataTemplate: TemplateRef<any>;
	@ViewChild( 'textGroupDataTemplate', { static: true } )
	protected readonly textGroupDataTemplate: TemplateRef<any>;

	@ViewChildren( 'selectableCell' )
	protected readonly selectableCells: QueryList<ElementRef>;
	@ViewChildren( 'selectableRowCell' )
	protected readonly selectableRowCells: QueryList<ElementRef>;

	protected isMouseHolding: boolean;

	private _unlistenDocumentKeydownEvent: () => void;
	private _unlistenDocumentPasteEvent: () => void;

	private readonly _onDocumentKeydown
		= ( e: KeyboardEvent ) => {
			const target: HTMLElement
				= e.target as HTMLElement;

			if (
				this.overlayContainer
				.getContainerElement()
				.contains( target )
			) {
				return;
			}

			switch ( e.code ) {
				case 'ArrowUp':
					this.selectCellByKeyboard( e, 'above' );
					break;
				case 'ArrowDown':
					this.selectCellByKeyboard( e, 'below' );
					break;
				case 'ArrowLeft':
					this.selectCellByKeyboard( e, 'before' );
					break;
				case 'Tab':
				case 'ArrowRight':
					this.selectCellByKeyboard( e, 'after' );
					break;
				case 'Enter':
					e.shiftKey
						? this.addRow()
						: this.selectCellByKeyboard( e, 'below' );
					break;
				case 'Backspace':
				case 'Delete':
					this.clearSelectedCells();
					break;
				case 'KeyA':
					// @ts-ignore
					if ( _.isCmdKey( e ) ) {
						e.preventDefault();

						this.deselectAllColumns();
						this.deselectAllCells();
						this.selectAllRows();
					}
					break;
			}
		};
	private readonly _onDocumentPaste
		= ( e: ClipboardEvent ) => {
			const target: HTMLElement
				= e.target as HTMLElement;

			if (
				this.overlayContainer
				.getContainerElement()
				.contains( target )
			) {
				return;
			}

			this.pasteSelectedCells(
				e.clipboardData.getData( 'text' )
			);
		};

	@HostListener( 'document:mousedown', [ '$event' ] )
	protected onDocumentMousedown(
		e: MouseEvent
	) {
		if ( this.isPickerMode ) {
			return;
		}

		setTimeout(() => {
			if ( this.layoutProperties.cell.invalid ) {
				return;
			}

			const target: HTMLElement
				= e.target as HTMLElement;
			const isSafe: boolean
				= this.overlayContainer
				.getContainerElement()
				.contains( target )
				&& !this.overlayContainer
				.getContainerElement()
				.contains( this.elementRef.nativeElement )
				|| !document
				.contains( target )
				|| !!this.selectableCells
				.find(( { nativeElement }: ElementRef ) => {
					return nativeElement === target
						|| nativeElement.contains( target );
				});

			if ( !isSafe ) {
				this.deselectAllColumns();
				this.deselectAllCells();

				this.cdRef.markForCheck();
				return;
			}

			const startCellIndex: CellIndex
				= this.findCellByTargetElement( target );

			if ( !startCellIndex ) {
				return;
			}

			const {
				rowIndex: startRowIndex,
				columnIndex: startColumnIndex,
			}: CellIndex = startCellIndex;

			if ( e.button === 2 ) { // Right click
				if ( !this.rows[ startRowIndex ].selected ) {
					this.selectCell(
						startRowIndex,
						startColumnIndex
					);
				}

				return;
			}

			this.rowActionMenu.ref?.close();

			const unlisten1: () => void
				= this.renderer.listen(
					document,
					'mousemove',
					( _e: MouseEvent ) => {
						this.isMouseHolding = true;

						const endCellIndex: CellIndex
							= this.findCellByTargetElement(
								_e.target as HTMLElement
							);

						if ( !endCellIndex ) {
							return;
						}

						const {
							rowIndex,
							columnIndex,
						}: CellIndex = endCellIndex;

						this.selectCells(
							[ startRowIndex, rowIndex ],
							[ startColumnIndex, columnIndex ]
						);
					}
				);

			const unlisten2: () => void
				= this.renderer.listen(
					document,
					'mouseup',
					() => {
						unlisten1();
						unlisten2();

						if ( this.isMouseHolding ) {
							this.isMouseHolding = false;

							return;
						}

						this.selectCell(
							startRowIndex,
							startColumnIndex
						);
					}
				);
		});
	}

	@HostBinding( 'class' )
	get class(): ObjectType<boolean> {
		return {
			'spreadsheet-creator-mode':
				this.isCreatorMode,
			'spreadsheet-editor-mode':
				this.isEditorMode,
			'spreadsheet-picker-mode':
				this.isPickerMode,
			'spreadsheet--right-scrolled':
				this.isRightScrolled,
		};
	}

	ngOnInit() {
		merge(
			this.rowSelected,
			this.columnSelected,
			this.cellSelected
		)
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(( e: any | null ) => {
			if ( e === null ) {
				this._unlistenDocumentKeydownEvent?.();
				this._unlistenDocumentPasteEvent?.();

				this._unlistenDocumentKeydownEvent
					= this._unlistenDocumentPasteEvent
					= null;

				return;
			}

			this._unlistenDocumentKeydownEvent
				||= this.renderer.listen(
					document,
					'keydown',
					this._onDocumentKeydown
				);

			this._unlistenDocumentPasteEvent
				||= this.renderer.listen(
					document,
					'paste',
					this._onDocumentPaste
				);
		});
	}

	ngOnDestroy() {
		this._unlistenDocumentKeydownEvent?.();
		this._unlistenDocumentPasteEvent?.();
	}

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.config ) {
			this.config = _.defaultsDeep(
				this.config,
				this.DEFAULT_CONFIG
			);
		}

		if ( changes.columns ) {
			this.updateColumns( this.columns );
		}

		if ( changes.rows ) {
			this.updateRows( this.rows );
		}
	}

	ngAfterViewInit() {
		this.groupDataTemplates = new Map([
			[ AttachmentField.dataType, this.attachmentGroupDataTemplate ],
			[ CheckboxField.dataType, this.checkboxGroupDataTemplate ],
			[ CreatedByField.dataType, this.createdByGroupDataTemplate ],
			[ CreatedTimeField.dataType, this.createdTimeGroupDataTemplate ],
			[ CurrencyField.dataType, this.currencyGroupDataTemplate ],
			[ DateField.dataType, this.dateGroupDataTemplate ],
			[ DropdownField.dataType, this.dropdownGroupDataTemplate ],
			[ EmailField.dataType, this.emailGroupDataTemplate ],
			[ FormulaField.dataType, this.formulaGroupDataTemplate ],
			// eslint-disable-next-line max-len
			[ LastModifiedByField.dataType, this.lastModifiedByGroupDataTemplate ],
			// eslint-disable-next-line max-len
			[LastModifiedTimeField.dataType, this.lastModifiedTimeGroupDataTemplate ],
			[ LinkField.dataType, this.linkGroupDataTemplate ],
			[ LookupField.dataType, this.lookupGroupDataTemplate ],
			[ NumberField.dataType, this.numberGroupDataTemplate ],
			[ ParagraphField.dataType, this.paragraphGroupDataTemplate ],
			[ PeopleField.dataType, this.peopleGroupDataTemplate ],
			[ PhoneField.dataType, this.phoneGroupDataTemplate ],
			[ ProgressField.dataType, this.progressGroupDataTemplate ],
			[ RatingField.dataType, this.ratingGroupDataTemplate ],
			[ ReferenceField.dataType, this.referenceGroupDataTemplate ],
			[ TextField.dataType, this.textGroupDataTemplate ],
		]);

		this
		.virtualScroll
		.scroller
		.scrolling$
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(( e: ScrollEvent ) => {
			this.isRightScrolled
				= e.scrollLeft > 0;
		});
	}

	/**
	 * @return {void}
	 */
	public detectChanges() {
		this.cdRef.detectChanges();
	}

	/**
	 * @return {void}
	 */
	public markForCheck() {
		this.cdRef.markForCheck();
	}

}
