import { useState } from 'react';
import Sidebar from './components/Sidebar';

import WorkProgressCustomers from './pages/WorkProgressCustomers';
import Master from './pages/Master';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import SiteSurvey from './pages/SiteSurvey';
import Installations from './pages/Installations';
import Team from './pages/Team';
import Settings from './pages/Settings';

export default function App() {
  const [nav, setNav] = useState('Customers');

  const PAGE_MAP = {
    Customers: <WorkProgressCustomers />,
    'Work & Customers': <WorkProgressCustomers />,
    'Work Progress': <WorkProgressCustomers />,
    Master: <Master />,
    Dashboard: <Dashboard />,
    Projects: <Projects />,
    'Site Survey': <SiteSurvey />,
    Installations: <Installations />,
    Team: <Team />,
    Settings: <Settings />,
  };

  return (
    <div className="app">
      <Sidebar active={nav} onSelect={setNav} />
      <main>
        {PAGE_MAP[nav] || (
          <div className="page">
            <div className="page-head">
              <h1>{nav}</h1>
              <p>Coming soon</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
