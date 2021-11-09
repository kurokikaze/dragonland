// global window
import { Layout, Menu } from 'antd';
import { useRoutes, A } from 'hookrouter';
import routes from './router.js';

const { Header, Content } = Layout;

const getCurrentItem = () => {
	if (global.window.location.pathname.includes('/deck-editor')) return ['deck-editor'];
	if (global.window.location.pathname.includes('/statistics')) return ['statistics'];
	return ['challenge'];
};

export default function App() {
	const routeResult = useRoutes(routes);

	return <Layout>
		<Header className="header">
			<Menu theme="dark" mode="horizontal" selectedKeys={getCurrentItem()}>
				<Menu.Item key="challenge"><A href="/">Challenge</A></Menu.Item>
				<Menu.Item key="deck-editor"><A href="/deck-editor">Deck Editor</A></Menu.Item>
				<Menu.Item disabled key="statistics">Statistics</Menu.Item>
			</Menu>
		</Header>
		<Layout>
			<Content>
				{routeResult}
			</Content>
		</Layout>
	</Layout>;
}
