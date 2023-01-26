import "./post/Post.css";

import axios from "axios";
import { useQuery } from "react-query";

import { InfoContainer } from "../components/InfoContainer";
import { InfoHeader } from "../components/InfoHeader";
import { Box, Type } from "../slang";

export default function Roadmap() {
  const { data } = useQuery("roadmap", getRoadmap, {
    staleTime: Infinity,
    suspense: true,
  });
  return (
    <InfoContainer>
      <Box gap={16} content="start" className="slang-type size-0">
        <InfoHeader title="Roadmap" />
        {data && (
          <Box as="section" gap={6}>
            <Type as="h2" size={3} color="color-highlightColor">
              Active Tasks
            </Type>
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
          </Box>
        )}
        <Box as="section" gap={6}>
          <Type as="h2" size={3} color="color-highlightColor">
            Areas of Research
          </Type>
          {data && (
            <div
              className="issues post-content"
              dangerouslySetInnerHTML={{ __html: data.areasOfResearch }}
            />
          )}
        </Box>
      </Box>
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
