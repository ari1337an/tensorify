import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

// Use a more flexible interface that only requires the properties we need
interface BlockWithProps {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: Array<any>;
}

interface TableOfContentsProps {
  blocks: BlockWithProps[];
}

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ blocks }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Extract headings from blocks
  useEffect(() => {
    const extractedHeadings = blocks
      .filter((block) => {
        if (block.type !== "heading") return false;
        const level = (block.props as { level?: number })?.level;
        return level === 2 || level === 3;
      })
      .map((block, index) => ({
        id: `bn-heading-${index}`,
        text:
          Array.isArray(block.content) && block.content[0]
            ? (block.content[0] as { text?: string })?.text || ""
            : "",
        level: (block.props as { level?: number })?.level as number,
      }));
    setHeadings(extractedHeadings);
  }, [blocks]);

  // Set up intersection observer for scroll spy
  useEffect(() => {
    const setupObserver = () => {
      // Disconnect previous observer if it exists
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Create a map to store entries and their positions
      const headingPositions = new Map<string, number>();
      let lastScrollY = window.scrollY;
      let scrollingDown = true;
      let ticking = false;

      // Handle scroll direction detection
      const handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;
            scrollingDown = currentScrollY > lastScrollY;
            lastScrollY = currentScrollY;
            ticking = false;
          });
          ticking = true;
        }
      };

      // Add scroll listener to detect direction
      window.addEventListener("scroll", handleScroll, { passive: true });

      // The observer setup
      observerRef.current = new IntersectionObserver(
        (entries) => {
          // Update position information for each entry
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              headingPositions.set(
                entry.target.id,
                entry.boundingClientRect.top
              );

              // When scrolling down, immediately activate the heading that comes into view
              // from the top of the viewport
              if (scrollingDown && entry.boundingClientRect.top < 150) {
                setActiveId(entry.target.id);
              }
              // When scrolling up, activate heading when it's fully visible
              else if (
                !scrollingDown &&
                entry.boundingClientRect.top > 0 &&
                entry.boundingClientRect.top < 300
              ) {
                setActiveId(entry.target.id);
              }
            } else {
              // If it's no longer intersecting, we'll remove it or keep track of its last position
              if (entry.boundingClientRect.top > 0) {
                // Element is below the viewport
                headingPositions.set(entry.target.id, Number.MAX_SAFE_INTEGER);
              } else {
                // Element is above the viewport
                headingPositions.set(entry.target.id, -Number.MAX_SAFE_INTEGER);
              }
            }
          });

          // Find the visible heading that's closest to the top of viewport
          if (headingPositions.size > 0) {
            const sortedHeadings = Array.from(headingPositions.entries())
              .filter(([, position]) => position > -Number.MAX_SAFE_INTEGER) // Filter out headings that are way above
              .sort(([, posA], [, posB]) => {
                // Sort by absolute distance from top, but prioritize positive values
                const absA = Math.abs(posA);
                const absB = Math.abs(posB);
                if (posA >= 0 && posB < 0) return -1; // A is visible, B is above
                if (posA < 0 && posB >= 0) return 1; // A is above, B is visible
                return absA - absB; // Otherwise sort by closest to top
              });

            if (sortedHeadings.length > 0) {
              const [id] = sortedHeadings[0];

              // Only update if we don't already have a newly set activeId from the
              // intersection detection logic above
              if (
                !entries.some(
                  (entry) =>
                    entry.isIntersecting && entry.target.id === activeId
                )
              ) {
                setActiveId(id);
              }
            }
          }
        },
        {
          // Adjusted rootMargin to better detect headings
          // Negative top margin to trigger earlier, large bottom margin to keep tracking
          rootMargin: "-80px 0px -40% 0px",
          threshold: [0, 0.25, 0.5, 0.75, 1],
        }
      );

      // Find all heading elements and observe them
      const observeHeadings = () => {
        // Target all headings that match our heading IDs pattern
        const headingElements = document.querySelectorAll(
          '[id^="bn-heading-"]'
        );

        if (headingElements.length) {
          console.log(
            `Found ${headingElements.length} heading elements to observe: `,
            Array.from(headingElements).map((el) => el.id)
          );

          headingElements.forEach((el) => {
            observerRef.current?.observe(el);
          });

          // If we have headings but none is active yet, set the first one as active
          if (activeId === "" && headingElements.length > 0) {
            setActiveId(headingElements[0].id);
          }
        } else {
          console.log("No heading elements found with bn-heading- prefix");
          // Try again after a short delay
          setTimeout(observeHeadings, 500);
        }
      };

      // Set up a MutationObserver to detect when headings are added to the DOM
      const contentContainer = document.querySelector(".prose");
      if (contentContainer) {
        const mutationObserver = new MutationObserver((mutations) => {
          // Check if any mutations added heading elements
          const shouldReobserve = mutations.some((mutation) => {
            return Array.from(mutation.addedNodes).some((node) => {
              if (node instanceof HTMLElement) {
                return (
                  node.querySelector &&
                  node.querySelector('[id^="bn-heading-"]')
                );
              }
              return false;
            });
          });

          if (shouldReobserve) {
            console.log("DOM changed, re-observing headings");
            observeHeadings();
          }
        });

        mutationObserver.observe(contentContainer, {
          childList: true,
          subtree: true,
        });

        // Clean up
        return () => {
          mutationObserver.disconnect();
          window.removeEventListener("scroll", handleScroll);
        };
      }

      // Initial attempt to observe headings
      observeHeadings();

      // Return cleanup function
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    };

    // Delay the setup to ensure DOM is ready
    const timeoutId = setTimeout(setupObserver, 500);

    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [headings, activeId]);

  // Listen for custom heading visibility events from the editor
  useEffect(() => {
    // Map to track heading visibility state
    const visibleHeadings = new Map<string, boolean>();

    // Function to handle heading visibility changes
    const handleHeadingVisibilityChange = (event: Event) => {
      const { headingId, isVisible } = (event as CustomEvent).detail;

      // Update our map of visible headings
      visibleHeadings.set(headingId, isVisible);

      // Find all currently visible headings
      const currentlyVisible = Array.from(visibleHeadings.entries())
        .filter(([, visible]) => visible)
        .map(([id]) => id);

      // If we have visible headings, update the active ID
      if (currentlyVisible.length > 0) {
        // Sort by their position in the document
        // (Lower heading IDs appear earlier in the document)
        const sorted = currentlyVisible.sort((a, b) => {
          // Extract the numeric part of the ID (bn-heading-X)
          const numA = parseInt(a.split("-").pop() || "0", 10);
          const numB = parseInt(b.split("-").pop() || "0", 10);
          return numA - numB;
        });

        // Get the first visible heading or keep the current one
        // if it's still visible (prevents frequent changes when multiple are visible)
        if (!sorted.includes(activeId) || !visibleHeadings.get(activeId)) {
          setActiveId(sorted[0]);
        }
      }
    };

    // Add event listener
    document.addEventListener(
      "headingVisibilityChange",
      handleHeadingVisibilityChange as EventListener
    );

    // Clean up
    return () => {
      document.removeEventListener(
        "headingVisibilityChange",
        handleHeadingVisibilityChange as EventListener
      );
    };
  }, [activeId]);

  // Handle click on TOC item
  const scrollToHeading = (id: string) => {
    const headingElement = document.getElementById(id);
    if (headingElement) {
      const offsetTop =
        headingElement.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
      setActiveId(id);
    }
  };

  return (
    <nav className="lg:sticky lg:top-[10px] p-4 py-16 lg:max-h-[calc(100vh-180px)] overflow-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-md border border-border/40 table-of-contents">
      <h4 className="font-medium mb-3 text-foreground">Table of Contents</h4>
      {headings.length > 0 ? (
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={cn(
                  "block text-sm text-muted-foreground hover:text-foreground transition-colors relative pl-3",
                  heading.level === 3 && "pl-7",
                  activeId === heading.id && "active"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHeading(heading.id);
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          No section headings found
        </p>
      )}
    </nav>
  );
}
