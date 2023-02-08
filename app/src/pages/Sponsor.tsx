import { t, Trans } from "@lingui/macro";
import { Plus } from "phosphor-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { Box, Type } from "../slang";
import styles from "./Sponsor.module.css";
export default function Sponsor() {
  const [plan, setPlan] = useState<"monthly" | "annually">("monthly");
  return (
    <Box content="start stretch">
      <Box py={8} px={5} className={styles.banner}>
        <Box className={styles.container} gap={8}>
          <Box gap={6} className="left" items="start">
            <Type size={2} weight="700">
              <Trans>
                Unlock workflow success with Flowchart Fun! Become a Pro for
                just $3/month or $30/year.
              </Trans>
            </Type>
            <Box
              as={Link}
              to={`/i`}
              px={6}
              py={3}
              rad={2}
              className={[styles.signUpSmall, styles.signUpLarge].join(" ")}
            >
              <Type weight="700" size={2}>
                <Trans>Sign Up Now</Trans>
              </Type>
            </Box>
          </Box>
          <div className={styles.video}>
            <video autoPlay loop muted playsInline>
              <source src="/demo.mp4" type="video/mp4" />
            </video>
          </div>
        </Box>
      </Box>
      <Box className={styles.plans} py={8} px={5}>
        <Box className={styles.container} gap={10}>
          <div className={styles.plans_content}>
            <Plan
              title="Free"
              features={[
                t`Unlimited Local Charts`,
                t`Export to Common Image Formats`,
                t`Shape Libraries`,
                t`Static Share Links`,
              ]}
            />
            <Plan
              title="Pro"
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
              footer={
                <Box
                  items="center"
                  content="normal space-between"
                  flow="column"
                  self="stretch"
                >
                  <Box flow="column" items="center" gap={3}>
                    <Box
                      rad={2}
                      flow="column"
                      gap={0.5}
                      items="start"
                      content="start"
                      className={styles.toggle}
                    >
                      <Box
                        as="button"
                        onClick={() => setPlan("monthly")}
                        data-active={plan === "monthly"}
                      >
                        <Type size={-1}>
                          <Trans>Monthly</Trans>
                        </Type>
                      </Box>
                      <Type size={-1}>/</Type>
                      <Box
                        as="button"
                        onClick={() => setPlan("annually")}
                        data-active={plan === "annually"}
                      >
                        <Type size={-1}>
                          <Trans>Annually</Trans>
                        </Type>
                      </Box>
                    </Box>
                    <Price
                      price={
                        plan === "monthly"
                          ? t`$3.00/month`
                          : t`$30.00/year (save 20%)`
                      }
                    />
                  </Box>
                  <Box
                    as={Link}
                    to={`/i${plan === "annually" ? "#annually" : ""}`}
                    px={4}
                    py={2}
                    rad={2}
                    className={styles.signUpSmall}
                  >
                    <Type weight="700">
                      <Trans>Sign Up Now</Trans>
                    </Type>
                  </Box>
                </Box>
              }
            />
          </div>
        </Box>
      </Box>
      <Box className={styles.featureBlock}>
        <Box className={styles.text} gap={3}>
          <Type size={3} weight="700">
            <Trans>Custom Sharing</Trans>
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
      <Box className={styles.featureBlock}>
        <Box className={styles.text} gap={3}>
          <Type size={3} weight="700">
            <Trans>Hosted Charts</Trans>
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
      <Box className={styles.footerBlock} px={5} py={24} pt={32}>
        <Box className={styles.container} gap={6} items="normal center">
          <Type size={2}>
            <Trans>
              Streamline your workflow and simplify your process visualization
              with Flowchart Fun
            </Trans>
          </Type>
          <Box
            as={Link}
            to={`/i${plan === "annually" ? "#annually" : ""}`}
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

function Plan({
  title,
  features,
  footer,
}: {
  title: string;
  features: string[];
  hash?: string;
  footer?: ReactNode;
}) {
  return (
    <Box className={styles.plan} gap={4} items="start">
      <div className={styles.planHeader}>
        <Type size={3} weight="700">
          {title}
        </Type>
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
              weight="bold"
              color="hsla(var(--color-brandHsl), 1)"
            />
            <Type size={1}>{feature}</Type>
          </Box>
        ))}
      </div>
      {footer}
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
    <Box as="span" className={styles.price} p={1} px={2} rad={2} ref={el}>
      <Type size={0}>{price}</Type>
    </Box>
  );
}
