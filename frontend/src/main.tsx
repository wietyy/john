import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { Home } from './homepage/Home';
import { BrowserRouter } from 'react-router';
import { Route } from 'react-router';
import { Routes } from 'react-router';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

const appElement = <App />;
const routeElement = <Route path="/app" element={appElement} />;
const homeElement = <Home />;
const homeRouteElement = <Route path="/" element={homeElement} />;
const routesElement = (
  <Routes>
    {homeRouteElement}
    {routeElement}
  </Routes>
);
const browserHandler = <BrowserRouter>{routesElement}</BrowserRouter>;

root.render(browserHandler);