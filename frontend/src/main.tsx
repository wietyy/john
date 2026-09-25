import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { BrowserRouter } from 'react-router';
import { Route } from 'react-router';
import { Routes } from 'react-router';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

const appElement = <App />;
const routeElement = <Route path="/" element={appElement} />;
const routesElement = (
  <Routes>
    {routeElement}
  </Routes>
);
const browserHandler = <BrowserRouter>{routesElement}</BrowserRouter>;

root.render(browserHandler);