import { Injectable } from '@angular/core';

@Injectable()
export class AppearanceService {

	/**
	 * @param {string} primaryColor
	 * @return {void}
	 */
	public setPrimaryColor( primaryColor: string = null ) {
		// Remove old metas
		document.head
		.querySelectorAll( 'meta[name="theme-color"]' )
		.forEach( ( meta: HTMLMetaElement ) => meta.remove() );

		// Create new metas
		const lightMeta: HTMLMetaElement = document.createElement( 'meta' );
		const darkMeta: HTMLMetaElement = document.createElement( 'meta' );

		lightMeta.name = darkMeta.name = 'theme-color';
		lightMeta.content = darkMeta.content = primaryColor;
		( lightMeta as any ).media = '(prefers-color-scheme: light)';
		( darkMeta as any ).media = '(prefers-color-scheme: dark)';

		// Append metas
		document.head.appendChild( lightMeta );
		document.head.appendChild( darkMeta );

		// Set variable style
		document.body.style.setProperty( '--primary-color', primaryColor );
	}

}
