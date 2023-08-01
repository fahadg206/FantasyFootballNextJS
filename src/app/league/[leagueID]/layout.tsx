// Use usePathname for catching route name.
import { usePathname } from "next/navigation";

const LayoutProvider = ({ children }: any) => {
  return <div>{children}</div>;
};

export default LayoutProvider;
