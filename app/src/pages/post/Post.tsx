import "highlight.js/styles/atom-one-dark.css";

import axios from "axios";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import { Page } from "../../ui/Shared";
import { PageTitle } from "../../ui/Typography";

import { Helmet } from "react-helmet";

export default function Post() {
  const { slug } = useParams<{ slug: string }>();
  const { data } = useQuery(
    ["post", slug],
    () => {
      if (!slug) return;
      return getPost(slug);
    },
    {
      suspense: true,
      staleTime: Infinity,
      enabled: !!slug,
    }
  );
  if (!data) return null;
  return (
    <>
      <Helmet>
        <title>Flowchart Fun Blog - {data.title}</title>
        <meta name="description" content={data.description} />
      </Helmet>
      <Page>
        <div className="grid gap-6">
          <header className="grid gap-4 text-center">
            <span className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-medium">
              {data.publishDate}
            </span>
            <PageTitle className="text-wrap-balance">{data.title}</PageTitle>
            <p className="text-neutral-400 text-lg dark:text-neutral-300">
              {data.description}
            </p>
          </header>
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: data.htmlContent }}
          />
          <div className="byline vcard post-content text-xs text-neutral-400 dark:text-neutral-500">
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
    </>
  );
}

async function getPost(
  slug: string
): Promise<PostType & { htmlContent: string }> {
  const response = await axios.get(`/api/blog/post?slug=${slug}`);
  const post = response.data;
  return post;
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
