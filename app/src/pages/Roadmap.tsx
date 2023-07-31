import { t } from "@lingui/macro";
import axios from "axios";
import { useQuery } from "react-query";

import { InfoHeader } from "../components/InfoHeader";
import { Page } from "../ui/Shared";
import { SectionTitle } from "../ui/Typography";
import { Helmet } from "react-helmet";

export default function Roadmap() {
  const { data } = useQuery("roadmap", getRoadmap, {
    staleTime: Infinity,
    suspense: true,
  });
  return (
    <>
      <Helmet>
        <title>Flowchart Fun Roadmap</title>
        <meta
          name="description"
          content="The current roadmap for Flowchart Fun"
        />
      </Helmet>
      <Page>
        <InfoHeader title={t`Roadmap`} />
        <section className="grid gap-5">
          <SectionTitle>Areas of Research</SectionTitle>
          {data && (
            <div
              className="issues post-content"
              dangerouslySetInnerHTML={{ __html: data.areasOfResearch }}
            />
          )}
        </section>
      </Page>
    </>
  );
}

async function getRoadmap() {
  const roadmap = await axios.get("/api/roadmap");
  return roadmap.data as {
    areasOfResearch: string;
  };
}
