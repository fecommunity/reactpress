import { ReactPressLogoMark } from "@/shared/brand";

type LogoProps = {
  className?: string;
};

function Logo({ className }: LogoProps) {
  return <ReactPressLogoMark className={className} />;
}

export default Logo;
