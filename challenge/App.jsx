import {useRoutes} from 'hookrouter';
import routes from './router.js';

export default function App() {
	const routeResult = useRoutes(routes);

	return routeResult;
}
