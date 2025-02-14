import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import App from './App.jsx'
import Authentication from './pages/Authentication/Authentication.jsx'
import Upcoming from './pages/Upcoming/Upcoming.jsx'
import Categories from './pages/Categories/Categories.jsx'
import Blog from './pages/Blog/Blog.jsx'
import Discover from './pages/Discover/Discover.jsx'
import Navbar from './components/Navbar/Navbar.jsx'
import Profile from './pages/Profile/Profile.jsx'
import NotFound from './pages/NotFound/NotFound.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Navbar  />
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/upcoming" element={<Upcoming />} />
      <Route path="/authentication" element={<Authentication />} />
      <Route path='/profile' element={<Profile/>} />
      <Route path="*" element={<NotFound />} />
      Route
    </Routes>
  </BrowserRouter>,
)
