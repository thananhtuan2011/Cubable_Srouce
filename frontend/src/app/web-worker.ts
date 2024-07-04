export type WebWorkerConfig = {
	scriptURL?: string;
	options?: WorkerOptions;
};

export class WebWorker {

	private _worker: Worker;

	constructor(
		scriptURL: string | URL,
		options?: WorkerOptions
	) {
		if (
			typeof Worker !== 'undefined'
		) {
			this._worker
				= new Worker(
					scriptURL,
					{
						type: 'module',
						...options,
					}
				);
		} else {
			throw new Error( 'Web Workers are not supported in this environment.' );
		}
	}

	/**
	 * @param {any} message
	 * @param {StructuredSerializeOptions} options
	 * @return {void}
	 */
	public sendMessage(
		message: any,
		options?: StructuredSerializeOptions
	) {
		this._worker.postMessage(
			message,
			options
		);
	}

	/**
	 * @param {( event: MessageEvent<any> ) => void} listener
	 * @return {any}
	 */
	public onMessage(
		listener: ( event: MessageEvent<any> ) => void
	): any {
		this._worker.onmessage = listener;
	}

	/**
	 * @param {( event: MessageEvent<any> ) => void} listener
	 * @return {any}
	 */
	public onError(
		listener: ( event: ErrorEvent ) => void
	): any {
		this._worker.onerror = listener;
	}

	/**
	 * @return {void}
	 */
	public terminate() {
		this._worker.terminate();
	}

}
