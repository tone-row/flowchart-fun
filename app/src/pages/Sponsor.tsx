import { t, Trans } from "@lingui/macro";
import { Plus } from "phosphor-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { Box, Type } from "../slang";
import styles from "./Sponsor.module.css";
export default function Sponsor() {
  const [plan, setPlan] = useState<"monthly" | "annually">("monthly");
  return (
    <Box content="start stretch">
      <Box py={8} px={5} className={styles.banner}>
        <Box className={styles.container} gap={4}>
          <Box gap={2} className="left">
            <Type size={2}>
              <Trans>Say goodbye to tedious flowchart creation</Trans>
            </Type>
            <Type size={3}>
              <Trans>
                Flowchart Fun makes it quick and easy to visually communicate
                your processes.
              </Trans>
            </Type>
          </Box>
          <div className={styles.video}>
            <Frame2 />
            <video autoPlay loop muted playsInline>
              <source src="/demo.mp4" type="video/mp4" />
            </video>
          </div>
        </Box>
      </Box>
      <Box className={styles.plans} py={16} px={5}>
        <Box className={styles.container} gap={10}>
          <Box
            className="plans-header"
            flow="column"
            content="start"
            items="center normal"
            gap={3}
          >
            <Type size={4} weight="700">
              <Trans>Plans</Trans>
            </Type>
            <Box
              rad={2}
              flow="column"
              gap={0.5}
              items="start"
              content="start"
              className={styles.toggle}
              p={0.5}
            >
              <Box
                as="button"
                rad={1}
                px={3}
                py={1}
                onClick={() => setPlan("monthly")}
                data-active={plan === "monthly"}
              >
                <Type weight="700">
                  <Trans>Monthly</Trans>
                </Type>
              </Box>
              <Box
                as="button"
                rad={1}
                px={3}
                py={1}
                onClick={() => setPlan("annually")}
                data-active={plan === "annually"}
              >
                <Type weight="700">
                  <Trans>Annually</Trans>
                </Type>
              </Box>
            </Box>
          </Box>
          <div className={styles.plans_content}>
            <Plan
              title="Free Users"
              features={[
                t`Unlimited Local Charts`,
                t`Export to Common Image Formats`,
                t`Shape Libraries`,
                t`Static Share Links`,
              ]}
            />
            <Plan
              title="Sponsors"
              price={
                plan === "monthly" ? t`$3.00/month` : t`$30.00/year (save 20%)`
              }
              showSignUp
              features={[
                t`Unlimited Local Charts`,
                t`Export to Common Image Formats`,
                t`Shape Libraries`,
                t`Static Share Links`,
                t`Unlimited Hosted Charts`,
                t`Dynamic Share Links`,
                t`More Layouts`,
                t`More Themes and Fonts`,
                t`Share with Full Access, Edit-only, or View-only Permissions`,
              ]}
            />
          </div>
        </Box>
      </Box>
      <Box className={styles.featureBlock} px={5}>
        <Box className={styles.text} gap={3}>
          <Type size={3}>
            <Trans>Unlimited Hosted Charts</Trans>
          </Type>
          <Type size={1}>
            <Trans>
              With the ability to create unlimited hosted charts, you can access
              and work on your flowcharts from any device, anywhere.
            </Trans>
          </Type>
        </Box>
        <div className="right">
          <img src="/images/iphone_hand.svg" alt="Hand Holding Iphone" />
        </div>
      </Box>
      <Box className={styles.featureBlock} px={5}>
        <Box className={styles.text} gap={3}>
          <Type size={3}>
            <Trans>Custom Sharing Options</Trans>
          </Type>
          <Type size={1}>
            <Trans>
              Choose to share your charts with full access, edit-only, or
              view-only permissions, giving you control over who can make
              changes to your work.
            </Trans>
          </Type>
        </Box>
        <div className="right">
          <img src="/images/whiteboard_lady.svg" alt="Hand Holding Iphone" />
        </div>
      </Box>
      <Box className={styles.featureBlock} px={5}>
        <Box className={styles.text} gap={3}>
          <Type size={3}>
            <Trans>Layouts and Themes</Trans>
          </Type>
          <Type size={1}>
            <Trans>
              Customize the look and feel of your charts with more layout and
              theme options, helping you to create professional, visually
              appealing diagrams.
            </Trans>
          </Type>
        </Box>
        <div className="right">
          <AnimatedStyles />
        </div>
      </Box>
      <Box className={styles.footerBlock} px={5} py={20}>
        <Box className={styles.container} gap={8} items="normal center">
          <Type size={1}>
            <Trans>
              Streamline your workflow and simplify your process visualization
              with Flowchart Fun
            </Trans>
          </Type>
          <Box
            as={Link}
            to="/i"
            px={8}
            py={4}
            rad={3}
            className={[styles.signUpSmall, styles.signUpLarge].join(" ")}
          >
            <Type size={2} weight="700">
              <Trans>Sign Up Now</Trans>
            </Type>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const NUM_IMGS = 6;
function AnimatedStyles() {
  const [activeImg, setActiveImg] = useState(0);
  // Increment the active image on a timer, every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImg((activeImg + 1) % NUM_IMGS);
    }, 0.333 * 4 * 1000);
    return () => clearInterval(interval);
  }, [activeImg]);
  return (
    <div className={styles.animatedStyles}>
      <Frame />
      <div className="images">
        {[...Array(NUM_IMGS)].map((_, i) => (
          <img
            key={i}
            src={`/images/swipe/${i + 1}.png`}
            alt={`Theme Example ${i}`}
            data-active={i === activeImg}
          />
        ))}
      </div>
    </div>
  );
}

const Frame = () => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1234 1138">
    <path
      d="M1148.47 2.02H692.918M1048.06 1135.98h180.65c1.83 0 3.29-1.79 3.29-3.98V136.898M2 1016.58V1132c0 2.21 1.48 3.98 3.291 3.98h934.552M616.202 2.02H5.308c-1.829 0-3.292 1.79-3.292 3.981v453.757"
      stroke="#000"
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="round"
    />
  </svg>
);

const Frame2 = () => (
  <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 738 544">
    <path
      d="M686.152 2.01H414.304M626.235 541.99h107.801c1.091 0 1.964-.852 1.964-1.895V66.237M2 485.135v54.96c0 1.053.883 1.895 1.964 1.895h557.692M368.524 2.01H3.974c-1.091 0-1.964.852-1.964 1.895V219.98"
      stroke="#000"
      strokeWidth={3}
      strokeMiterlimit={10}
      strokeLinecap="round"
    />
  </svg>
);

function Plan({
  title,
  price,
  features,
  showSignUp,
}: {
  title: string;
  price?: string;
  features: string[];
  showSignUp?: boolean;
}) {
  return (
    <Box className={styles.plan} gap={4} items="start" rad={5} p={4}>
      <div className={styles.planHeader}>
        <Type size={2} weight="700">
          {title}
        </Type>
        {price && <Price price={price} />}
      </div>
      <div className="plan-features">
        {features.map((feature) => (
          <Box
            key={feature}
            gap={2}
            flow="column"
            content="start"
            items="start"
          >
            <Plus
              style={{ marginTop: 5 }}
              color="hsla(var(--color-brandHsl), 0.5)"
            />
            <Type>{feature}</Type>
          </Box>
        ))}
      </div>
      {showSignUp && (
        <Box
          as={Link}
          to="/i"
          px={4}
          py={3}
          rad={2}
          className={styles.signUpSmall}
        >
          <Type weight="700">
            <Trans>Sign Up Now</Trans>
          </Type>
        </Box>
      )}
    </Box>
  );
}

function Price({ price }: { price: string }) {
  const el = useRef<HTMLSpanElement>(null);
  // when the price changes add a class to animate the price, then remove it
  useEffect(() => {
    if (!el.current) return;
    el.current.classList.add(styles.priceAnimate);
    const timeout = setTimeout(() => {
      el.current?.classList.remove(styles.priceAnimate);
    }, 500);
    return () => clearTimeout(timeout);
  }, [price]);

  return (
    <Box as="span" className={styles.price} p={2} rad={2} ref={el}>
      <Type size={1}>{price}</Type>
    </Box>
  );
}
