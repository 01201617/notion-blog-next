import Link from "next/link";
import React from "react";
import { getPageLink } from "../../lib/blog-hepler";

interface Props {
  numberOfPage: number;
  tag: string;
}

const Pagenation = (props: Props) => {
  const { numberOfPage, tag } = props;

  let pages: number[] = [];
  for (let i = 1; i <= numberOfPage; i++) {
    pages.push(i);
  }

  return (
    <section className="mb-8 lg:w-1/2 mx-auto rounde-md p-5">
      <div className="flex items-center justify-center gap-4">
        {pages.map((pageNumber) => (
          <div
            className="bg-sky-900 rounded-lg w-6 h-8 relative"
            key={pageNumber}
          >
            <Link
              href={getPageLink(tag, pageNumber)}
              className="text-xs absolute top-2/4 left-2/4 -translate-x-2/4 -translate-y-2/4 text-gray-100"
            >
              {pageNumber}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pagenation;
