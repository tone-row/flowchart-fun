import { GraphOptionsObject } from "./constants";

/**
 * This the type for the update function returned from
 * the use(*)Doc hooks. It is necessary because in some cases
 * we need to update hidden parts of the doc at the same time
 * that we update visible parts, and we didn't have a clear render
 * pipeline to do that.
 */
export type UpdateDoc = (
  update:
    | {
        hidden?: object | undefined;
        text?: string | undefined;
      }
    | {
        hidden?: object | undefined;
        options?: GraphOptionsObject | undefined;
      }
) => void;
