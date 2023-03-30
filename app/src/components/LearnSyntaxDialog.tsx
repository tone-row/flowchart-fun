import { t, Trans } from "@lingui/macro";
import * as Dialog from "@radix-ui/react-dialog";
import { TextAlignRight } from "phosphor-react";
import { useEffect, useRef, useState } from "react";

import { Box, Type } from "../slang";
import { Overlay } from "../ui/Dialog";
import { EditorActionTextButton } from "../ui/EditorActionTextButton";
import styles from "./LearnSyntaxDialog.module.css";

const PAD = 4;

export function LearnSyntaxDialog() {
  const descriptionFirstTitle = useRef<HTMLHeadingElement>(null);
  const [description, setDescription] = useState<HTMLDivElement>();
  /**
   * use an intersection observer to watch when first title is no longer
   * in view and toggle a class ".is-scrolled" on the description element
   * #syntax-help-description
   */
  useEffect(() => {
    const currentTitle = descriptionFirstTitle.current;
    if (!currentTitle || !description) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          document
            .getElementById("syntax-help-header")
            ?.classList.remove(styles.isScrolled);
        } else {
          document
            .getElementById("syntax-help-header")
            ?.classList.add(styles.isScrolled);
        }
      },
      {
        root: description,
        rootMargin: "0px 0px -100% 0px",
        threshold: 0,
      }
    );
    observer.observe(currentTitle);
    return () => {
      observer.unobserve(currentTitle);
    };
  }, [description]);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <EditorActionTextButton icon={TextAlignRight}>
          <Trans>Learn Syntax</Trans>
        </EditorActionTextButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Overlay />
        <Box as={Dialog.Content} className={styles.content} rad={2}>
          <Box
            px={PAD}
            py={2}
            className={styles.header}
            id="syntax-help-header"
          >
            <Box
              as={Dialog.Title}
              content="normal start"
              items="center normal"
              gap={3}
              flow="column"
            >
              <TextAlignRight size={24} weight="bold" />
              <Type size={2}>
                <Trans>Learn Syntax</Trans>
              </Type>
            </Box>
          </Box>
          <Box
            as={"div"}
            p={PAD}
            gap={2}
            py={3}
            className={styles.description}
            ref={setDescription}
          >
            <section>
              <h1 ref={descriptionFirstTitle}>
                <Trans>Node Label</Trans>
              </h1>
              <p>
                <Trans>
                  Text on a line creates a node with the text as the label
                </Trans>
              </p>
              <CodeExample code={`Hello\nWorld`} src="1" />
            </section>
            <section>
              <h1>
                <Trans>Node ID, Classes, Attributes</Trans>
              </h1>
              <h2>{t`ID's`}</h2>
              <p>
                <Trans>Unique text value to identify a node</Trans>
              </p>
              <CodeExample
                code={`Hello <span data-highlight>#x</span>\nWorld <span data-highlight>#y</span>`}
              />
              <h2>
                <Trans>Classes</Trans>
              </h2>
              <p>
                <Trans>Use classes to group nodes</Trans>
              </p>
              <CodeExample
                code={`Cat <span data-highlight>.animals</span>\nDog <span data-highlight>.animals</span>`}
              />
              <h2>
                <Trans>Attributes</Trans>
              </h2>
              <p>
                <Trans>Store any data associated to a node</Trans>
              </p>
              <CodeExample
                code={`Hello #x.blue<span data-highlight>[letters=5]</span>\nWorld #y.red<span data-highlight>[letters=5]</span>`}
              />
            </section>
            <section>
              <h1>
                <Trans>Edges</Trans>
              </h1>
              <p>
                <Trans>
                  Creating an edge between two nodes is done by indenting the
                  second node below the first
                </Trans>
              </p>
              <CodeExample code={`Hello\n  World`} src="3" />
            </section>
            <section>
              <h1>
                <Trans>Edge Label</Trans>
              </h1>
              <p>
                <Trans>
                  Text followed by colon+space creates an edge with the text as
                  the label
                </Trans>
              </p>
              <CodeExample code={`Hello\n  to the: World`} src="4" />
            </section>
            <section>
              <h1>
                <Trans>Edge ID, Classes, Attributes</Trans>
              </h1>
              <p>
                <Trans>
                  Edges can also have ID&apos;s, classes, and attributes before
                  the label
                </Trans>
              </p>
              <CodeExample
                code={`Hello\n  <span data-highlight>#x</span> to the: World`}
              />
            </section>
            <section>
              <h1>
                <Trans>References</Trans>
              </h1>
              <p>
                <Trans>
                  References are used to create edges between nodes that are
                  created elsewhere in the document
                </Trans>
              </p>
              <h2>
                <Trans>Reference by Label</Trans>
              </h2>
              <p>
                <Trans>Referencing a node by its exact label</Trans>
              </p>
              <CodeExample
                code={`Hello\n  World\n    <span data-highlight>(Hello)</span>`}
                src="5"
              />
              <h2>
                <Trans>Reference by ID</Trans>
              </h2>
              <p>
                <Trans>Referencing a node by its unique ID</Trans>
              </p>
              <CodeExample
                code={`Hello #x\n  World #y\n    <span data-highlight>(#x)</span>`}
                src="5"
              />
              <h2>
                <Trans>Reference by Class</Trans>
              </h2>
              <p>
                <Trans>
                  Referencing multiple nodes with the same assigned class
                </Trans>
              </p>
              <CodeExample
                code={`Cat .animals\nDog .animals\nAnimals\n  <span data-highlight>(.animals)</span>`}
                src="6"
              />
            </section>
            <section>
              <h1>
                <Trans>Leading References</Trans>
              </h1>
              <p>
                <Trans>
                  Draw an edge from multiple nodes by beginning the line with a
                  reference
                </Trans>
              </p>
              <CodeExample
                code={`Cat .animals\nDog .animals\n\n<span data-highlight>(.animals)</span>\n  are pets`}
                src="7"
              />
            </section>
            <section>
              <h1>
                <Trans>Containers</Trans>
              </h1>
              <p>
                <Trans>
                  Containers are nodes that contain other nodes. They are
                  declared using curly braces.
                </Trans>
              </p>
              <CodeExample
                code={`Solar System <span data-highlight>{</span>\n  Earth\n    Mars\n<span data-highlight>}</span>`}
                src="8"
              />
            </section>
            <section>
              <h1>
                <Trans>Style Classes</Trans>
              </h1>
              <p>
                <Trans>
                  Some classes are available to help style your flowchart
                </Trans>
              </p>
              <h2>
                <Trans>Node Colors</Trans>
              </h2>
              <p>
                <Trans>
                  Colors include red, orange, yellow, blue, purple, black,
                  white, and gray.
                </Trans>
              </p>
              <CodeExample
                code={`Hello <span data-highlight>.red</span>\n  World <span data-highlight>.blue</span>`}
                src="9"
              />
              <h2>
                <Trans>Node Shapes</Trans>
              </h2>
              <p>
                <Trans>
                  Shapes include rectangle, roundrectangle, ellipse, triangle,
                  pentagon, hexagon, heptagon, octagon, star, barrel, diamond,
                  vee, rhomboid, polygon, tag, round-rectangle, cut-rectangle,
                  bottom-round-rectangle, and concave-hexagon.
                </Trans>
              </p>
              <CodeExample
                code={`Hello <span data-highlight>.diamond</span>\n  World <span data-highlight>.ellipse</span>`}
                src="10"
              />
              <h2>
                <Trans>Text Sizes</Trans>
              </h2>
              <p>
                <Trans>
                  Text sizes include small, regular, large, and extra-large.
                </Trans>
              </p>
              <CodeExample
                code={`Small <span data-highlight>.text-sm</span>\n  Regular\n    Large <span data-highlight>.text-lg</span>\n      Extralarge <span data-highlight>.text-xl</span>`}
                src="11"
                fontSize={12}
              />
              <h2>
                <Trans>Edge Style</Trans>
              </h2>
              <p>
                <Trans>
                  Edges can be styled with dashed, dotted, or solid lines
                </Trans>
              </p>
              <CodeExample
                code={`Hello\n  <span data-highlight>.dashed</span> to the: world\n    <span data-highlight>.dotted</span>: (Hello)`}
                src="12"
                fontSize={13}
              />
              <h2>
                <Trans>Source/Target Arrow Shape</Trans>
              </h2>
              <p>
                <Trans>
                  Choose from a variety of arrow shapes for the source and
                  target of an edge. Shapes include triangle, triangle-tee,
                  circle-triangle, triangle-cross, triangle-backcurve, vee, tee,
                  square, circle, diamond, chevron, none. .
                </Trans>
              </p>
              <CodeExample
                code={`a\n<span data-highlight>.source-triangle</span>: b\n  <span data-highlight>.source-circle.target-circle</span>: c\n    <span data-highlight>.target-chevron</span>: (a)`}
                src="16"
                fontSize={13}
              />
              <h2>
                <Trans>Node Border Style</Trans>
              </h2>
              <p>
                <Trans>
                  Nodes can be styled with dashed, dotted, or double. Borders
                  can also be removed with border-none.
                </Trans>
              </p>
              <CodeExample
                code={`A <span data-highlight>.border-dashed</span>\nB <span data-highlight>.border-dotted</span>\nC <span data-highlight>.border-double</span>\nD <span data-highlight>.border-none</span>`}
                src="13"
              />
            </section>
            <section>
              <h1>
                <Trans>Special Attributes</Trans>
              </h1>
              <p>
                <Trans>
                  Certain attributes can be used to customize the appearance or
                  functionality of elements.
                </Trans>
              </p>
              <h2>
                <Trans>Width and Height</Trans>
              </h2>
              <p>
                <Trans>
                  Use the attributes <code>w</code> and <code>h</code> to
                  explicitly set the width and height of a node.
                </Trans>
              </p>
              <CodeExample
                code={`👋 <span data-highlight>[w=50]</span>\n👋 <span data-highlight>[h=50]</span>\n👋 <span data-highlight>[w=50][h=50]</span>`}
                src="14"
              />
              <h2>
                <Trans>Images</Trans>
              </h2>
              <p>
                <Trans>
                  Use the attribute <code>src</code> to set the image of a node.
                  The image will be scaled to fit the node, so you may need to
                  adjust the width and height of the node to get the desired
                  result. Only public images (not blocked by CORS) are
                  supported.
                </Trans>
              </p>
              <CodeExample
                code={`Flowchart Fun <span data-highlight>[src="https://flowchart.fun/apple-touch-icon.png"]</span>[w=90][h=90]`}
                src="15"
              />
              <h2>Links</h2>
              <p>
                <Trans>
                  Use the attribute <code>href</code> to set a link on a node
                  that opens in a new tab.
                </Trans>
              </p>
              <CodeExample
                code={`Open Twitter 🐦 <span data-highlight>[href="https://twitter.com"]</span>`}
                src="17"
              />
            </section>
          </Box>
          <Box
            as={Dialog.Close}
            p={PAD}
            pr={3}
            className={styles.close}
            content="normal end"
          >
            <Type size={1}>Close</Type>
          </Box>
        </Box>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/*
Order of concepts:
- Declaring node's label
-  Giving nodes id's, classes, and data attributes
-  Creating an edge from the node on a previous line
-  Declaring an edge label
-  Giving an edge id's, classes, and data attributes
-  Using a reference to create an edge
-  Using a Leading reference to create an edge
-  Creating a Container
-  Giving a Container a label, id's, classes and data attributes
-  Adding nodes inside a Container
*/

function CodeExample({
  code = "",
  src,
  fontSize,
}: {
  code?: string;
  src?: string;
  fontSize?: number;
}) {
  const imgSrc = src ? `/images/syntax/${src}.png` : "";
  return (
    <div className={styles.codeExample} data-has-image={!!imgSrc}>
      <div className={styles.codeExampleCode}>
        <div dangerouslySetInnerHTML={{ __html: code }} style={{ fontSize }} />
      </div>
      {imgSrc && (
        <img className={styles.codeExampleImage} src={imgSrc} alt="an img" />
      )}
    </div>
  );
}
