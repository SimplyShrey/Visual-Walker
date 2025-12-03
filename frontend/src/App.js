import React from 'react';  
import './App.css';
// import Chart from './Chart';
import DashboardPage from './components/DashboardPage';

function App() {
  return (
    // <div className="App">
    //   <Chart />
    // </div>
    <div className="app-container">
      {/* The tech grid background is applied to this container via App.css */}
      <DashboardPage />
    </div>
  );
}

export default App;
