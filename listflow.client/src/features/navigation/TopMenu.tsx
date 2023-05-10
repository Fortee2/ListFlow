import { Link, Outlet } from "react-router-dom";

const TopMenu = () => {
    return (
      
      <div >
        {/* A "layout route" is a good place to put markup you want to
            share across all the pages on your site, like navigation. */}
        <nav className="relative container mx-auto space-x-6 bg-slate-200">
          <div className="flex items-center justify-between">
            {/* add div for logo */}
            <div className="hidden md:flex space-x-6">
              <Link to="/">Home</Link>
              <Link to="/description">Description Engine</Link>
              <Link to="/Listing">Listings</Link>
              <Link to="/nothing-here">Nothing Here</Link>
            </div>
          </div>
        </nav>
  
        <hr />
  
        {/* An <Outlet> renders whatever child route is currently active,
            so you can think about this <Outlet> as a placeholder for
            the child routes we defined above. */}
        <Outlet />
      </div>
    );
  }

  export default TopMenu;