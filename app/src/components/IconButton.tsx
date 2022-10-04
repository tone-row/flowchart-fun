import VisuallyHidden from "@reach/visually-hidden";
import { IconProps } from "phosphor-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

import { Box, BoxProps } from "../slang";
import styles from "./IconButton.module.css";
import { smallIconSize, Tooltip, tooltipSize } from "./Shared";

export function IconButton({
  icon: Icon,
  onClick,
  label,
  ...props
}: {
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  onClick: () => void;
  label: string;
} & BoxProps) {
  return (
    <Tooltip
      label={label}
      aria-label={label}
      className={`slang-type size-${tooltipSize}`}
    >
      <Box
        as="button"
        onClick={onClick}
        type="button"
        p={2}
        rad={1}
        className={styles.IconButton}
        {...props}
      >
        <Icon size={smallIconSize + 2} />
        <VisuallyHidden>{label}</VisuallyHidden>
      </Box>
    </Tooltip>
  );
}
