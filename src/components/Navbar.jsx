import { NavLink, Link } from "react-router-dom";

const base = "px-3 py-1.5 rounded-md text-sm font-medium transition-colors";
const active = "bg-[#6a3e2e] text-white shadow-sm";
const inactive = "text-[#6a3e2e] hover:bg-[#6a3e2e]/80 hover:text-white";

export default function Navbar() {
  return (
    <nav
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50
                 bg-white/80 backdrop-blur-md ring-1 ring-black/10
                 rounded-2xl px-4 py-2 shadow-md"
    >
      <ul className="flex items-center gap-2">
        <li>
          <NavLink to="/" end className={({isActive}) => `${base} ${isActive ? active : inactive}`}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/resources" className={({isActive}) => `${base} ${isActive ? active : inactive}`}>
            Resources
          </NavLink>
        </li>
        <li>
          <NavLink to="/news" className={({isActive}) => `${base} ${isActive ? active : inactive}`}>
            News
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({isActive}) => `${base} ${isActive ? active : inactive}`}>
            About
          </NavLink>
        </li>

      </ul>
    </nav>
  );
}