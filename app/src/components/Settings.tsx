import React from "react";
import { Box, Type } from "../slang";
import { Twitter } from "./svgs";
import styles from "./Settings.module.css";

export default function Settings() {
  return (
    <Box
      px={4}
      pb={4}
      at={{ tablet: { pb: 0 } }}
      template="minmax(0, 1fr) auto / none"
    >
      <Box>
        <Type size={1}>User Settings</Type>
      </Box>
      <Box
        flow="column"
        items="end normal"
        content="normal space-between"
        self="stretch"
        gap={12}
      >
        <Box gap={3}>
          <Type as="a" href="https://js.cytoscape.org/" size={-1}>
            Built with Cytoscape.js
          </Type>
          <Type
            as="a"
            href="https://github.com/tone-row/flowchart-fun"
            size={-1}
          >
            Hosted on Github
          </Type>

          <Type as="a" href="https://tone-row.com" size={-1}>
            Made by Tone Row
          </Type>
        </Box>
        <a href="https://twitter.com/row_tone" className={styles.iconButton}>
          <Twitter className={styles.twitter} />
        </a>
      </Box>
    </Box>
  );
}
