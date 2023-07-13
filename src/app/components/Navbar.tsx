// import Link from "next/link";

// export default function Navbar() {
//   return (
//     <div className="border-b-2 border-[white] border-opacity-5 text-[16px] ">
//       <ul className="flex">
//         <Link
//           className="mr-auto hover:underline hover:decoration-[#9750DD] hover:decoration-4"
//           href="/"
//         >
//           <li>RainCity League</li>
//         </Link>
//         <Link href="/">
//           <li className="mr-2 hover:underline hover:decoration-[#9750DD] hover:decoration-4">
//             Home
//           </li>
//         </Link>
//         <Link href="/articles">
//           <li className="mr-2 hover:underline hover:decoration-[#9750DD] hover:decoration-4">
//             Articles
//           </li>
//         </Link>
//         <Link href="/matchups">
//           <li className="mr-2 hover:underline hover:decoration-[#9750DD] hover:decoration-4">
//             Matchups
//           </li>
//         </Link>
//         <Link href="/standings">
//           <li className="mr-2 hover:underline hover:decoration-[#9750DD] hover:decoration-4">
//             Standings
//           </li>
//         </Link>
//         <Link href="/powerrankings">
//           <li className="mr-2 hover:underline hover:decoration-[#9750DD] hover:decoration-4">
//             Power Rankings
//           </li>
//         </Link>
//         <Link href="/more">
//           <li className="mr-2 hover:underline hover:decoration-[#9750DD] hover:decoration-4">
//             More
//           </li>
//         </Link>
//       </ul>
//     </div>
//   );
// }

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function NavBar() {
  const [navbar, setNavbar] = useState(false);
  return (
    <div>
      <nav className="w-full dark:bg-[#202123] top-0 left-0 right-0 z-10">
        <div className="justify-between px-4 mx-auto lg:max-w-7xl md:items-center md:flex md:px-8">
          <div>
            <div className="flex items-center justify-between py-3 md:py-5 md:block">
              {/* LOGO */}
              <Link href="/">
                <h2 className="text-2xl  font-bold ">LOGO</h2>
              </Link>
              {/* HAMBURGER BUTTON FOR MOBILE */}
              <div className="md:hidden">
                <button
                  className="p-2 text-gray-700 rounded-md outline-none focus:border-gray-400 focus:border"
                  onClick={() => setNavbar(!navbar)}
                >
                  {navbar ? (
                    <Image src="/close.svg" width={30} height={30} alt="logo" />
                  ) : (
                    <Image
                      src="/hamburger-menu.svg"
                      width={30}
                      height={30}
                      alt="logo"
                      className="focus:border-none active:border-none"
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div>
            <div
              className={`flex-1 justify-self-center pb-3 mt-8 md:block md:pb-0 md:mt-0 ${
                navbar ? "p-12 md:p-0 block" : "hidden"
              }`}
            >
              <ul className="h-screen md:h-auto items-center justify-center md:flex ">
                <li className="pb-6 py-2 md:px-6 text-center border-b-2 md:border-b-0  hover:bg-purple-900  border-purple-900  md:hover:text-purple-600 md:hover:bg-transparent">
                  <Link href="/" onClick={() => setNavbar(!navbar)}>
                    Home
                  </Link>
                </li>
                <li className="pb-6  py-2 md:px-6 text-center border-b-2 md:border-b-0  hover:bg-purple-900  border-purple-900  md:hover:text-purple-600 md:hover:bg-transparent">
                  <Link href="/articles" onClick={() => setNavbar(!navbar)}>
                    Articles
                  </Link>
                </li>
                <li className="pb-6 py-2 px-6 text-center  border-b-2 md:border-b-0  hover:bg-purple-600  border-purple-900  md:hover:text-purple-600 md:hover:bg-transparent">
                  <Link href="/matchups" onClick={() => setNavbar(!navbar)}>
                    Matchups
                  </Link>
                </li>
                <li className="pb-6  py-2 px-6 text-center  border-b-2 md:border-b-0  hover:bg-purple-600  border-purple-900  md:hover:text-purple-600 md:hover:bg-transparent">
                  <Link href="/standings" onClick={() => setNavbar(!navbar)}>
                    Standings
                  </Link>
                </li>
                <li className="pb-6 py-2 px-6 text-center  border-b-2 md:border-b-0  hover:bg-purple-600  border-purple-900  md:hover:text-purple-600 md:hover:bg-transparent">
                  <Link
                    href="/powerrankings"
                    onClick={() => setNavbar(!navbar)}
                  >
                    Power Rankings
                  </Link>
                </li>
                <li className="pb-6  py-2 px-6 text-center  border-b-2 md:border-b-0  hover:bg-purple-600  border-purple-900  md:hover:text-purple-600 md:hover:bg-transparent">
                  <Link href="/more" onClick={() => setNavbar(!navbar)}>
                    More
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;
