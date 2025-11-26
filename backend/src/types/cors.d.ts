declare module 'cors' {
	import { RequestHandler } from 'express';

	interface CorsOptions {
		origin?: boolean | string | RegExp | (string | RegExp)[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
		methods?: string | string[];
		allowedHeaders?: string | string[];
		exposedHeaders?: string | string[];
		credentials?: boolean;
		maxAge?: number;
		preflightContinue?: boolean;
	}

	function cors(options?: CorsOptions): RequestHandler;

	namespace cors {}

	export default cors;
}
