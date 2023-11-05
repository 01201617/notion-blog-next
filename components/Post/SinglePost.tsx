import Link from "next/link";
import React from "react";

type Prpps = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  slug: string;
  isPagenationPage: boolean;
  category: string;
};

const SinglePost = (props: Prpps) => {
  const { title, description, date, tags, slug, isPagenationPage, category } =
    props;
  let bgColors = "bg-gray-300";
  if (category) {
    bgColors =
      category[0] === "programing"
        ? "bg-green-200"
        : category[0] === "japanese"
        ? "bg-yellow-100"
        : "bg-gray-300";
  }
  return (
    <>
      {isPagenationPage ? (
        <section
          className={`${bgColors} xl:w-2/3 mb-8 mx-auto rounded-md p-5 shadow-2xl hover:shadow-none hover:translate-y-1 transition-all duration-300`}
        >
          <div className="flex-wrap items-center">
            <h1 className="text-gray-800 font-bold text-2xl mb-2">
              <Link href={`/posts/${slug}`}>{title}</Link>
            </h1>

            <div className="text-gray-600 mr-2">{date}</div>
            {tags.map((tag: string, index: number) => (
              <Link href={`/posts/tag/${tag}/page/1`} key={index}>
                <span
                  key={index}
                  className="text-gray-100 bg-gray-500 rounded-xl px-2 bd-1 font-medium mr-2"
                >
                  {tag}
                </span>
              </Link>
            ))}
          </div>
          <p className="text-gray-500">{description}</p>
        </section>
      ) : (
        <section
          className={`${bgColors} xl:w-2/3 mb-8 mx-auto rounded-md pt-1 pb-2 px-2 shadow-2xl hover:shadow-none hover:translate-y-1 transition-all duration-300`}
        >
          <div className="flex-wrap items-center gap-3">
            <h1 className="text-gray-800 font-bold text-2xl mb-2">
              <Link href={`/posts/${slug}`}>{title}</Link>
            </h1>

            <div className=" text-gray-600 mr-2">{date}</div>
            {tags.map((tag: string, index: number) => (
              <Link href={`/posts/tag/${tag}/page/1`} key={index}>
                <span
                  key={index}
                  className="text-gray-100 bg-gray-500 rounded-xl px-2 bd-1 font-medium mr-2"
                >
                  {tag}
                </span>
              </Link>
            ))}
          </div>
          <p className="text-gray-500">{description}</p>
        </section>
      )}
    </>
  );
};

export default SinglePost;
