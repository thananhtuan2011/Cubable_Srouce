import {
	ChangeDetectionStrategy,
	Component,
	Input,
	ViewEncapsulation
} from '@angular/core';
import _ from 'lodash';

import { Highlighter } from '../objects';

import {
	ISyntaxError,
	LogicEditor
} from './logic-editor';
import {
	buildRegExp,
	safeEval
} from './syntax-editor.component';

const OPERATOR_REGEX: RegExp = buildRegExp([ 'AND', 'OR' ]);
const OPTION_REGEX: RegExp = /[0-9]+/g;
const VALID_SYNTAX_REGEX: RegExp = /[0-9]+|\(|\)/g;
const HIGHLIGHTERS: Highlighter[] = [
	new Highlighter( 'operator', OPERATOR_REGEX ),
];

@Component({
	selector		: 'expression-editor',
	templateUrl		: '../templates/expression-editor.pug',
	styleUrls		: [ '../styles/logic-editor.scss', '../styles/expression-editor.scss' ],
	host			: { class: 'logic-editor expression-editor' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class ExpressionEditorComponent extends LogicEditor {

	@Input() public options: number[];

	public readonly highlighters: Highlighter[] = HIGHLIGHTERS;

	/**
	 * @return {ISyntaxError}
	 */
	public override checkSyntax(): ISyntaxError {
		this.isSyntaxChecking = true;
		this.syntaxError = undefined;

		try {
			const value: string = this.value;
			const invalidText: string = _.chain( value )
			.replace( OPERATOR_REGEX, '' )
			.replace( VALID_SYNTAX_REGEX, '' )
			.trim()
			.value();

			if ( invalidText.length ) throw new Error();

			const invalidOptions: string[] = [];

			_.forEach(
				value.match( OPTION_REGEX ),
				( option: string ) => {
					!_.includes( this.options, Number( option ) )
						&& invalidOptions.push( `#${ option }` );
				}
			);

			if ( invalidOptions.length ) {
				const err: Error = new Error();

				err.name = 'CustomError';
				err.message = JSON.stringify({
					key: 'NOT_FOUND_OPTIONS',
					params: {
						options: invalidOptions.join( ', ' ),
					},
				});

				throw err;
			}

			const execScript: string = value
			.replace( OPERATOR_REGEX, '+' )
			.replace( /\+[ ]+\+/g, '++' );

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

}
