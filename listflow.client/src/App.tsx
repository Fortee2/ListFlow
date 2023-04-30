import React from 'react';
import logo from './logo.svg';
import './App.css';
import Description  from './features/engine/Description';
import ListingComponent from './features/listings/ListingComponent';

function App() {
  return (
    <div className="App">
       <Description />
       <ListingComponent />
    </div>
  );
}

export default App;
