import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home/Home";
import Event from "./pages/Event/Event";
import Events from "./pages/Events/Events";
import Blogs from "./pages/Blogs/Blogs";
import Blog from "./pages/Blog/Blog";
import Authentication from "./pages/Authentication/Authentication";
import AddEvent from './pages/AddEvent/AddEvent';
import EditEvent from './pages/EditEvent/EditEvent';
import Profile from './pages/Profile/Profile';
import MyHackathons from './pages/MyHackathons/MyHackathons';
import EventRegistrations from './pages/EventRegistrations/EventRegistrations';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/authentication" element={<Authentication />} />
          <Route path="/events" element={<Events />} />
          <Route path="/event/:id" element={<Event />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<Blog />} />
          <Route path="/add-event" element={<AddEvent />} />
          <Route path="/edit-event/:id" element={<EditEvent />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-hackathons" element={<MyHackathons />} />
          <Route path="/event-registrations/:id" element={<EventRegistrations />} />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
