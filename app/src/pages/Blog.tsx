import { t } from "@lingui/macro";
import axios from "axios";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

import { InfoContainer } from "../components/InfoContainer";
import { InfoHeader } from "../components/InfoHeader";
import { Box, Type } from "../slang";
import styles from "./Blog.module.css";
export default function Blog() {
  const posts = useQuery("posts", getAndPreparePosts, {
    staleTime: Infinity,
    suspense: true,
  });
  return (
    <InfoContainer>
      <Box gap={16} content="start normal">
        <InfoHeader
          title={t`Blog`}
          description="Documenting the process of developing Flowchart Fun"
        />
        {posts.data && (
          <Box gap={12} className="posts">
            {posts.data.map((post) => (
              <Post key={post.id} post={post} />
            ))}
          </Box>
        )}
      </Box>
    </InfoContainer>
  );
}

function Post({ post }: { post: PostType }) {
  return (
    <Box
      gap={2}
      className={styles.Post}
      as={Link}
      to={`/blog/post/${post.slug}`}
    >
      <Type weight="700" size={3}>
        {post.title}
      </Type>
      <Type>{post.publishDate}</Type>
      <Type color="color-lineNumbers">{post.description}</Type>
    </Box>
  );
}

async function getAndPreparePosts() {
  const response = await axios.get("/api/blog/posts");
  const posts = (response.data as PostType[])
    .sort((a, b) => b.rawDate - a.rawDate)
    // only show posts with status "Done"
    .filter((post) => post.status === "Done");
  return posts;
}

export type PostType = {
  id: string;
  rawDate: number;
  date: string;
  publishDate: string;
  description: string;
  status: string;
  slug: string;
  title: string;
};
