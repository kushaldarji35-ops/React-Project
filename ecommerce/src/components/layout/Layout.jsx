import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WelcomeModal from "../ui/WelcomeModal";
import "./Layout.css";

export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="site-layout">
      <WelcomeModal />
      <AnnouncementBar />
      <Navbar />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
