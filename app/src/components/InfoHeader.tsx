import { Box, Type } from "../slang";
import styles from "./InfoHeader.module.css";
import { OnlyInEnglish } from "./OnlyInEnglish";

export function InfoHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Box
      as="header"
      gap={4}
      items="center"
      content="start normal"
      className={styles.InfoHeader}
    >
      <Type weight="700" size={5}>
        {title}
      </Type>
      {description && (
        <Type color="color-highlightColor" weight="700" size={1}>
          {description}
        </Type>
      )}
      <OnlyInEnglish />
    </Box>
  );
}
