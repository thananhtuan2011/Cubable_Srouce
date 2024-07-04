import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ComponentRef,
	DoCheck,
	ElementRef,
	EventEmitter,
	HostBinding,
	inject,
	Inject,
	Input,
	IterableChanges,
	IterableDiffer,
	IterableDiffers,
	KeyValueChanges,
	KeyValueDiffer,
	KeyValueDiffers,
	OnDestroy,
	OnInit,
	Output,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation
} from '@angular/core';
import {
	debounceTime
} from 'rxjs/operators';
import { ULID } from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	LeaderLineNew
} from './leader-line';

import {
	CUBFlowchartComponent
} from './flowchart.component';

export type CUBFlowchartNodeOuterBox = {
	label: string;
	collapsable?: boolean;
};

export type CUBFlowchartNode = {
	id: ULID;
	type?: any;
	nextNode?: CUBFlowchartNode;
	childNodes?: CUBFlowchartNode[];
	childNodeLineCaptions?: string[];
	addOuterBox?: boolean | CUBFlowchartNodeOuterBox;
	disableInsertNextNode?: boolean;
	metadata?: any;

	_cmp?: CUBFlowchartNodeComponent;
	_cmpRef?: ComponentRef<CUBFlowchartNodeComponent>;

	// Callbacks
	_onReady?( cmp: CUBFlowchartNodeComponent ): void;
};

export type CUBFlowchartNodeAddonEvent = {
	flowchart: CUBFlowchartComponent;
	sourceNode: CUBFlowchartNode;
	event: MouseEvent;
	position?: number;
};

export type CUBFlowchartNodeClickedEvent = {
	flowchart: CUBFlowchartComponent;
	node: CUBFlowchartNode;
	event: MouseEvent;
};

export type CUBFlowchartNodePromiseResolve
	= [ CUBFlowchartNode, CUBFlowchartNodeComponent ];

enum BranchLineType {
	Spliting = 1,
	Merging,
}

enum LineName {
	FromPreviousNode = 1,
	FromInsertPreviousNodeButton,
	FromSplitingPoint,
	ToInsertNextNodeButton,
	ToSpitingPoint,
	ToMergingPoint,
};

type NodeDiffer = KeyValueDiffer<string, any>;
type NodeChanges = KeyValueChanges<string, any>;
type ChildNodesDiffer = IterableDiffer<CUBFlowchartNode>;
type ChildNodesChanges = IterableChanges<CUBFlowchartNode>;

function addObjectGetter(
	obj: Object,
	key: string,
	getter: any
) {
	Object.defineProperty(
		obj,
		key,
		{
			get: _.isFunction( getter )
				? getter
				: function() { return getter; },
			enumerable: true,
			configurable: true,
		}
	);
}

function getBranchLineOptions(
	start: HTMLElement,
	end: HTMLElement,
	type: BranchLineType
): LeaderLineNew.Options {
	const d1: DOMRect
		= start.getBoundingClientRect();
	const d2: DOMRect
		= end.getBoundingClientRect();
	const dL1: number
		= d1.left + ( d1.width / 2 );
	const dL2: number
		= d2.left + ( d2.width / 2 );

	if ( Math.abs( dL1 - dL2 ) <= 1 ) {
		return;
	}

	const options: LeaderLineNew.Options
		= { path: 'grid' };
	const isRightSide: boolean
		= dL1 < dL2;

	switch ( type ) {
		case BranchLineType.Spliting:
			options.startSocket
				= isRightSide ? 'right': 'left';
			break;
		case BranchLineType.Merging:
			options.endSocket
				= isRightSide ? 'left' : 'right';
			break;
	}

	return options;
}

const DEFAULT_LINE_OPTIONS: LeaderLineNew.Options
	= {
		color: 'var(--flowchart-line-color)',
		labelOptions: {
			color: 'var(--flowchart-line-label-color)',
			backgroundColor: 'var(--flowchart-line-label-bg-color)',
		},
	};

@Unsubscriber()
@Component({
	selector: 'cub-flowchart-node',
	templateUrl: './flowchart-node.pug',
	styleUrls: [ './flowchart-node.scss' ],
	host: { class: 'cub-flowchart-node' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBFlowchartNodeComponent
implements AfterViewInit, OnDestroy, OnInit, DoCheck {

	@Input() public position: number;
	@Input() public node: CUBFlowchartNode;
	@Input() public previousNode: CUBFlowchartNode;
	@Input() public parentNode: CUBFlowchartNode;

	@Output() public rendered: EventEmitter<void> = new EventEmitter();

	@ViewChild( 'wrapperBlock', { static: true } )
	protected readonly wrapperBlockEleRef: ElementRef<HTMLElement>;
	@ViewChild( 'contentBlock', { static: true } )
	protected readonly contentBlockEleRef: ElementRef<HTMLElement>;
	@ViewChild( 'btnInsertPreviousNode', { read: ElementRef } )
	protected readonly btnInsertPreviousNodeEleRef: ElementRef<HTMLElement>;
	@ViewChild( 'btnInsertNextNode', { read: ElementRef } )
	protected readonly btnInsertNextNodeEleRef: ElementRef<HTMLElement>;
	@ViewChild( 'splitingPoint' )
	protected readonly splitingPointEleRef: ElementRef<HTMLElement>;
	@ViewChild( 'mergingPoint' )
	protected readonly mergingPointEleRef: ElementRef<HTMLElement>;
	@ViewChild( 'childNodesFactory', { static: true, read: ViewContainerRef } )
	protected readonly childNodesFactory: ViewContainerRef;
	@ViewChild( 'nextNodeFactory', { static: true, read: ViewContainerRef } )
	protected readonly nextNodeFactory: ViewContainerRef;

	protected isCollapsed: boolean;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _iterableDiffers: IterableDiffers
		= inject( IterableDiffers );
	private readonly _keyValueDiffers: KeyValueDiffers
		= inject( KeyValueDiffers );

	private _lineMap: Map<LineName, LeaderLineNew>;
	private _previousNodeDiffer: NodeDiffer;
	private _nextNodeDiffer: NodeDiffer;
	private _parentNodeDiffer: NodeDiffer;
	private _childNodesDiffer: ChildNodesDiffer;
	private _childNodeCmpRefs: ComponentRef<CUBFlowchartNodeComponent>[];
	private _resizeObserver: ResizeObserver;

	@HostBinding( 'class.cub-flowchart-node--boxed' )
	get isBoxed(): boolean {
		return !!this.node.addOuterBox;
	}

	get isBlankChild(): boolean {
		return this.parentNode
			&& this.node.id === null;
	}

	get isFirstChild(): boolean {
		return this.position === 0;
	}

	get isLastChild(): boolean {
		return this.position
			=== this.parentNode.childNodes.length;
	}

	get isRootChild(): boolean {
		return this.parentNode
			&& !this.previousNode;
	}

	get isLeafChild(): boolean {
		return this.parentNode
			&& !this.node.nextNode;
	}

	get hasPreviousNode(): boolean {
		return !!this.previousNode;
	}

	get hasNextNode(): boolean {
		return !!this.node.nextNode;
	}

	get hasParentNode(): boolean {
		return !!this.parentNode;
	}

	get hasChildNodes(): boolean {
		return this.node.childNodes?.length > 0;
	}

	get hasBranches(): boolean {
		return !this.isBoxed && this.hasChildNodes;
	}

	get canInsertNode(): boolean {
		return !this.flowchart.viewOnly;
	}

	get canInsertPreviousNode(): boolean {
		return !this.isBlankChild
			&& this.isRootChild
			&& this.canInsertNode
			&& this.parentNode._cmp.hasBranches;
	}

	get canInsertNextNode(): boolean {
		return this.canInsertNode
			&& !this.node.disableInsertNextNode;
	}

	get element(): HTMLElement {
		return this._elementRef.nativeElement;
	}

	get content(): HTMLElement {
		return this.isBoxed
			? this.wrapperBlockEleRef.nativeElement
			: this.contentBlockEleRef.nativeElement;
	}

	get btnInsertPreviousNode(): HTMLElement {
		return this.btnInsertPreviousNodeEleRef?.nativeElement;
	}

	get btnInsertNextNode(): HTMLElement {
		return this.btnInsertNextNodeEleRef?.nativeElement;
	}

	get splitingPoint(): HTMLElement {
		return this.splitingPointEleRef?.nativeElement;
	}

	get mergingPoint(): HTMLElement {
		return this.mergingPointEleRef?.nativeElement;
	}

	constructor(
		@Inject( CUBFlowchartComponent )
		protected flowchart: CUBFlowchartComponent
	) {}

	ngOnInit() {
		addObjectGetter( this.node, '_cmp', this );

		this._previousNodeDiffer
			= this
			._keyValueDiffers
			.find( this.previousNode || {} )
			.create();
		this._nextNodeDiffer
			= this
			._keyValueDiffers
			.find( this.node.nextNode || {} )
			.create();
		this._parentNodeDiffer
			= this
			._keyValueDiffers
			.find( this.parentNode || {} )
			.create();
		this._childNodesDiffer
			= this
			._iterableDiffers
			.find( this.node.childNodes || [] )
			.create( null );

		this
		.flowchart
		.update$
		.pipe(
			debounceTime( 0 ),
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this._cdRef.markForCheck();
		});

		this
		.flowchart
		.reposition$
		.pipe(
			debounceTime( 0 ),
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this._repositionAllLines();
		});

		this
		.flowchart
		.scaling$
		.pipe(
			debounceTime( 0 ),
			untilCmpDestroyed( this )
		)
		.subscribe(( ratio: number ) => {
			this._scaleAllLines( ratio );
		});

		this
		.rendered
		.pipe(
			debounceTime( 0 ),
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this._removeAllLines();
			this._drawLines();

			this.node._onReady?.( this );

			delete this.node._onReady;
		});
	}

	ngDoCheck() {
		const previousNodeChanges: NodeChanges
			= this._previousNodeDiffer.diff(
				this.previousNode
			);

		if ( previousNodeChanges ) {
			setTimeout(() => {
				this._drawLineFromPreviousNode();
			});
		}

		const nextNodeChanges: NodeChanges
			= this._nextNodeDiffer.diff(
				this.node.nextNode
			);

		if ( nextNodeChanges ) {
			this._createNextNodeCmp();
		}

		const parentNodeChanges: NodeChanges
			= this._parentNodeDiffer.diff(
				this.parentNode
			);

		if ( parentNodeChanges ) {
			setTimeout(() => {
				this._drawLinesFromParentNode();
			});
		}

		const childNodesChanges: ChildNodesChanges
			= this._childNodesDiffer.diff(
				this.node.childNodes
			);

		if ( childNodesChanges ) {
			this._createChildNodeCmps();
		}
	}

	ngAfterViewInit() {
		this.rendered.emit();

		const onResized: _.DebouncedFunc<() => void>
			= _.debounce(
				() => this.flowchart.reposition(),
				100
			);

		this._resizeObserver
			= new ResizeObserver( onResized );

		this._resizeObserver.observe( this.element );
		this._resizeObserver.observe( this.content );
	}

	ngOnDestroy() {
		this._removeAllLines();

		this._resizeObserver?.disconnect();
	}

	/**
	 * Gets the previous node of this node.
	 * @returns A `CUBFlowchartNode`.
	 */
	public getPreviousNode(): CUBFlowchartNode {
		return this.previousNode;
	}

	/**
	 * Gets the parent node of this node.
	 * @returns A `CUBFlowchartNode`.
	 */
	public getParentNode(): CUBFlowchartNode {
		return this.parentNode;
	}

	/**
	 * Inserts a next node to this node.
	 * @param node The node to be inserted as the next node.
	 * @param scrollToThisNode Indicates if the flowchart should scroll to the inserted node.
	 * @returns A `Promise<CUBFlowchartNodePromiseResolve>` that resolves after the child node is ready.
	 */
	public insertNextNode(
		nextNode: CUBFlowchartNode,
		scrollToThisNode?: boolean
	): Promise<CUBFlowchartNodePromiseResolve> {
		return new Promise(( resolve: any ) => {
			this.flowchart.shouldUpdateLineStackPosition();

			if ( nextNode ) {
				nextNode.nextNode = this.node.nextNode;
				this.node.nextNode = nextNode;
			} else {
				delete this.node.nextNode;
			}

			this.flowchart.update();

			nextNode._onReady = (
				cmp: CUBFlowchartNodeComponent
			) => {
				if ( scrollToThisNode ) {
					cmp.scrollTo();
				}

				resolve([ nextNode, cmp ]);
			};
		});
	}

	/**
	 * Adds a child node to this node.
	 * @param node The node to be added as the child node.
	 * @param position The position at which to add the child node.
	 * @param scrollToThisNode Indicates if the flowchart should scroll to the added node.
	 * @returns A `Promise<CUBFlowchartNodePromiseResolve>` that resolves after the child node is ready.
	 */
	public addChildNode(
		childNode: CUBFlowchartNode,
		position: number = -1,
		scrollToThisNode?: boolean
	): Promise<CUBFlowchartNodePromiseResolve> {
		return new Promise(( resolve: any ) => {
			this.flowchart.shouldUpdateLineStackPosition();

			const childNodes: CUBFlowchartNode[]
				= this.node.childNodes ||= [];

			if ( position === -1 ) {
				childNodes.push( childNode );
			} else {
				childNode.nextNode = childNodes[ position ];
				childNodes[ position ] = childNode;
			}

			this.flowchart.update();

			childNode._onReady = (
				cmp: CUBFlowchartNodeComponent
			) => {
				if ( scrollToThisNode ) {
					cmp.scrollTo();
				}

				resolve([ childNode, cmp ]);
			};
		});
	}

	/**
	 * Destroys this node.
	 * Cannot destroy the root node.
	 * @returns A `Promise<CUBFlowchartNodePromiseResolve>` that resolves after the child node is destroyed.
	 */
	public destroy(): Promise<CUBFlowchartNodePromiseResolve> {
		return new Promise(( resolve: any, reject: any ) => {
			if ( this.hasPreviousNode ) {
				this.flowchart.shouldUpdateLineStackPosition();

				this.previousNode.nextNode
					= this.node.nextNode;

				this.node._cmpRef.onDestroy(() => {
					setTimeout(() => {
						const nodeNeedScrollTo: CUBFlowchartNode
							= this.node.nextNode || this.previousNode;

						nodeNeedScrollTo._cmp.scrollTo();
					});

					resolve([ this.node, this ]);
				});
				this.node._cmpRef.destroy();
			} else if ( this.hasParentNode ) {
				this.flowchart.shouldUpdateLineStackPosition();

				this.parentNode.childNodes[ this.position ]
					= this.node.nextNode;

				this.node._cmpRef.onDestroy(() => {
					resolve([ this.node, this ]);
				});
				this.node._cmpRef.destroy();
			} else {
				reject( new Error( 'Cannot destroy the root node.' ) );
			}
		});
	}

	/**
	 * Expands the children block of node.
	 */
	public expand() {
		this.flowchart.shouldUpdateLineStackPosition();

		this.isCollapsed = false;

		this._createChildNodeCmps();

		setTimeout( () => this.scrollTo() );
	}

	/**
	 * Collapses the children block of node.
	 */
	public collapse() {
		this.flowchart.shouldUpdateLineStackPosition();

		this.isCollapsed = true;

		this.childNodesFactory.clear();

		setTimeout( () => this.scrollTo() );
	}

	/**
	 * Scrolls to this node.
	 * @param options An object containing the coordinates to scroll to
	 * or options for smooth scrolling.
	 */
	public scrollTo(
		options?: ScrollIntoViewOptions
	) {
		this.content.scrollIntoView({
			block: 'center',
			inline: 'center',

			...options,
		});
	}

	protected onContentClicked( e: MouseEvent ) {
		e.stopPropagation();

		if ( this.flowchart.isGrabbing ) {
			return;
		}

		this
		.flowchart
		.nodeClicked
		.emit({
			flowchart: this.flowchart,
			node: this.node,
			event: e,
		});
	}

	protected onBtnInsertPreviousNodeClicked(
		event: MouseEvent
	) {
		event.stopPropagation();

		this
		.flowchart
		.nodeAddon
		.emit({
			flowchart: this.flowchart,
			sourceNode: this.parentNode,
			position: this.position,
			event,
		});
	}

	protected onBtnInsertNextNodeClicked(
		event: MouseEvent
	) {
		event.stopPropagation();

		this
		.flowchart
		.nodeAddon
		.emit({
			flowchart: this.flowchart,
			sourceNode: this.node,
			event,
		});
	}

	protected onBtnAddChildNodeClicked(
		event: MouseEvent
	) {
		event.stopPropagation();

		this
		.flowchart
		.nodeAddon
		.emit({
			flowchart: this.flowchart,
			sourceNode: this.parentNode,
			position: this.position,
			event,
		});
	}

	/**
	 * Creates a next node component within this node.
	 */
	private _createNextNodeCmp() {
		if ( !this.hasNextNode ) {
			this.nextNodeFactory.clear();

			if ( this.hasParentNode ) {
				this._drawLinesFromParentNode();
			}

			return;
		}

		// Removes the line drawn to merging point
		// before creates the next node component.
		this._removeLine( LineName.ToMergingPoint );

		this._createNodeCmp(
			this.nextNodeFactory,
			this.node.nextNode,
			this.node,
			this.parentNode
		);
	}

	/**
	 * Creates child node components within this node.
	 */
	private _createChildNodeCmps() {
		if ( !this.hasChildNodes ) {
			this.childNodesFactory.clear();
			return;
		}

		this._childNodeCmpRefs = _.map(
			this.node.childNodes,
			(
				childNode: CUBFlowchartNode,
				idx: number
			): ComponentRef<CUBFlowchartNodeComponent> => {
				const cmpRef: ComponentRef<CUBFlowchartNodeComponent>
					= this._childNodeCmpRefs?.[ idx ];

				if ( cmpRef?.instance.isBlankChild ) {
					cmpRef.destroy();
				}

				return this._createNodeCmp(
					this.childNodesFactory,
					childNode || {
						id: null,
						disableInsertNextNode: true,
					},
					undefined,
					this.node,
					idx
				);
			}
		);
	}

	/**
	 * Creates a node component within the flowchart.
	 * @param factory - The `ViewContainerRef` which acts as the anchor point for inserting the created node component.
	 * @param node - The node to be created.
	 * @param previousNode - (Optional) The previous node in the sequence.
	 * @param parentNode - (Optional) The parent node in the hierarchy.
	 * @param index - (Optional) The index at which the node should be inserted. Defaults to 0.
	 */
	private _createNodeCmp(
		factory: ViewContainerRef,
		node: CUBFlowchartNode,
		previousNode?: CUBFlowchartNode,
		parentNode?: CUBFlowchartNode,
		index: number = 0
	): ComponentRef<CUBFlowchartNodeComponent> {
		if ( factory.get( index ) ) {
			factory.detach( index );
		}

		let cmpRef: ComponentRef<CUBFlowchartNodeComponent>
			= node._cmpRef;

		if ( cmpRef ) {
			factory.insert( cmpRef.hostView, index );
		} else {
			cmpRef = factory.createComponent(
				CUBFlowchartNodeComponent,
				{ index }
			);

			addObjectGetter(
				node,
				'_cmpRef',
				function() {
					return cmpRef
						&& !cmpRef.hostView.destroyed
						? cmpRef
						: null;
				}
			);
		}

		cmpRef.setInput( 'node', node );
		cmpRef.setInput( 'previousNode', previousNode );
		cmpRef.setInput( 'parentNode', parentNode );
		cmpRef.setInput( 'position', index );

		cmpRef.changeDetectorRef.detectChanges();

		return cmpRef;
	}

	/**
	 * Draws all connected lines.
	 */
	private _drawLines() {
		// If this node can insert a previous node,
		// draw a line from the insert previous node button to this node.
		if ( this.canInsertPreviousNode ) {
			this._drawLineFromInsertPreviousNodeButton();
		}

		// If this node can insert a next node,
		// draw a line from this node to the insert next node button.
		if ( this.canInsertNextNode ) {
			this._drawLineToInsertNextNodeButton();
		}

		// If this node has branches,
		// draw a line from this node to the spliting point.
		if ( this.hasBranches ) {
			this._drawLineToSplitingPoint();
		}

		// If this node has the previous node,
		// draw a line from the previous node to this node.
		if ( this.hasPreviousNode ) {
			this._drawLineFromPreviousNode();
		}

		// If this node has the parent node,
		// draw lines from the parent node to this node.
		if ( this.hasParentNode ) {
			this._drawLinesFromParentNode();
		}
	}

	/**
	 * Draws a line from the insert previous node button to this node.
	 */
	private _drawLineFromInsertPreviousNodeButton() {
		this._addLine(
			{
				start: this.btnInsertPreviousNode,
				startPlug: 'behind',
				end: this.content,
			},
			LineName.FromInsertPreviousNodeButton
		);
	}

	/**
	 * Draws a line from this node to the insert next node button.
	 */
	private _drawLineToInsertNextNodeButton() {
		const options: LeaderLineNew.Options = {
			end: this.btnInsertNextNode,
			endPlug: 'behind',
		};

		if ( this.hasBranches ) {
			options.start = this.mergingPoint;
			options.startPlug = 'behind';
		} else {
			options.start = this.content;
		}

		this._addLine(
			options,
			LineName.ToInsertNextNodeButton
		);
	}

	/**
	 * Draws a line from this node to the spliting point.
	 */
	private _drawLineToSplitingPoint() {
		this._addLine(
			{
				start: this.content,
				end: this.splitingPoint,
				endPlug: 'behind',
			},
			LineName.ToSpitingPoint
		);
	}

	/**
	 * Draws a line from the previous node to this node.
	 */
	private _drawLineFromPreviousNode() {
		// If this node has not a previous node,
		// removes the line from the previous node.
		if ( !this.hasPreviousNode ) {
			this._removeLine( LineName.FromPreviousNode );
			return;
		}

		// Removes the line from the spliting point
		// before draws a line from the previous node.
		this._removeLine( LineName.FromSplitingPoint );

		// Removes the line from insert previous node button
		// before draws a line from the previous node.
		this._removeLine( LineName.FromInsertPreviousNodeButton );

		const previousNodeCmp: CUBFlowchartNodeComponent
			= this.previousNode._cmp;
		const options: LeaderLineNew.Options = {
			start: previousNodeCmp.content,
			end: this.content,
		};

		if ( previousNodeCmp.canInsertNextNode ) {
			options.start = previousNodeCmp.btnInsertNextNode;
			options.startPlug = 'behind';
		} else if ( previousNodeCmp.hasBranches ) {
			options.start = previousNodeCmp.mergingPoint;
			options.startPlug = 'behind';
		}

		this._addLine(
			options,
			LineName.FromPreviousNode
		);
	}

	/**
	 * Draws a line from the spliting point of the parent node to this node,
	 * and a line from this node to the merging point of the parent node.
	 */
	private _drawLinesFromParentNode() {
		if ( !this.hasParentNode ) {
			this._removeLine( LineName.FromSplitingPoint );
			this._removeLine( LineName.ToMergingPoint );
			return;
		}

		const parentNodeCmp: CUBFlowchartNodeComponent
			= this.parentNode._cmp;

		if ( !parentNodeCmp.hasBranches ) {
			return;
		}

		if ( this.isRootChild ) {
			const options: LeaderLineNew.Options = {
				start: parentNodeCmp.splitingPoint,
				startPlug: 'behind',
				end: this.content,
				label: this
				.parentNode
				.childNodeLineCaptions?.[
					this.position
				],
			};

			if ( this.canInsertPreviousNode ) {
				options.end = this.btnInsertPreviousNode;
				options.endPlug = 'behind';
			}

			if ( this.isBlankChild ) {
				options.endPlug = 'behind';
			}

			this._addLine(
				{
					...options,
					...getBranchLineOptions(
						options.start as HTMLElement,
						options.end as HTMLElement,
						BranchLineType.Spliting
					),
				},
				LineName.FromSplitingPoint
			);
		}

		if ( this.isLeafChild ) {
			const options: LeaderLineNew.Options = {
				start: this.content,
				end: parentNodeCmp.mergingPoint,
				endPlug: 'behind',
			};

			if ( this.isBlankChild ) {
				options.startPlug = 'behind';
			}

			if ( this.canInsertNextNode ) {
				options.start = this.btnInsertNextNode;
				options.startPlug = 'behind';
			} else if ( this.hasBranches ) {
				options.start = this.mergingPoint;
				options.startPlug = 'behind';
			}

			this._addLine(
				{
					...options,
					...getBranchLineOptions(
						options.start as HTMLElement,
						options.end as HTMLElement,
						BranchLineType.Merging
					),
				},
				LineName.ToMergingPoint
			);
		}
	}

	/**
	 * @param options
	 * @param name
	 * @returns A connected `LeaderLineNew`.
	 */
	private _addLine(
		options?: LeaderLineNew.Options,
		name?: LineName
	): LeaderLineNew {
		if ( name ) {
			this._lineMap ||= new Map();
		}

		let line: LeaderLineNew;

		if ( !this._lineMap?.has( name ) ) {
			line = new LeaderLineNew({
				...DEFAULT_LINE_OPTIONS,
				...options,

				scaleRatio: this.flowchart.scaleRatio,
				container: this.flowchart.lineStack,
			});

			this._lineMap.set( name, line );
		} else if ( this._lineMap ) {
			line = this._lineMap.get( name );

			line.setOptions( options );
		}

		return line;
	}

	/**
	 * Removes a line by name
	 * @param name The name of the line which to be removed
	 */
	private _removeLine( name: LineName ) {
		if ( !this._lineMap?.has( name ) ) {
			return;
		}

		this._lineMap.get( name ).remove();
		this._lineMap.delete( name );
	}

	/**
	 * Removes all connected lines.
	 */
	private _removeAllLines() {
		if ( !this._lineMap ) {
			return;
		}

		for ( const key of this._lineMap.keys() ) {
			this._removeLine( key );
		}

		this._lineMap.clear();
	}

	/**
	 * Re-positions all connected lines.
	 */
	private _repositionAllLines() {
		if ( !this._lineMap ) {
			return;
		}

		for ( const line of this._lineMap.values() ) {
			line.position();
		}
	}

	/**
	 * Scales all connected lines.
	 * @param ratio The ratio which to be scaled.
	 */
	private _scaleAllLines( ratio: number ) {
		if ( !this._lineMap ) {
			return;
		}

		for ( const line of this._lineMap.values() ) {
			line.scaleRatio = ratio;
		}
	}

}
