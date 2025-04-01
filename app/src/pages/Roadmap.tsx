import { t } from "@lingui/macro";
import axios from "axios";
import { useQuery } from "react-query";

import { InfoHeader } from "../components/InfoHeader";
import { Page } from "../ui/Shared";
import { Helmet } from "react-helmet";

const img = `<img
          src="/images/roadmap.png"
          alt="Roadmap"
          style="width: 100%;"
          class="md:!max-w-[360px] rounded-2xl md:float-right md:!ml-6 md:!translate-y-11 md:rotate-2"
        />`;

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
          {data && (
            <div
              className="issues post-content"
              dangerouslySetInnerHTML={{ __html: img + data.areasOfResearch }}
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
