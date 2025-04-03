import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Forget from "./Forget";
import Preferences from "./Preferences";
import ResetPassword from "./ResetPassword";
import Newsapp from "./Newsapp";
import AlertsPopup from "./AlertsPopup";
import Dashboard from "./Dashboard";
import Aboutus from "./Aboutus";
import Profile from "./Profile";
import Subscribe from "./Subscribe"
import Payment from "./Payment"

function App() {

    return (
        <Router>
            <Routes>
                <Route path='/' element={<Login />} />
                <Route path="/forgot-password" element={<Forget />} />
                <Route path="/preferences" element={<Preferences />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/alerts" element={<AlertsPopup />} />
                <Route path="/aboutus" element={<Aboutus />} />
                <Route path='/Newsapp' element={<Newsapp />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/subscribe' element={<Subscribe />} />
                <Route path='/pay' element={<Payment />} />
            </Routes>
        </Router>
    );
}

export default App;