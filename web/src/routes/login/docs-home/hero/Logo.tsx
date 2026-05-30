import { ReactPressLogoMark } from "@/shared/brand/ReactPressLogoMark";

type LogoProps = {
  className?: string;
};

function Logo({ className }: LogoProps) {
  return <ReactPressLogoMark className={className} />;
}

export default Logo;
