import './App.scss';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Front from './Front';
import VideoCall from './VideoCall';


function App() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Front />}></Route>
          <Route path="/patientVideoCall/:patientMrn/:patientEncounterID" element={<VideoCall/>} />          
        </Routes>
      </BrowserRouter>
    );
  }
  
  export default App;
  