import "./post/Post.css";

import axios from "axios";
import { useQuery } from "react-query";

import { InfoContainer } from "../components/InfoContainer";
import { InfoHeader } from "../components/InfoHeader";
import { Box, Type } from "../slang";

export default function Roadmap() {
  const issues = useQuery("roadmap", getRoadmap, {
    staleTime: Infinity,
    suspense: true,
  });
  return (
    <InfoContainer>
      <Box gap={16} content="start" className="slang-type size-0">
        <InfoHeader title="Roadmap" />
        {issues.data && (
          <Box as="section" gap={6}>
            <Type as="h2" size={3} color="color-highlightColor">
              Active Tasks
            </Type>
            <div className="issues post-content">
              {issues.data.map((issue) => (
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
          <div className="issues post-content">
            <div className="issue">
              <h3>Migrating to Graph Selector Syntax</h3>
              <div className="issue-description">
                <p>
                  Over the next 3-6 months we will migrate to a slightly
                  different syntax. The reasons are outlined in{" "}
                  <a href="/posts/graph-syntax-css-selector">this post</a>. The
                  strategy for migrating will be outlined in an upcoming post.
                  You can checkout examples of the upcoming syntax here:{" "}
                  <a href="https://graph-selector-syntax.tone-row.com">
                    https://graph-selector-syntax.tone-row.com
                  </a>
                </p>
              </div>
            </div>
            <div className="issue">
              <h3>VS Code and PKMS Integration</h3>
              <div className="issue-description">
                <p>
                  The goal is to bring Flowchart Fun syntax and generated graphs
                  to a VS Code extension as well as to Personal Knowledge
                  Management Systems (PKMS) like Roam Research and Obsidian.
                  This was part of the impetus for extracting the syntax into a
                  separate package.
                </p>
              </div>
            </div>
          </div>
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
  return roadmap.data as Issue[];
}
