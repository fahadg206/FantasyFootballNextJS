"use client";

// Use usePathname for catching route name.
import { usePathname } from "next/navigation";

export const LayoutProvider = ({ children }: any) => {
  const pathname = usePathname();
  return (
    <>
      {pathname === "/" && <h1>Welcome to Posts page!</h1>}
      {children}
    </>
  );
};
