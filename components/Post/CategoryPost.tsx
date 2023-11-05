import Link from "next/link";
import React from "react";

type Prpps = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  slug: string;
};

const CategoryPost = (props: Prpps) => {
  const { title, description, date, tags, slug } = props;
  return (
    <>
      <section className=" bg-slate-50 mb-8 mx-auto rounded-md pt-1 pb-2 px-2 shadow-2xl hover:shadow-none hover:translate-y-1 transition-all duration-300">
        <div className="lg:flex items-center">
          <h1 className="text-gray-800 font-bold text-2xl mb-2">
            <Link href={`/posts/${slug}`}>{title}</Link>
          </h1>

          <div className="text-gray-400 mr-2">{date}</div>
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
        <p className="text-gray-400">{description}</p>
      </section>
    </>
  );
};

export default CategoryPost;
