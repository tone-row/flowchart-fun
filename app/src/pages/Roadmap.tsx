import { t } from "@lingui/macro";
import axios from "axios";
import { useQuery } from "react-query";

import { InfoContainer } from "../components/InfoContainer";
import { InfoHeader } from "../components/InfoHeader";
import { Type } from "../slang";

export default function Roadmap() {
  const { data } = useQuery("roadmap", getRoadmap, {
    staleTime: Infinity,
    suspense: true,
  });
  return (
    <InfoContainer>
      <div className="grid gap-10">
        <InfoHeader title={t`Roadmap`} />
        {data && (
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
      </div>
    </InfoContainer>
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

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-4xl font-bold text-blue-400 dark:text-blue-100">
      {children}
    </h2>
  );
}
