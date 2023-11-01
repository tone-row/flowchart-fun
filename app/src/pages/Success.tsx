import { ReactNode, Suspense, lazy, useEffect, useState } from "react";
import { Button2, Page } from "../ui/Shared";
import { FileCsv, FloppyDisk, MagicWand, TreeStructure } from "phosphor-react";
import classNames from "classnames";
import { Trans, t } from "@lingui/macro";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "../lib/hooks";
import { loopsNewSubscriber } from "../lib/sendLoopsEvent";
const Confetti = lazy(() => import("react-confetti"));

export default function Success() {
  const [windowSize, setWindowSize] = useState<[number, number] | null>(null);
  const [numPieces, setNumPieces] = useState(200);
  const session = useSession();

  // Wait until the email is present then send welcome email
  useEffect(() => {
    if (session?.user?.email) {
      loopsNewSubscriber(session.user.email);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    setWindowSize([window.innerWidth, window.innerHeight]);
    // reduce the num pieces by 50 every 2 seconds
    const interval = setInterval(() => {
      setNumPieces((num) => {
        if (num < 50) {
          clearInterval(interval);
          return 0;
        }
        return num - 50;
      });
    }, 2000);
  }, []);
  const navigate = useNavigate();
  return (
    <>
      <Page className="justify-center">
        <h2 className="text-3xl font-bold text-center">
          <Trans>Subscription Successful!</Trans>
        </h2>
        <div className="grid gap-6 mb-6">
          <p className="text-center text-lg text-wrap-balance leading-normal">
            <Trans>Here are some Pro features you can now enjoy.</Trans>
          </p>
          <div className="grid grid-cols-3">
            <ProFeature
              title={t`Save your Work`}
              icon={FloppyDisk}
              className="text-green-500"
            />
            <ProFeature
              title={t`Create with AI`}
              icon={MagicWand}
              className="text-purple-500"
            />
            <ProFeature
              title={t`Import from CSV`}
              icon={FileCsv}
              className="text-orange-500"
            />
          </div>
        </div>
        <p className="text-center text-lg text-wrap-balance leading-normal mb-8">
          <Trans>
            Feel free to explore and reach out to us through the{" "}
            <Link to="/o" className="font-bold underline">
              Feedback
            </Link>{" "}
            page should you have any concerns.
          </Trans>
        </p>
        <Button2
          size="lg"
          leftIcon={<TreeStructure />}
          onClick={() => {
            navigate("/");
          }}
        >
          <Trans>Go to the Editor</Trans>
        </Button2>
      </Page>
      {windowSize && (
        <Suspense fallback={null}>
          <Confetti
            width={windowSize[0]}
            height={windowSize[1]}
            numberOfPieces={numPieces}
            wind={0.02}
            colors={["#e9efff", "#7f96ff", "#ffe590", "#e3ffdc", "#8252eb"]}
          />
        </Suspense>
      )}
    </>
  );
}

function ProFeature({
  title,
  icon: Icon,
  className,
}: {
  title: ReactNode;
  icon: typeof FloppyDisk;
  className?: string;
}) {
  return (
    <div className={classNames("flex flex-col items-center", className)}>
      <Icon className="w-24 h-24 mb-2" weight="light" />
      <p className="text-center font-bold">{title}</p>
    </div>
  );
}
