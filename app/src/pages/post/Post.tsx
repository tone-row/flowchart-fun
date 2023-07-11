import "highlight.js/styles/atom-one-dark.css";

import axios from "axios";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { Page } from "../../ui/Shared";
import { PageTitle } from "../../ui/Typography";
import { PostType } from "../Blog";

export default function Post() {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useQuery(["post", slug], () => getPost(slug), {
    suspense: true,
    staleTime: Infinity,
  });
  if (!data) return null;
  return (
    <Page>
      <div className="grid gap-6">
        <header className="grid gap-4">
          <div className="grid gap-2">
            <span className="text-blue-500 translate-x-[2px] dark:text-purple-400 tracking-wide uppercase">
              {data.publishDate}
            </span>
            <PageTitle>{data.title}</PageTitle>
          </div>
          <p className="text-neutral-400 text-lg dark:text-neutral-300">
            {data.description}
          </p>
        </header>
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: data.htmlContent }}
        />
        <div className="byline vcard post-content text-sm text-neutral-500 dark:text-neutral-700">
          <address className="author inline">
            By{" "}
            <a
              rel="author"
              className="url fn n"
              href="https://twitter.com/tone_row_"
            >
              Rob Gordon
            </a>
          </address>
          &nbsp;
          <time
            className="inline"
            dateTime={data.date}
            title={data.publishDate}
          >
            on {data.publishDate}
          </time>
        </div>
      </div>
    </Page>
  );
}

async function getPost(
  slug: string
): Promise<PostType & { htmlContent: string }> {
  const response = await axios.get(`/api/blog/post?slug=${slug}`);
  const post = response.data;
  return post;
}
