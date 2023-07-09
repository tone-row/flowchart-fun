import "../pages/post/Post.css";

import { PageTitle } from "../ui/Typography";
import { OnlyInEnglish } from "./OnlyInEnglish";

export function InfoHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="grid gap-4 text-center">
      <div className="flex gap-3 items-center justify-center">
        <PageTitle>{title}</PageTitle>
        <OnlyInEnglish />
      </div>
      {description && (
        <p className="text-blue-400 dark:text-blue-300 text-lg font-bold">
          {description}
        </p>
      )}
    </header>
  );
}
