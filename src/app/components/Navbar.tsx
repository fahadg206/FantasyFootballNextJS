import Link from "next/link";

export default function Navbar() {
  return (
    <div className="border-b-2 border-[white] border-opacity-5 text-[16px] ">
      <ul className="flex">
        <Link
          className="mr-auto hover:underline hover:decoration-[#9750DD] hover:decoration-4"
          href="/"
        >
          <li>RainCity League</li>
        </Link>
        <Link href="/">
          <li className="mr-2 hover:underline hover:decoration-[#9750DD] hover:decoration-4">
            Home
          </li>
        </Link>
        <Link href="/articles">
          <li className="mr-2 hover:underline hover:decoration-[#9750DD] hover:decoration-4">
            Articles
          </li>
        </Link>
        <Link href="/matchups">
          <li className="mr-2 hover:underline hover:decoration-[#9750DD] hover:decoration-4">
            Matchups
          </li>
        </Link>
        <Link href="/standings">
          <li className="mr-2 hover:underline hover:decoration-[#9750DD] hover:decoration-4">
            Standings
          </li>
        </Link>
        <Link href="/powerrankings">
          <li className="mr-2 hover:underline hover:decoration-[#9750DD] hover:decoration-4">
            Power Rankings
          </li>
        </Link>
        <Link href="/more">
          <li className="mr-2 hover:underline hover:decoration-[#9750DD] hover:decoration-4">
            More
          </li>
        </Link>
      </ul>
    </div>
  );
}
