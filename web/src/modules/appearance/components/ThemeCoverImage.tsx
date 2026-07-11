import { useState } from "react";

import { ThemeCoverPlaceholder } from "@/modules/appearance/components/ThemeCoverPlaceholder";

type Props = {
  coverUrl?: string;
  name: string;
  className?: string;
  fill?: boolean;
};

export function ThemeCoverImage({ coverUrl, name, className, fill }: Props) {
  const [failed, setFailed] = useState(false);

  if (!coverUrl || failed) {
    return <ThemeCoverPlaceholder name={name} className={className} fill={fill} />;
  }

  return <img className={className} src={coverUrl} alt={name} onError={() => setFailed(true)} />;
}
