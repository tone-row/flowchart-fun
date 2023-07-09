import { t } from "@lingui/macro";
import axios from "axios";
import { useQuery } from "react-query";

import { InfoHeader } from "../components/InfoHeader";
import { Page2 } from "../ui/Shared";
import { SectionTitle } from "../ui/Typography";

export default function Changelog() {
  const releases = useQuery("changelog", getChangelog, {
    staleTime: Infinity,
    suspense: true,
  });
  return (
    <Page2>
      <div className="grid gap-8">
        <InfoHeader title={t`Changelog`} />
        {releases.data && (
          <div className="grid gap-12 mt-6">
            {releases.data.map((release) => (
              <section key={release.id} className="grid gap-3">
                <div className="grid gap-2">
                  <time
                    dateTime={release.date}
                    className="text-xs text-neutral-500 dark:text-neutral-400"
                  >
                    {release.niceDate}
                  </time>
                  <SectionTitle>
                    <a href={release.url}>{release.name}</a>
                  </SectionTitle>
                </div>
                <div
                  className="post-content text-neutral-900"
                  dangerouslySetInnerHTML={{ __html: release.body }}
                />
              </section>
            ))}
          </div>
        )}
      </div>
    </Page2>
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
