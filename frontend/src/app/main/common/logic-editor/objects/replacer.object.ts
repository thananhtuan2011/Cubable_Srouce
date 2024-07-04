import _ from 'lodash';
import {
	ULID
} from 'ulidx';

import {
	FIELD_METADATA
} from '../../field/resources';
import{
	Matcher
} from './matcher.object';
import {
	Field
} from '../../field/objects';

export interface IReplacerInfo {
	name: string;
	matched: string;
	length: number;
}

export class Replacer extends Matcher {

	public static ATTRIBUTE_KEY: string = 'data-replacer';
	public static NAME_ATTRIBUTE_KEY: string = 'data-replacer-name';
	public static MATCHED_ATTRIBUTE_KEY: string = 'data-replacer-matched';
	public static LENGTH_ATTRIBUTE_KEY: string = 'data-replacer-length';

	/**
	 * @param {Node} node
	 * @return {boolean}
	 */
	public static isNode( node: Node ): boolean {
		return node?.nodeType === Node.ELEMENT_NODE
			&& ( node as HTMLElement ).hasAttribute( Replacer.ATTRIBUTE_KEY );
	}

	/**
	 * @param {Node} node
	 * @return {IReplacerInfo}
	 */
	public static parseNode( node: Node ): IReplacerInfo {
		if ( node?.nodeType !== Node.ELEMENT_NODE ) return;

		const element: HTMLElement = node as HTMLElement;

		return {
			name	: element.getAttribute( Replacer.NAME_ATTRIBUTE_KEY ),
			matched	: element.getAttribute( Replacer.MATCHED_ATTRIBUTE_KEY ),
			length	: Number(
				element.getAttribute( Replacer.LENGTH_ATTRIBUTE_KEY ) ),
		};
	}

	/**
	 * @param {Node} element
	 * @return {number}
	 */
	public static countChild( element: Node ): number {
		let count: number = 0;

		_.forEach( element.childNodes, ( node: Node ) => {
			switch ( node.nodeType ) {
				case Node.TEXT_NODE:
					count += node.nodeValue.length;
					break;
				case Node.ELEMENT_NODE:
					count += ( node as HTMLElement ).contentEditable === 'true'
						? Replacer.countChild( node )
						: 1;
					break;
				default:
					throw new Error(
						`Unexpected node type: ${ node.nodeType }` );
			}
		} );

		return count;
	}

	/**
	 * @param {string} matched
	 * @return {HTMLElement}
	 */
	public render(
		matched: string,
		fields: Field[]
	): HTMLElement {
		const id: ULID = _.chain( matched )
		.replace(/#{field_([0-9a-zA-Z]+)}/, '$1')
		.value( );

		const foundField: Field = _.find(
			fields,
			[ 'id', id ]
		);

		const icon: string = FIELD_METADATA.get( foundField.dataType ).icon;

		const html: string = this.replace( matched );
		const element: HTMLAnchorElement = document.createElement( 'a' );

		element.innerHTML =
			`&#xFEFF;<i class='icon-${icon}'></i><span contenteditable="false">
				${ html }
			</span>&#xFEFF;`;

		element.setAttribute( 'class', 'syntax-editor__field' );
		element.setAttribute( 'href', '#' );
		element.setAttribute( 'oninput', 'return false;' );
		element.setAttribute( Replacer.ATTRIBUTE_KEY, 'true' );
		element.setAttribute( Replacer.NAME_ATTRIBUTE_KEY, this.name );
		element.setAttribute( Replacer.MATCHED_ATTRIBUTE_KEY, matched );
		element.setAttribute(
			Replacer.LENGTH_ATTRIBUTE_KEY,
			String( Replacer.countChild( element ) )
		);

		return element;
	}

}
