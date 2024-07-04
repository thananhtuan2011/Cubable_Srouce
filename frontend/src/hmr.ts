import {
	ApplicationRef,
	ComponentRef,
	NgModuleRef
} from '@angular/core';
import { createNewHosts } from '@angularclass/hmr';

export const hmrBootstrap = (
	module: any,
	bootstrap: () => Promise<NgModuleRef<any>>,
	callback?: () => void
) => {
	let ngModule: NgModuleRef<any>;

	module.hot.accept();

	bootstrap()
	.then(( mod: NgModuleRef<any> ) => {
		ngModule = mod;

		callback?.();
	});

	module.hot.dispose(() => {
		const appRef: ApplicationRef = ngModule.injector.get( ApplicationRef );
		const elements: HTMLElement[] = appRef.components.map(
			( c: ComponentRef<any> ) => c.location.nativeElement
		);
		const makeVisible: () => void = createNewHosts( elements );

		ngModule.destroy();

		makeVisible();
	});
};
