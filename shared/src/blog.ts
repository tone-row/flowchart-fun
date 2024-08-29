export type NotionPost = {
  id: string;
  created_time: string;
  properties: NotionPostProperties;
};

export type NotionPostProperties = {
  title: {
    title: {
      plain_text: string;
    }[];
  };
  description: {
    rich_text: {
      plain_text: string;
    }[];
  };
  status: {
    status: {
      name: string;
    };
  };
  slug: {
    rich_text: {
      plain_text: string;
    }[];
  };
};

export type BlogPost = {
  id: string;
  publishDate: number;
  niceDate: string;
  description: string;
  slug: string;
  status: string;
  title: string;
};
