import { FaProductHunt, FaHackerNews, FaReddit } from "react-icons/fa6";

export const icons = {
  producthunt: FaProductHunt,
  hackernews: FaHackerNews,
  reddit: FaReddit,
};

export type Site = keyof typeof icons;

export type Testimonial = {
  username: string;
  quote: string;
  avatar?: string;
  url: string;
  site: Site;
};

export const testimonials: Testimonial[] = [
  {
    username: `Star Boat`,
    quote: `Flowchart.fun is a game changer. I've always thought if something like this exists. There we have it. I would love to try it.`,
    avatar: `https://ph-avatars.imgix.net/6337586/6bacd2f7-00a8-40e9-8725-37a0c92c63eb.jpeg?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=48&h=48&fit=crop&frame=1&dpr=1`,
    url: `https://www.producthunt.com/products/flowchart-fun?comment=3820444#flowchart-fun-2`,
    site: "producthunt",
  },
  {
    quote: `This tool is amazing, and its coolness comes from the fact it's really simple. [...] The beauty and magic resides in the minimalism.`,
    username: `sixti60`,
    url: "https://news.ycombinator.com/item?id=26307334",
    site: "hackernews",
  },
  {
    quote: `Every so often a utility feels so intuitive that one thinks, "They finally got it right".
Present feeling: They finally got it right. This is how flowcharts should be made, by default.`,
    username: "zupreme",
    url: "https://news.ycombinator.com/item?id=26308014",
    site: "hackernews",
  },
  {
    quote: `It's incredible to see how the app has evolved over the years, especially with the rise of AI. Your ability to find the balance in AI integration is impressive.`,
    username: "Emily Grace Thompson",
    url: "https://www.producthunt.com/products/flowchart-fun?comment=3820429#flowchart-fun-2",
    site: "producthunt",
    avatar:
      "https://ph-avatars.imgix.net/7359014/acb1006c-01b4-4c8a-9a61-5a8d04ef404e.png?auto=compress&codec=mozjpeg&cs=strip&auto=format&w=48&h=48&fit=crop&frame=1&dpr=1",
  },
  {
    quote: `YES THIS IS SO GOOD`,
    username: "Immediate-Country650",
    url: "https://www.reddit.com/r/software/comments/ygtaeb/comment/megmlpm/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button",
    site: "reddit",
  },
];
