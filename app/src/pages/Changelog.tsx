import { t } from "@lingui/macro";
import axios from "axios";
import { useQuery } from "react-query";

import { InfoContainer } from "../components/InfoContainer";
import { InfoHeader } from "../components/InfoHeader";
import { Box, Type } from "../slang";
import styles from "./Changelog.module.css";

export default function Changelog() {
  const releases = useQuery("changelog", getChangelog, {
    staleTime: Infinity,
    suspense: true,
  });
  return (
    <InfoContainer>
      <Box gap={16} className={styles.Changelog} style={{ maxWidth: 500 }}>
        <InfoHeader title={t`Changelog`} />
        {releases.data && (
          <Box gap={16}>
            {releases.data.map((release) => (
              <Box as="section" key={release.id}>
                <Box
                  flow="column"
                  items="baseline normal"
                  content="normal start"
                  gap={4}
                >
                  <Type as="h2" size={3}>
                    {release.name}
                  </Type>
                  <Type
                    as="time"
                    dateTime={release.date}
                    color="color-lineNumbers"
                  >
                    {release.niceDate}
                  </Type>
                  <a href={release.url} className="view-on-github-btn">
                    View on GitHub
                  </a>
                </Box>
                <div
                  className="changelog-section-content slang-type size-0"
                  dangerouslySetInnerHTML={{ __html: release.body }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </InfoContainer>
  );
}

async function getChangelog() {
  const response = await axios.get("/api/changelog");
  const changelog = response.data as Release[];
  return changelog;
}

type Release = {
  id: string;
  name: string;
  date: string;
  niceDate: string;
  body: string;
  url: string;
};
