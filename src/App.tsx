import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { NewApplication } from './pages/NewApplication';
import { Clients } from './pages/Clients';
import { Placeholder } from './pages/Placeholder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"                element={<Dashboard />} />
          <Route path="/applications"    element={<Applications />} />
          <Route path="/new-application" element={<NewApplication />} />
          <Route path="/clients"         element={<Clients />} />
          <Route path="/analytics"       element={<Placeholder title="Analytics" subtitle="Portfolio analytics & reporting" />} />
          <Route path="/compliance"      element={<Placeholder title="Compliance" subtitle="BSA/AML & regulatory monitoring" />} />
          <Route path="/settings"        element={<Placeholder title="Settings" subtitle="Platform configuration" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
