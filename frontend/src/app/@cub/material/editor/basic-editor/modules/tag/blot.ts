/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import Quill from 'quill';
import Embed from 'quill/blots/embed';
import _ from 'lodash';

export enum TagBlotAttachedSource {
	Replacement = 'replacement',
	Insertion = 'insertion',
	Unknown = 'unknown',
}

export type TagBlotValue = {
	tag: string;
	name: string | HTMLElement;
	icon?: string;
	buttonRemove?: boolean;
	attachedSource?: TagBlotAttachedSource;
	metadata?: ObjectType;
};

export default class TagBlot extends Embed {

	static blotName: string = 'tag';
	static tagName: string = 'span';
	static className: string = 'ql-tag';

	static create(
		value: TagBlotValue
	): Node {
		const node: HTMLElement
			= super.create() as HTMLElement;

		let name: string;

		if ( _.isString( value.name ) ) {
			name = value.name;
		} else if (
			value.name instanceof HTMLElement
		) {
			name = value.name.innerHTML;
		}

		node.dataset.name
			= name || '';
		node.dataset.icon
			= value.icon || '';
		node.dataset.tag
			= value.tag || '';
		node.dataset.buttonRemove
			= _.isBoolean( value.buttonRemove )
				? _.toString( value.buttonRemove )
				: '';
		node.dataset.attachedSource
			= value.attachedSource
				|| TagBlotAttachedSource.Unknown;
		node.dataset.metadata
			= value.metadata
				? JSON.stringify( value.metadata )
				: '';

		this.appendChild( node, value );

		return node;
	}

	static value(
		{ dataset }: HTMLElement
	): TagBlotValue {
		const value: TagBlotValue = {
			tag: dataset.tag,
			name: dataset.name,
		};

		if ( dataset.icon ) {
			value.icon = dataset.icon;
		}

		if ( dataset.buttonRemove ) {
			value.buttonRemove
				= Boolean( dataset.buttonRemove );
		}

		if ( dataset.metadata ) {
			value.metadata
				= JSON.parse( dataset.metadata );
		}

		return value;
	}

	static formats(): boolean {
		return true;
	}

	static appendName(
		node: HTMLElement,
		name: string | HTMLElement
	) {
		let el: HTMLElement;

		if ( _.isString( name ) ) {
			el = document.createElement( 'span' );

			el.innerHTML = name;
		} else if ( name instanceof HTMLElement ) {
			el = name;
		}

		if ( !el ) {
			return;
		}

		el.setAttribute( 'title', el.textContent );
		el.classList.add( 'ql-tag-name' );

		node.appendChild( el );
	}

	static appendIcon(
		node: HTMLElement,
		icon: string
	) {
		const el: HTMLElement
			= document.createElement( 'i' );

		el.classList.add(
			'ql-tag-icon',
			'icon',
			`icon-${icon}`
		);

		node.appendChild( el );
	}

	static appendButtonRemove(
		node: HTMLElement
	) {
		const el: HTMLElement
			= document.createElement( 'i' );

		el.classList.add(
			'ql-tag-btn-remove',
			'icon',
			'icon-close'
		);

		el.addEventListener(
			'click',
			( e: MouseEvent ) => {
				e.stopPropagation();
				e.preventDefault();

				const quill: Quill
					= Quill.find(
						Quill
						.find( node )
						.scroll
						.domNode
						.parentElement
					) as Quill;

				quill.editReadOnly(() => {
					node.remove();
					quill.update();
				});
			}
		);

		node.appendChild( el );
	}

	static appendChild(
		node: HTMLElement,
		value: TagBlotValue
	) {
		if ( value.icon ) {
			this.appendIcon( node, value.icon );
		}

		this.appendName( node, value.name );

		if ( value.buttonRemove ) {
			this.appendButtonRemove( node );
		}
	}

	attach() {
		super.attach();

		const rootNode: Node
			= this.scroll.domNode;
		const node: HTMLElement
			= this.domNode as HTMLElement;

		rootNode.dispatchEvent(
			new CustomEvent(
				`${TagBlot.blotName}-attached`,
				{
					bubbles: true,
					detail: {
						blot: this,
						attachedSource:
							node.dataset.attachedSource,
					},
				}
			)
		);

		node.addEventListener(
			'click',
			( event: MouseEvent ) => {
				rootNode.dispatchEvent(
					new CustomEvent(
						`${TagBlot.blotName}-clicked`,
						{
							bubbles: true,
							detail: {
								blot: this,
								event,
							},
						}
					)
				);
			}
		);

		node.addEventListener(
			'mousemove',
			( event: MouseEvent ) => {
				rootNode.dispatchEvent(
					new CustomEvent(
						`${TagBlot.blotName}-hovered`,
						{
							bubbles: true,
							detail: {
								blot: this,
								event,
							},
						}
					)
				);
			}
		);
	}

	detach() {
		super.detach();

		setTimeout(() => {
			this
			.scroll
			.domNode
			.dispatchEvent(
				new CustomEvent(
					`${TagBlot.blotName}-detached`,
					{
						bubbles: true,
						detail: this,
					}
				)
			);
		});
	}

	html(): string {
		const node: HTMLElement
			= this.domNode as HTMLElement;

		return node.dataset.tag
			|| node.dataset.name;
	}

}
