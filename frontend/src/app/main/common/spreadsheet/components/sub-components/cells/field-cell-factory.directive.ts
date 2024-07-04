import {
	AfterViewInit,
	ChangeDetectorRef,
	ComponentRef,
	Directive,
	EventEmitter,
	inject,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges,
	ViewContainerRef
} from '@angular/core';
import _ from 'lodash';

import {
	FieldList
} from '@main/common/field/interfaces';
import {
	Field,
	FieldValidationErrors
} from '@main/common/field/objects';

import {
	FieldCell,
	IFieldCell
} from './field-cell';
import {
	FieldCellTouchable
} from './field-cell-touchable';
import {
	FieldCellEditable
} from './field-cell-editable';
import {
	CmpType,
	CmpVariant,
	getCmpVariant
} from './utils';
import {
	FormulaFieldCellFullComponent
} from './formula/cell-full.component';

@Directive({
	selector: '[fieldCellFactory]',
	exportAs: 'fieldCellFactory',
})
export class FieldCellFactoryDirective
implements IFieldCell, AfterViewInit, OnChanges, OnDestroy {

	@Input() public field: Field;
	@Input() public data: any;
	@Input() public readonly: boolean;
	@Input() public selecting: boolean;
	@Input() public otherFields: FieldList;
	@Input() public context: ObjectType;

	@Output() public cellEdited: EventEmitter<any>
		= new EventEmitter<any>();
	@Output() public cellValidated: EventEmitter<FieldValidationErrors | null>
		= new EventEmitter<FieldValidationErrors | null>();

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _vcRef: ViewContainerRef
		= inject( ViewContainerRef );
	private readonly _createCmpThrottle: ReturnType<typeof _.throttle>
		= _.throttle( this._createCmp.bind( this ) );

	private _currCmpRef: ComponentRef<FieldCell>;
	private _fullCmpRef: ComponentRef<FieldCell>;
	private _liteCmpRef: ComponentRef<FieldCell>;

	ngOnChanges( changes: SimpleChanges ) {
		const isFirstCreation: boolean
			= !this._currCmpRef;

		if ( changes.selecting
			|| ( changes.data && isFirstCreation ) ) {
			this._createCmpThrottle();
		}

		if ( isFirstCreation ) {
			return;
		}

		if ( changes.field ) {
			this._forwardCmpInput( 'field' );
		}

		if ( changes.data ) {
			this._forwardCmpInput( 'data' );
		}

		if ( changes.context ) {
			this._forwardCmpInput( 'context' );
		}

		if (
			changes.otherFields
				&& this._currCmpRef.instance
					instanceof
						FormulaFieldCellFullComponent
		) {
			this._forwardCmpInput( 'otherFields' );
		}

		if (
			changes.readonly
				&& this._currCmpRef.instance
					instanceof
						FieldCellEditable
		) {
			this._forwardCmpInput( 'readonly' );
		}

		// if (
		// 	changes.otherFields
		// 		&& this._currCmpRef.instance
		// 			instanceof
		// 				FormulaCellComponent
		// ) {
		// 	this._forwardCmpInput( 'otherFields' );
		// }
	}

	ngOnDestroy() {
		this._vcRef.clear();
	}

	ngAfterViewInit() {
		setTimeout(() => {
			if ( !this.selecting
				|| !this._currCmpRef ) {
				return;
			}

			const { instance }: ComponentRef<FieldCell>
				= this._currCmpRef;

			if (
				instance
					instanceof
						FieldCellTouchable
			) {
				instance.touch();
			}
		});
	}

	/**
	 * Creates a field component.
	 */
	private _createCmp() {
		const variant: CmpVariant
			= getCmpVariant( this.field.dataType );

		if ( !variant ) {
			return;
		}

		if ( !variant.full ) {
			this._createLiteCmp( variant.lite );
			return;
		}

		if ( !variant.lite ) {
			this._createFullCmp( variant.full );
			return;
		}

		this.selecting
			? this._createFullCmp( variant.full )
			: this._createLiteCmp( variant.lite );
	}

	/**
	 * Creates a component with the full variant.
	 * @param cmpType The type of the component.
	 */
	private _createFullCmp( cmpType: CmpType ) {
		if ( this._fullCmpRef ) {
			this._insertCmp( this._fullCmpRef );
		} else {
			this._fullCmpRef
				= this._insertCmp( cmpType );
		}

		const { instance }: ComponentRef<FieldCell>
			= this._fullCmpRef;

		if (
			instance
				instanceof
					FieldCellEditable
		) {
			this._forwardCmpInput( 'readonly' );

			instance.dataEdited
				= this.cellEdited;
			instance.dataValidated
				= this.cellValidated;
		}

		// if (
		// 	instance
		// 		instanceof
		// 			FormulaCellComponent
		// ) {
		// 	this._forwardCmpInput( 'otherFields' );
		// }

		this._cdRef.detectChanges();
	}

	/**
	 * Creates a component with the lite variant.
	 * In case the lite component is not available
	 * and create the full component instead.
	 * @param cmpType The type of the component.
	 */
	private _createLiteCmp(
		cmpType: CmpType | [ CmpType, boolean ]
	) {
		const allowEmptyCreation: boolean
			= cmpType[ 1 ];

		if ( this._liteCmpRef ) {
			this._insertCmp(
				this._liteCmpRef,
				!allowEmptyCreation
			);
		} else {
			this._liteCmpRef
				= this._insertCmp(
					cmpType[ 0 ] || cmpType,
					!allowEmptyCreation
				);
		}

		this._cdRef.detectChanges();
	}

	/**
	 * Inserts the created component or create new.
	 * @param componentRef A created component or a component type.
	 * @param preventEmptyCreation Prevents creating component with empty data.
	 * @returns The ComponentRef<FieldCell> of the created component.
	 */
	private _insertCmp(
		cmpRef: ComponentRef<FieldCell> | CmpType,
		preventEmptyCreation?: boolean
	): ComponentRef<FieldCell> {
		this._currCmpRef?.instance.markAsDetach();

		this._currCmpRef = null;

		this._vcRef.detach();

		if ( preventEmptyCreation
			&& _.isStrictEmpty( this.data ) ) {
			return;
		}

		if ( cmpRef instanceof ComponentRef ) {
			this._vcRef.insert( cmpRef.hostView );
		} else {
			cmpRef = this._vcRef.createComponent( cmpRef );
		}

		const { instance }: ComponentRef<FieldCell>
			= this._currCmpRef
			= cmpRef;

		this._forwardCmpInput( 'field' );
		this._forwardCmpInput( 'data' );
		this._forwardCmpInput( 'context' );

		if (
			instance
				instanceof
					FormulaFieldCellFullComponent
		) {
			this._forwardCmpInput( 'otherFields' );
		}

		instance.markAsAttach();

		return cmpRef;
	}

	/**
	 * Forwards factory input directives
	 * to the created component.
	 * @param inputName
	 * @param inputData
	 */
	private _forwardCmpInput(
		inputName: string,
		inputData: any = this[ inputName ]
	) {
		this._currCmpRef?.setInput(
			inputName,
			inputData
		);
	}

}
