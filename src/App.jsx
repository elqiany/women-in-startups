import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Resources from "./pages/Resources.jsx";
import News from "./pages/News.jsx";
import About from "./pages/About.jsx";
import Apply from "./pages/Apply.jsx"; // <-- make sure this exists

export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="pt-24">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/news" element={<News />} />
          <Route path="/about" element={<About />} />
          <Route path="/apply" element={<Apply />} />   {/* <-- this line */}
          <Route path="*" element={<div className="px-6">Page not found</div>} />
        </Routes>
      </main>
    </div>
  );
}