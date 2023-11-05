import Head from "next/head";
import { useEffect } from "react";
import tocbot from "tocbot";

const TableOfContents = () => {
  // https://chabelog.com/blog/tocbot
  // 見出しタグに id を付ける
  const addIdsToTitle = () => {
    const entryContainer = document.querySelector(".toc-body");
    if (!entryContainer) {
      return;
    }
    const headings = entryContainer.querySelectorAll("h2, h3, h4");

    [].forEach.call(headings, (heading: HTMLElement) => {
      const id = heading.textContent as string;
      if (!heading.getAttribute("id")) {
        heading.setAttribute("id", id);
      }
    });
  };

  const isHeadingsExists = () => {
    const entryContainer = document.querySelector(".toc-body");
    if (!entryContainer) {
      return;
    }
    const headings = entryContainer.querySelectorAll("h2, h3, h4");
    if (headings.length === 0) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    addIdsToTitle();
    const item = document.querySelector(".toc") as HTMLElement;
    if (!item) {
      return;
    }
    if (!isHeadingsExists()) {
      return;
    }
    item.style.display = "block";
    tocbot.init({
      tocSelector: ".toc",
      contentSelector: ".toc-body",
      headingSelector: "h2, h3, h4",
    });

    return () => tocbot.destroy();
  }, []);

  return (
    <>
      {/* https://gizanbeak.com/post/tocbot */}
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/tocbot/4.11.1/tocbot.css"
        />
      </Head>
      <div className="toc">{/* 目次がここに表示されます */}</div>
    </>
  );
};

export default TableOfContents;
