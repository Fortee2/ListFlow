import React from 'react';
import './App.css';
import { Routes, Route,  Link } from "react-router-dom";
import Description  from './features/engine/Description';
import ListingComponent from './features/listings/ListingComponent';
import TopMenu  from './features/navigation/TopMenu'; 


function App() {
  return (
    <div className="App bg-slate-100">

          {/* Routes nest inside one another. Nested route paths build upon
        parent route paths, and nested route elements render inside
        parent route elements. See the note about <Outlet> below. */}
      <Routes>
        <Route path="/" element={<TopMenu />}>
          <Route index element={<Home />} />
          <Route path="Description" element={<Description />} />
          <Route path="Listing" element={<ListingComponent />} />

          {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </div>
  );
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}


function NoMatch() {
  return (
    <div>
      <h2>Nothing to see here!</h2>
      <p>
        <Link to="/">Go to the home page</Link>
      </p>
    </div>
  );
}

export default App;
