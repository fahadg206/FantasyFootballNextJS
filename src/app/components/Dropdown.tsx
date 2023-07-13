import { useState } from "react";
import Link from "next/link";
const Dropdown = () => {
  const [dropdown, setDropDown] = useState(true);
  return (
    <div className="">
      <div className="relative inline-block text-left">
        <div>
          <button
            onClick={() => setDropDown(!dropdown)}
            type="button"
            className=" inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold  shadow-sm shadow-[#1a1a1c]  "
            id="menu-button"
            aria-expanded="true"
            aria-haspopup="true"
          >
            Options
            <svg
              className="-mr-1 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        {!dropdown ? (
          <div
            className="absolute right-0 z-10 mt-5 w-56 origin-top-right rounded-md shadow-lg shadow-[#1a1a1c] ring-1  ring-black ring-opacity-5 focus:outline-none"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
          >
            <div className="py-1 border-1 border-black" role="none">
              <a
                href="#"
                className="dark:text-[#E8EBEA] hover:text-[#E8EBEA] text-[#1a1a1c] hover:bg-purple-900 block px-4 py-2 text-sm "
                role="menuitem"
                id="menu-item-0"
              >
                League History
              </a>
              <a
                href="#"
                className="dark:text-[#E8EBEA] hover:text-[#E8EBEA] text-[#1a1a1c] hover:bg-purple-900  block px-4 py-2 text-sm"
                role="menuitem"
                id="menu-item-1"
              >
                Join!
              </a>
              <a
                href="#"
                className="dark:text-[#E8EBEA] hover:text-[#E8EBEA] text-[#1a1a1c] hover:bg-purple-900  block px-4 py-2 text-sm"
                role="menuitem"
                id="menu-item-2"
              >
                License
              </a>
              <form method="POST" action="#" role="none">
                <button
                  type="submit"
                  className="dark:text-[#E8EBEA] hover:text-[#E8EBEA] text-[#1a1a1c]  hover:bg-purple-900 block w-full px-4 py-2 text-left text-sm"
                  role="menuitem"
                  id="menu-item-3"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Dropdown;
