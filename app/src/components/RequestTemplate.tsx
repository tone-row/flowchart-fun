import { Trans, t } from "@lingui/macro";
import { Link } from "react-router-dom";

export function RequestTemplate() {
  return (
    <Link
      to={`/o?text=${encodeURIComponent(
        t`I would like to request a new template:`
      )}`}
      className="text-[14px] font-normal opacity-50 hover:opacity-1000"
      data-session-activity="Request Template"
    >
      <Trans>Missing a template? Suggest one here!</Trans>
    </Link>
  );
}
