import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { BrowserRouter, Route, Routes } from 'react-router'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App/>}></Route>
    </Routes>
  </BrowserRouter>
)