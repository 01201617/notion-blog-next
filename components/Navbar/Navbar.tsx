import Link from "next/link";
import React from "react";
import Breadcrumb from "./Breadcrumb";

const Navbar = () => {
  return (
    <nav className="container flex mx-auto lg:px-2 px-5 ">
      <div className="container flex items-center ">
        <Link href="/" className="text-2xl font-medium">
          Home
        </Link>
        <Breadcrumb />
      </div>
      <div>
        <ul className="flex items-center text-sm py-4">
          <li>
            <Link
              href="/about"
              className="block px-4 py-2 hover:text-sky-900 transition-all duration-300"
            >
              about
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
