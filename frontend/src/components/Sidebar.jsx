import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const links = [
    { name: "Dashboard", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Stock", path: "/stock" },
    { name: "Sales", path: "/sales" },
    { name: "Sales History", path: "/sales-history" },
  ];

  return (
    <div className="min-h-screen w-64 bg-gray-800 text-white p-4 shadow-lg">
      <h2 className="text-xl font-bold mb-6 text-center">
        📊 Inventory<br />Management System 
      </h2>
      <nav className="flex flex-col space-y-2">
        {links.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            className={({ isActive }) =>
              `px-4 py-2 rounded hover:bg-gray-700 ${
                isActive ? "bg-gray-700 font-semibold" : ""
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
