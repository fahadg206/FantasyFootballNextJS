import Link from "next/link";

export default function Navbar() {
  return (
    <div className="border-b-2 border-[white] border-opacity-5  ">
      <ul className="flex flex-start">
        <Link href="/" className="m-auto">
          <li>RainCity League</li>
        </Link>
        <Link href="/">
          <li className="mr-2">Home</li>
        </Link>
        <Link href="/articles">
          <li className="mr-2">Articles</li>
        </Link>
        <Link href="/schedule">
          <li className="mr-2">Schedule</li>
        </Link>
        <Link href="/standings">
          <li className="mr-2">Standings</li>
        </Link>
        <Link href="/powerrankings">
          <li className="mr-2">Power Rankings</li>
        </Link>
        <Link href="/more">
          <li className="mr-2">More</li>
        </Link>
      </ul>
    </div>
  );
}
