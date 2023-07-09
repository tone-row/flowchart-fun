import { t } from "@lingui/macro";
import axios from "axios";
import { useQuery } from "react-query";

import { InfoHeader } from "../components/InfoHeader";
import { Page2 } from "../ui/Shared";
import { SectionTitle } from "../ui/Typography";

export default function Roadmap() {
  const { data } = useQuery("roadmap", getRoadmap, {
    staleTime: Infinity,
    suspense: true,
  });
  return (
    <Page2>
      <InfoHeader title={t`Roadmap`} />
      {data && data.issues.length > 0 && (
        <section className="grid gap-5">
          <SectionTitle>Active Tasks</SectionTitle>
          <div className="issues post-content">
            {data.issues.map((issue) => (
              <div className="issue" key={issue.title}>
                <h3>{issue.title}</h3>
                <div
                  className="issue-description"
                  dangerouslySetInnerHTML={{ __html: issue.description }}
                />
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="grid gap-5">
        <SectionTitle>Areas of Research</SectionTitle>
        {data && (
          <div
            className="issues post-content"
            dangerouslySetInnerHTML={{ __html: data.areasOfResearch }}
          />
        )}
      </section>
    </Page2>
  );
}

type Issue = {
  title: string;
  description: string;
};

async function getRoadmap() {
  const roadmap = await axios.get("/api/roadmap");
  return roadmap.data as {
    issues: Issue[];
    areasOfResearch: string;
  };
}
