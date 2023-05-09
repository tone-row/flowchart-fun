import { t } from "@lingui/macro";
import axios from "axios";
import { useQuery } from "react-query";

import { InfoContainer } from "../components/InfoContainer";
import { InfoHeader } from "../components/InfoHeader";

export default function Changelog() {
  const releases = useQuery("changelog", getChangelog, {
    staleTime: Infinity,
    suspense: true,
  });
  return (
    <InfoContainer style={{ maxWidth: 550 }}>
      <div className="grid gap-8">
        <InfoHeader title={t`Changelog`} />
        {releases.data && (
          <div className="grid gap-12 mt-6">
            {releases.data.map((release) => (
              <section key={release.id} className="grid gap-3">
                <div className="grid gap-2 justify-start">
                  <h2 className="text-4xl font-mono">
                    <a href={release.url}>{release.name}</a>
                  </h2>
                  <time
                    dateTime={release.date}
                    className="text-sm text-neutral-500"
                  >
                    {release.niceDate}
                  </time>
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
