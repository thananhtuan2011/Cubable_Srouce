import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { ENVIRONMENT } from './environments/environment';
import { hmrBootstrap } from './hmr';

// Add Google scripts
function addGoogleScripts() {
	const script1: HTMLScriptElement = document.createElement( 'script' );
	script1.src = 'https://apis.google.com/js/api.js';
	script1.setAttribute( 'defer', '' );
	script1.setAttribute( 'async', '' );
	document.head.appendChild( script1 );

	const script2: HTMLScriptElement = document.createElement( 'script' );
	script2.src = 'https://apis.google.com/js/platform.js';
	script2.setAttribute( 'defer', '' );
	script2.setAttribute( 'async', '' );
	document.head.appendChild( script2 );

	const script3: HTMLScriptElement = document.createElement( 'script' );
	script3.src = 'https://accounts.google.com/gsi/client';
	script3.setAttribute( 'defer', '' );
	script3.setAttribute( 'async', '' );
	document.head.appendChild( script3 );
}

// Add One Drive scripts
function addOneDriveScripts() {
	const script: HTMLScriptElement = document.createElement( 'script' );

	script.src = 'https://js.live.net/v7.2/OneDrive.js';

	script.setAttribute( 'defer', '' );

	document.head.appendChild( script );
}

// Add Dropbox scripts
function addDropboxScripts() {
	const script: HTMLScriptElement = document.createElement( 'script' );

	script.id = 'dropboxjs';
	script.src = 'https://www.dropbox.com/static/api/2/dropins.js';

	script.setAttribute( 'defer', '' );
	script.setAttribute( 'data-app-key', ENVIRONMENT.DROPBOX_APP_KEY );

	document.head.appendChild( script );
}

const bootstrap = () => platformBrowserDynamic().bootstrapModule( AppModule );
const afterBootstrap = () => {
	'serviceWorker' in navigator
		&& ENVIRONMENT.PRODUCTION
		&& navigator.serviceWorker.register( './ngsw-worker.js' );

	addGoogleScripts();
	addOneDriveScripts();
	addDropboxScripts();
};

if ( ENVIRONMENT.PRODUCTION ) {
	enableProdMode();
}

if ( ENVIRONMENT.HMR ) {
	if ( ( module as any ).hot ) {
		hmrBootstrap( module, bootstrap, afterBootstrap );
	} else {
		console.error( 'HMR is not enabled for webpack-dev-server!' );
		// eslint-disable-next-line no-console
		console.log( 'Are you using the --hmr flag for ng serve?' );
	}
} else {
	bootstrap()
	.then( afterBootstrap )
	.catch( console.error );
}
