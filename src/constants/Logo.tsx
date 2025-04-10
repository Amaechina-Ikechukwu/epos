import Image from "next/image";
import React from "react";

interface LogoProps {
  style?: React.CSSProperties;
}

export default function Logo({ style }: LogoProps) {
  return (
    <div>
      <Image
        // className="dark:invert"
        src="/logo_primary.png"
        alt="Reciept Branch logo"
        width={180}
        height={38}
        priority
      />
    </div>
  );
}
