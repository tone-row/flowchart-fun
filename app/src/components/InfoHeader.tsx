import "../pages/post/Post.css";

import { Box } from "../slang";
import { PageTitle } from "../ui/Typography";
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
      <PageTitle>{title}</PageTitle>
      {description && (
        <p className="text-blue-400 dark:text-blue-300 text-lg font-bold">
          {description}
        </p>
      )}
      <OnlyInEnglish />
    </Box>
  );
}
