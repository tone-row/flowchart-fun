import { t } from "@lingui/macro";
import axios from "axios";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";

import { InfoContainer } from "../components/InfoContainer";
import { InfoHeader } from "../components/InfoHeader";
import { Box } from "../slang";
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
          <Box gap={8} className="posts">
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
    <Link
      className={`grid gap-6 p-2 md:p-5 rounded transition-all
      hover:bg-gradient-to-br hover:to-white hover:from-blue-100
      dark:hover:from-blue-900 dark:hover:to-neutral-800
      `}
      to={`/blog/post/${post.slug}`}
    >
      <header className="grid gap-1">
        <h2 className="text-3xl font-bold">{post.title}</h2>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {post.publishDate}
        </span>
      </header>
      <p className="text-neutral-700 dark:text-neutral-300">
        {post.description}
      </p>
    </Link>
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
