import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	Input,
	OnChanges,
	SimpleChanges,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import {
	startWith
} from 'rxjs';
import {
	ULID,
	isValid
} from 'ulidx';
import moment from 'moment-timezone';
import _ from 'lodash';

import {
	Throttle,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBListComponent
} from '@cub/material/list';

import {
	Field
} from '@main/common/field/objects';

import {
	FormulaData
} from '../../field/interfaces';
import {
	FORMULA_LOGICAL_FUNCTIONS
} from '../resources';
import {
	Highlighter,
	Replacer
} from '../objects';

import {
	ISyntaxError,
	LogicEditor
} from './logic-editor';
import {
	buildRegExp,
	IFoundWord,
	ISelection,
	safeEval,
	STRING_REGEXP
} from './syntax-editor.component';

export const FIELD_REPLACER_PREFIX: string = 'field_';
export const FIELD_REPLACER_REGEX: RegExp = new RegExp(
	`#{${FIELD_REPLACER_PREFIX}([0-7][0-9A-HJKMNP-TV-Z]{25})}`,
	'g'
);
export const buildFieldReplacer: ReturnType<typeof _.memoize> = _.memoize(
	function( fieldID: ULID ): string {
		return `#{${FIELD_REPLACER_PREFIX}${fieldID}}`;
	}
);
export const parseFieldIDFormReplacer: ReturnType<typeof _.memoize> = _.memoize(
	function( replacer: string ): ULID {
		return _.matchAll( FIELD_REPLACER_REGEX, replacer )?.[ 0 ]?.[ 1 ];
	}
);

interface ILogicalFunction {
	keyword: string;
	description?: string;
	syntax?: string;
	argument?: string;
	example?: string;
	expectedResult?: string;
}

interface ISuggesting {
	type: 'logical-function' | 'field';
	target: ILogicalFunction | Field;
	matching?: IFoundWord;
}

const LOGICAL_FUNCTIONS: string[] = _.chain( FORMULA_LOGICAL_FUNCTIONS )
.map( 'keyword' )
.sort()
.reverse()
.value();
const LOGICAL_FUNCTION_REGEX: RegExp = buildRegExp( LOGICAL_FUNCTIONS );
const HIGHLIGHTERS: Highlighter[] = [
	new Highlighter( 'function', LOGICAL_FUNCTION_REGEX ),
];

@Unsubscriber()
@Component({
	selector		: 'formula-editor',
	templateUrl		: '../templates/formula-editor.pug',
	styleUrls		: [ '../styles/logic-editor.scss', '../styles/formula-editor.scss' ],
	host			: { class: 'logic-editor formula-editor' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
	encapsulation	: ViewEncapsulation.None,
})
export class FormulaEditorComponent
	extends LogicEditor
	implements OnChanges, AfterViewInit {

	@ViewChild(
		CUBListComponent,
		{ static: true }
	) public listComp: CUBListComponent;

	@Input() public fields: Field[];
	@Input() public data: FormulaData;

	public readonly logicalFunctions:
		ILogicalFunction[] = FORMULA_LOGICAL_FUNCTIONS;
	public readonly highlighters:
		Highlighter[] = HIGHLIGHTERS;
	public readonly fieldReplacer:
		Replacer = new Replacer(
			'field',
			FIELD_REPLACER_REGEX,
			( matched: string, replacer: Replacer ): string => {
				const id: ULID
					= _.matchAll( replacer.matcher, matched )?.[ 0 ]?.[ 1 ];

				if ( !isValid( id ) ) return matched;

				const field: Field = _.get( this._fieldLookup, id );

				if ( !field || field.isInvalid ) return matched;

				const name: string = field.name;

				return `<span>
					${name}</span>`;
			}
		);
	public readonly replacers: Replacer[] = [ this.fieldReplacer ];
	public readonly beforeSyntaxEditorKeydownFn: (
		_: KeyboardEvent
	) => boolean = this.beforeSyntaxEditorKeydown.bind( this );
	public readonly beforeSyntaxEditorHighlightBracketsFn: (
		text: string,
		start: number,
		end: number
	) => boolean = this.beforeSyntaxEditorHighlightBrackets.bind( this );

	public filteredLogicalFunctions: ILogicalFunction[];
	public filteredFields: Field[];
	public suggesting: ISuggesting = {} as ISuggesting;

	private _fieldLookup: ObjectType<Field>;

	get displayingLogicalFunctions(): ILogicalFunction[] {
		return _.sortBy(
			this.suggesting.matching
				? this.filteredLogicalFunctions
				: this.logicalFunctions,
			'keyword'
		);
	}

	get displayingFields(): Field[] {
		return _.sortBy(
			this.suggesting.matching
				? this.filteredFields
				: this.fields,
			( field: any ) => moment( field.extra.createdAt ));
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.fields ) return;

		this._fieldLookup = _.keyBy( this.fields, 'id' );

		this.syntaxEditor?.markAsUpdate();
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		this.syntaxEditor.markAsUpdate();

		this.listComp.items.changes
		.pipe(
			startWith( this.listComp.items ),
			untilCmpDestroyed( this )
		)
		.subscribe( () => this.listComp.pointItemByIndex( 0 ) );
	}

	/**
	 * @param {Event} e
	 * @return {void}
	 */
	public onSyntaxEditorInput( e: Event ) {
		if ( ( e as InputEvent ).inputType === 'insertParagraph' ) return;

		this.suggest();
	}

	/**
	 * @param {ILogicalFunction} logicalFunction
	 * @return {void}
	 */
	public suggestLogicalFunction( logicalFunction: ILogicalFunction ) {
		this.suggesting.type = 'logical-function';
		this.suggesting.target = logicalFunction;
	}

	/**
	 * @param {Field} field
	 * @return {void}
	 */
	public suggestField( field: Field ) {
		this.suggesting.type = 'field';
		this.suggesting.target = field;
	}

	/**
	 * @param {ILogicalFunction} logicalFunction
	 * @return {void}
	 */
	public addLogicalFunction( logicalFunction: ILogicalFunction ) {
		this.syntaxEditor.insertText(
			`${ logicalFunction.keyword }()`,
			this.suggesting.matching
				? _.pick( this.suggesting.matching, [ 'start', 'end' ] )
				: undefined,
			-1
		);

		this.reset();
	}

	/**
	 * @param {Field} field
	 * @return {void}
	 */
	public addField( field: Field ) {
		this.syntaxEditor.insertText(
			buildFieldReplacer( field.id ),
			this.suggesting.matching
				? _.pick( this.suggesting.matching, [ 'start', 'end' ] )
				: undefined
		);

		this.reset();
	}

	/**
	 * @return {ISyntaxError}
	 */
	public override checkSyntax(): ISyntaxError {
		this.isSyntaxChecking = true;
		this.syntaxError = undefined;

		try {
			const value: string = this.value;
			const invalidFields: string[] = [];

			_.forEach(
				value.split( STRING_REGEXP ),
				( str: string ) => {
					if ( !str || str.match( STRING_REGEXP ) ) return;

					_.forEach(
						_.matchAll( FIELD_REPLACER_REGEX, str ),
						( arr: RegExpExecArray ) => {
							!_.get( this._fieldLookup, arr[ 1 ] )
								&& invalidFields.push( `#${arr[ 1 ]}` );
						}
					);
				}
			);

			if ( invalidFields.length ) {
				const err: Error = new Error();

				err.name = 'CustomError';
				err.message = JSON.stringify({
					key: 'NOT_FOUND_FIELDS',
					params: {
						fields: invalidFields.join( ', ' ),
					},
				});

				throw err;
			}

			const execScript: string = value
			.replace( FIELD_REPLACER_REGEX, 'true' )
			.replace( LOGICAL_FUNCTION_REGEX, '_.noop' );

			safeEval( execScript );
		} catch ( e: any ) {
			e = e as Error;

			this.syntaxError = e.name === 'CustomError'
				? JSON.parse( e.message )
				: { key: 'SYNTAX_ERROR' };
		} finally {
			this.isSyntaxChecking = false;
		}

		this.cdRef.markForCheck();

		return this.syntaxError;
	}

	/**
	 * @return {void}
	 */
	@Throttle( 225 )
	protected suggest() {
		this.reset();

		const { focusIndex }: ISelection
			= this.syntaxEditor.getSelection();

		if ( focusIndex === null ) return;

		const foundWord: IFoundWord
			= this.syntaxEditor.findWordAt( focusIndex );
		const word: string = foundWord?.word.toLowerCase();

		if ( !word ) return;

		// Logical functions
		this.filteredLogicalFunctions = _.filter(
			this.logicalFunctions,
			( o: ILogicalFunction ) => {
				return o.keyword
				.toLowerCase()
				.indexOf( word ) === 0;
			}
		);

		// Fields
		// if ( !this.fieldReplacer.match( word ) ) {
		this.filteredFields = _.filter(
			this.fields,
			( field: Field ) => {
				return field.name
				.toLowerCase()
				.indexOf( word ) === 0;
			}
		);
		// }

		if ( this.filteredLogicalFunctions.length
			|| this.filteredFields.length ) {
			this.suggesting.matching = foundWord;
		}

		this.cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	protected reset() {
		this.filteredLogicalFunctions
			= this.filteredFields
			= this.suggesting.matching
			= null;
	}

	/**
	 * @param {KeyboardEvent} e
	 * @return {boolean}
	 */
	protected beforeSyntaxEditorKeydown(
		e: KeyboardEvent
	): boolean {
		const isContinueKeydown: boolean = !this.suggesting.matching;

		if ( !isContinueKeydown ) {
			switch ( e.key ) {
				case 'Enter':
				case 'Tab':
					e.preventDefault();

					switch ( this.suggesting.type ) {
						case 'logical-function':
							this.addLogicalFunction(
								this.suggesting.target as ILogicalFunction
							);
							break;
						case 'field':
							this.addField( this.suggesting.target as Field );
							break;
					}
					break;
				case 'ArrowUp':
					e.preventDefault();

					this.listComp.pointPreviousItem();
					break;
				case 'ArrowDown':
					e.preventDefault();

					this.listComp.pointNextItem();
					break;
			}
		}

		return isContinueKeydown;
	}

	/**
	 * @param {string} text
	 * @param {number} start
	 * @param {number} end
	 * @return {boolean}
	 */
	protected beforeSyntaxEditorHighlightBrackets(
		text: string,
		start: number,
		end: number
	): boolean {
		const t: string
			= text.substring( start - 1, end + 1 );
		const replacer: Replacer
			= Replacer.find( this.replacers, t ) as Replacer;

		return !replacer || t.search( replacer.matcher ) !== 0;
	}

}
