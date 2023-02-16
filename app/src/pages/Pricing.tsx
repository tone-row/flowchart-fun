import { t, Trans } from "@lingui/macro";
import { Plus } from "phosphor-react";
import { ReactNode } from "react";

import { SignUpForm } from "../components/SignUpForm";
import { Box, Type } from "../slang";
import styles from "./Pricing.module.css";
export default function Pricing() {
  return (
    <Box content="start stretch">
      <Box py={8} px={5} className={styles.banner}>
        <Box className={styles.container} gap={8}>
          <Box gap={6} className="left" items="start">
            <Type size={4} weight="700">
              <Trans>
                Make your workflow easier with Flowchart Fun Pro– subscribe now
                for only $3/month or $30/year!
              </Trans>
            </Type>
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
              className={styles.Free}
              title="Free"
              features={[
                t`Temporary Flowcharts`,
                t`Image Export`,
                t`8 Auto-Layouts`,
                t`One-Time Share Links`,
              ]}
            />
            <Plan
              className={styles.BecomeAPro}
              title="Flowchart Fun Pro"
              features={[
                t`Everything in Free`,
                t`Persistent Flowcharts`,
                t`13 Auto-Layouts`,
                t`Permalinks`,
                t`Custom Sharing Options`,
                t`Create Flowcharts from Prompts using AI`,
              ]}
              right={<SignUpForm />}
            />
          </div>
        </Box>
      </Box>
      <Box as="section" px={4}>
        <Box className={styles.featureBlock}>
          <Box className={styles.text} gap={3}>
            <Type size={3} weight="700">
              <Trans>Persistent Flowcharts</Trans>
            </Type>
            <Type size={1}>
              <Trans>
                With the ability to create unlimited hosted charts, you can
                access and work on your flowcharts from any device, anywhere.
              </Trans>
            </Type>
          </Box>
          <div className="right">
            <img src="/images/iphone_hand.svg" alt="Hand Holding Iphone" />
          </div>
        </Box>
      </Box>
      <Box as="section" px={4}>
        <Box className={styles.featureBlock}>
          <Box className={styles.text} gap={3}>
            <Type size={3} weight="700">
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
      </Box>
      <Box className={styles.footerBlock} px={5} py={24}>
        <Box className={styles.container} gap={6} items="normal center">
          <Type size={2}>
            <Trans>
              Streamline your workflow and simplify your process visualization
              with Flowchart Fun
            </Trans>
          </Type>
        </Box>
      </Box>
    </Box>
  );
}

function Plan({
  title,
  features,
  right,
  className = "",
}: {
  title: string;
  features: string[];
  hash?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <Box
      className={[styles.plan, className].join(" ")}
      gap={4}
      p={8}
      pt={7}
      rad={3}
      items="start"
    >
      <Type size={3} weight="700" as="h2">
        {title}
      </Type>
      <div className={right ? styles.planLeftRight : ""}>
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
                color="var(--plus-color)"
              />
              <Type size={0}>{feature}</Type>
            </Box>
          ))}
        </div>
        {right}
      </div>
    </Box>
  );
}
