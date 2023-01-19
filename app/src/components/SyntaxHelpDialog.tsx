import * as Dialog from "@radix-ui/react-dialog";

import { Box, Type } from "../slang";
import styles from "./SyntaxHelpDialog.module.css";

const PAD = 4;

export function SyntaxHelpDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Learn the Syntax</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Box as={Dialog.Content} className={styles.content} rad={2}>
          <Box p={PAD} pb={2} className={styles.header}>
            <Dialog.Title>
              <Type size={2}>Syntax Reference</Type>
            </Dialog.Title>
          </Box>
          <Box
            as={Dialog.Description}
            p={PAD}
            gap={2}
            py={3}
            className={styles.description}
          >
            <section>
              <h1>Node Label</h1>
              <p>Text on a line creates a node with the text as the label</p>
              <CodeExample code={`Hello\nWorld`} src="1" />
            </section>
            <section>
              <h1>Node ID, Classes, Attributes</h1>
              <h2>ID&apos;s</h2>
              <p>Unique text value to identify a node</p>
              <CodeExample
                code={`Hello <span data-highlight>#x</span>\nWorld <span data-highlight>#y</span>`}
              />
              <h2>Classes</h2>
              <p>Use classes to group nodes</p>
              <CodeExample
                code={`Cat <span data-highlight>.animals</span>\nDog <span data-highlight>.animals</span>`}
              />
              <h2>Attributes</h2>
              <p>Store any data associated to a node</p>
              <CodeExample
                code={`Hello #x.blue<span data-highlight>[letters=5]</span>\nWorld #y.red<span data-highlight>[letters=5]</span>`}
              />
            </section>
            <section>
              <h1>Edges</h1>
              <p>
                Creating an edge between two nodes is done by indenting the
                second node below the first
              </p>
              <CodeExample code={`Hello\n  World`} src="3" />
            </section>
            <section>
              <h1>Edge Label</h1>
              <p>
                Text followed by colon+space creates an edge with the text as
                the label
              </p>
              <CodeExample code={`Hello\n  to the: World`} src="4" />
            </section>
            <section>
              <h1>Edge ID, Classes, Attributes</h1>
              <p>
                Edges can also have ID&apos;s, classes, and attributes before
                the label
              </p>
              <CodeExample
                code={`Hello\n  <span data-highlight>#x</span> to the: World`}
              />
            </section>
            <section>
              <h1>References</h1>
              <p>
                References are used to create edges between nodes that are
                created elsewhere in the document
              </p>
              <h2>Reference by Label</h2>
              <p>Referencing a node by its exact label</p>
              <CodeExample
                code={`Hello\n  World\n    <span data-highlight>(Hello)</span>`}
                src="5"
              />
              <h2>Reference by ID</h2>
              <p>Referencing a node by its unique ID</p>
              <CodeExample
                code={`Hello #x\n  World #y\n    <span data-highlight>(#x)</span>`}
                src="5"
              />
              <h2>Reference by Class</h2>
              <p>Referencing multiple nodes with the same assigned class</p>
              <CodeExample
                code={`Cat .animals\nDog .animals\nAnimals\n  <span data-highlight>(.animals)</span>`}
                src="6"
              />
            </section>
            <section>
              <h1>Leading References</h1>
              <p>
                Draw an edge from multiple nodes by beginning the line with a
                reference
              </p>
              <CodeExample
                code={`Cat .animals\nDog .animals\n\n<span data-highlight>(.animals)</span>\n  are pets`}
                src="7"
              />
            </section>
            <section>
              <h1>Containers</h1>
              <p>
                Containers are nodes that contain other nodes. They are declared
                using curly braces.
              </p>
              <CodeExample
                code={`Solar System <span data-highlight>{</span>\n  Earth\n    Mars\n<span data-highlight>}</span>`}
                src="8"
              />
            </section>
            <section>
              <h1>Style Classes</h1>
              <p>Some classes are available to help style your flowchart</p>
              <h2>Node Colors</h2>
              <p>
                Colors include red, orange, yellow, blue, purple, black, white,
                and gray.
              </p>
              <CodeExample
                code={`Hello <span data-highlight>.red</span>\n  World <span data-highlight>.blue</span>`}
                src="9"
              />
              <h2>Node Shapes</h2>
              <p>
                Shapes include rectangle, roundrectangle, ellipse, triangle,
                pentagon, hexagon, heptagon, octagon, star, barrel, diamond,
                vee, rhomboid, polygon, tag, round-rectangle, round-triangle,
                round-diamond, round-pentagon, round-hexagon, round-heptagon,
                round-octagon, round-tag, cut-rectangle, bottom-round-rectangle,
                and concave-hexagon.
              </p>
              <CodeExample
                code={`Hello <span data-highlight>.diamond</span>\n  World <span data-highlight>.ellipse</span>`}
                src="10"
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

function CodeExample({ code = "", src }: { code?: string; src?: string }) {
  const imgSrc = src ? `/images/syntax/${src}.png` : "";
  return (
    <div className={styles.codeExample} data-has-image={!!imgSrc}>
      <div className={styles.codeExampleCode}>
        <div dangerouslySetInnerHTML={{ __html: code }} />
      </div>
      {imgSrc && (
        <img className={styles.codeExampleImage} src={imgSrc} alt="an img" />
      )}
    </div>
  );
}
