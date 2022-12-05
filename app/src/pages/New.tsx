import { decompressFromEncodedURIComponent as decompress } from "lz-string";
import { memo, useContext, useEffect } from "react";
import { useMutation } from "react-query";
import { useHistory, useParams } from "react-router-dom";

import { AppContext } from "../components/AppContext";
import Loading from "../components/Loading";
import { randomChartName, titleToLocalStorageKey } from "../lib/helpers";
import { useIsValidCustomer } from "../lib/hooks";
import { makeChart, queryClient } from "../lib/queries";
import { useDefaultDoc } from "../lib/useDefaultDoc";
import { Type } from "../slang";

export const New = memo(function New() {
  const defaultDoc = useDefaultDoc();
  const { graphText = window.location.hash.slice(1) } = useParams<{
    graphText: string;
  }>();
  const fullText = decompress(graphText) ?? defaultDoc;
  const { replace } = useHistory();
  const { customerIsLoading, session, checkedSession } = useContext(AppContext);
  const validCustomer = useIsValidCustomer();
  const userId = session?.user?.id;

  // Boilerplate to create a new chart
  const { mutate, isLoading } = useMutation("makeChart", makeChart, {
    retry: false,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries(["auth", "hostedCharts"]);
      replace(`/u/${response.data[0].id}`);
    },
  });

  useEffect(() => {
    if (!checkedSession) return;
    if (customerIsLoading) return;

    // If invalid customer, redirect to login
    if (!validCustomer || !userId) {
      // create random chart name
      const name = randomChartName();
      // If given template, set template before redirecting
      if (fullText) {
        const newKey = titleToLocalStorageKey(name);
        window.localStorage.setItem(newKey, fullText);
      }
      replace(`/${name}`);
      return;
    }

    // Check if already triggered mutation
    if (isLoading) return;

    // If not, trigger mutation
    mutate({ name: randomChartName(), user_id: userId, chart: fullText });
  }, [checkedSession, customerIsLoading, fullText, isLoading, mutate, replace, userId, validCustomer]);

  if (customerIsLoading) {
    return <Loading />;
  }

  return (
    <Loading>
      <Type size={1}>Creating Flowchart</Type>
    </Loading>
  );
});
