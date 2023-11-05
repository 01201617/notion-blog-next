import Link from "next/link";
import React from "react";

const Tag = ({ allTags }: { allTags: string[] }) => {
  return (
    <div className="mx-4">
      <section className="lg:w-1/2 mx-auto">
        <button className="bg-green-200 mb-8 p-2 rounded-md mx-auto hover:translate-y-1 duration-300 transition-all">
          <Link href={`/posts/category/programing/1`}>
            <span className="px-2 font-bold text-gray-600">
              カテゴリ別ページ一覧へ
            </span>
          </Link>
        </button>
      </section>

      <section className="lg:w-1/2 mb-8 mx-auto bg-yellow-100 rounded-md p-5 shadow-2xl hover:shadow-none hover:translate-y-1 duration-300 transition-all">
        <div className="font-bold text-gray-600 mb-4">タグ検索</div>
        <div className="flex flex-wrap gap-5">
          {allTags.map((tag: string, index: number) => (
            <Link href={`/posts/tag/${tag}/page/1`} key={index}>
              <span className="cursor-pointer px-2 font-medium pb-1 rounded-xl bg-gray-400 inline-block text-slate-50">
                {tag}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Tag;
