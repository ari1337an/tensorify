"use client"; // this registers <Editor> as a Client Component
import "@blocknote/core/fonts/inter.css";
import { codeBlock } from "@blocknote/code-block";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import "./editor-style.css";
import { Block } from "@blocknote/core";
import { useState, useEffect, useCallback } from "react";

interface EditorProps {
  initialContent: Block[];
}

// Our <Editor> component we can reuse later
export default function Editor({ initialContent }: EditorProps) {
  const [html, setHtml] = useState("");
  const editor = useCreateBlockNote({
    codeBlock,
    initialContent,
  });

  // Emitter for heading visibility changes
  const dispatchHeadingEvent = useCallback(
    (headingId: string, isVisible: boolean) => {
      const event = new CustomEvent("headingVisibilityChange", {
        detail: { headingId, isVisible },
      });
      document.dispatchEvent(event);
    },
    []
  );

  useEffect(() => {
    const processHTML = async () => {
      const rawHtml = await editor.blocksToFullHTML(initialContent);
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, "text/html");

      // Reset heading index to ensure we start from 0
      let headingIndex = 0;

      // Add IDs to h2 and h3 elements within BlockNote structure
      const headings = doc.querySelectorAll(
        '.bn-block-content[data-content-type="heading"]'
      );

      headings.forEach((heading) => {
        const headingElement = heading.querySelector("h2, h3");
        if (headingElement) {
          // Use sequential index starting at 0 to match TableOfContents expectations
          const headingId = `bn-heading-${headingIndex}`;
          headingElement.id = headingId;

          // Add scroll-margin-top to the heading element
          (headingElement as HTMLElement).style.scrollMarginTop = "100px";

          // Improve visibility for scrollIntoView
          (headingElement as HTMLElement).dataset.heading = "true";

          // Log the heading for debugging
          console.log(
            `Assigned ID: ${headingId} to heading: ${headingElement.textContent}`
          );

          // Increment for next heading
          headingIndex++;
        }
      });

      setHtml(doc.body.innerHTML);
    };

    processHTML();
  }, [editor, initialContent]);

  // Set up intersection observers for all headings after the content is rendered
  useEffect(() => {
    if (!html) return;

    // Give DOM time to update
    const timeoutId = setTimeout(() => {
      const headingElements = document.querySelectorAll('[id^="bn-heading-"]');

      if (headingElements.length === 0) {
        console.warn("No heading elements found to observe");
        return;
      }

      console.log(
        `Setting up observers for ${headingElements.length} headings`
      );

      // Create a single observer for all headings
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            dispatchHeadingEvent(entry.target.id, entry.isIntersecting);
          });
        },
        {
          rootMargin: "-50px 0px -70% 0px",
          threshold: [0, 0.2, 0.5, 0.8],
        }
      );

      // Observe all headings
      headingElements.forEach((heading) => {
        observer.observe(heading);
      });

      return () => {
        observer.disconnect();
      };
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [html, dispatchHeadingEvent]);

  return (
    <div
      className="mb-6 prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
