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
        <p className="text-center text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
    </header>
  );
}
