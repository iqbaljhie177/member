import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerificationForm from "./components/Verifications/Verify";
import Profile from "./pages/Profile";
import Transactions from "./pages/Transactions";
import Deposit from "./pages/Deposit";
import Notifications from "./pages/Notifications";
import ForgotPassword from "./pages/ForgotPassword";
import Trading from "./pages/Trading";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Redirect />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/verify" element={<VerificationForm />} />
      <Route path="/dashboard/profile" element={<Profile />} />
      <Route path="/dashboard/transactions" element={<Transactions />} />
      <Route path="/dashboard/transactions/deposit" element={<Deposit />} />
      <Route path="/dashboard/notifications" element={<Notifications />} />
      <Route path="/dashboard/trading" element={<Trading />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
};

const Redirect = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/dashboard");
  }, []);
  return <></>;
};

export default App;
