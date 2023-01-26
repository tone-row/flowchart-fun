import "./Post.css";
import "highlight.js/styles/atom-one-dark.css";

import axios from "axios";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { InfoContainer } from "../../components/InfoContainer";
import { Box, Type } from "../../slang";
import { PostType } from "../Blog";

export default function Post() {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useQuery(["post", slug], () => getPost(slug), {
    suspense: true,
    staleTime: Infinity,
  });
  if (!data) return null;
  return (
    <InfoContainer>
      <Box gap={12}>
        <Box as="header" items="normal center" gap={6} className="post-header">
          <Type color="color-lineNumbers">{data.publishDate}</Type>
          <Type as="h1" size={4}>
            {data.title}
          </Type>
          <Type as="h2" weight="400" size={1}>
            {data.description}
          </Type>
        </Box>
        <div
          className="post-content slang-type size-0"
          dangerouslySetInnerHTML={{ __html: data.htmlContent }}
        />
        <div className="byline vcard post-content">
          <address className="author">
            By{" "}
            <a
              rel="author"
              className="url fn n"
              href="https://twitter.com/tone_row_"
            >
              Rob Gordon
            </a>
          </address>
          <time dateTime={data.date} title={data.publishDate}>
            on {data.publishDate}
          </time>
        </div>
      </Box>
    </InfoContainer>
  );
}

async function getPost(
  slug: string
): Promise<PostType & { htmlContent: string }> {
  const response = await axios.get(`/api/blog/post?slug=${slug}`);
  const post = response.data;
  console.log(post);
  return post;
}
