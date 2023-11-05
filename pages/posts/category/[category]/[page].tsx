import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import Pagenation from "../../../../components/Pagenation/Pagenation";
import CategoryPost from "../../../../components/Post/CategoryPost";
import Tag from "../../../../components/Tag/Tag";
import {
  getAllTags,
  getNumberOfPageByCategory,
  getPostsCategoryAndPage,
} from "../../../../lib/notionAPI";

export const getStaticPaths: GetStaticPaths = async () => {
  const allCategories = ["japanese", "programing", "others"];
  let params: { params: { category: string; page: string } }[] = [];

  await Promise.all(
    allCategories.map((category) => {
      return getNumberOfPageByCategory(category).then(
        (numberOfPageByCategory: number) => {
          for (let i = 1; i <= numberOfPageByCategory; i++) {
            params.push({ params: { category: category, page: i.toString() } });
          }
        }
      );
    })
  );

  //   console.log(params);

  return {
    // paths: [
    //   { params: { category: "Japanese", page: "1" } },
    //   { params: { category: "Programing", page: "1" } },
    //   { params: { category: "Other", page: "1" } },
    // ],
    paths: params,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const currentCategory: string = context.params?.category?.toString() || "";
  const currentPage = context.params?.page?.toString() || "1";

  // const upperCaseCurrentCategory =
  //   currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
  //   console.log(upperCaseCurrentTag);

  const posts = await getPostsCategoryAndPage(
    currentCategory,
    parseInt(currentPage, 10)
  );

  const numberOfPagesByCategory = await getNumberOfPageByCategory(
    currentCategory
  );

  const allTags = await getAllTags();

  return {
    props: {
      posts,
      numberOfPagesByCategory,
      currentCategory,
      allTags,
    },
    revalidate: 60 * 60 * 6,
  };
};

type AllPosts = {
  id: any;
  title: any;
  description: any;
  date: any;
  slug: any;
  tags: any;
}[];

const BlogCategoryPageList = ({
  posts,
  numberOfPagesByCategory,
  currentCategory,
  allTags,
}: {
  posts: AllPosts;
  numberOfPagesByCategory: number;
  currentCategory: string;
  allTags: string[];
}) => {
  const bgColors =
    currentCategory === "programing"
      ? "bg-green-100"
      : currentCategory === "japanese"
      ? "bg-yellow-100"
      : "bg-gray-200";
  const activeStyle = `${bgColors} pt-4`;

  return (
    <div className="container h-full mx-auto">
      <main className="container w-full mt-16">
        <div className="text-gray-800 text-5xl font-medium text-center mb-16">
          Let&apos;s Learn Language🚀
        </div>
        <div className="container mx-auto flex text-slate-900 font-bold">
          <button className="bg-green-100 pt-2 px-2 pb-1">
            <Link href={`/posts/category/programing/1`}>プログラミング</Link>
          </button>
          <button className="bg-yellow-100 pt-2 px-2 pb-1">
            <Link href={`/posts/category/japanese/1`}>日本語</Link>
          </button>
          <button className="bg-gray-200 pt-2 px-2 pb-1">
            <Link href={`/posts/category/others/1`}>その他</Link>
          </button>
        </div>
        <div className={activeStyle}>
          <section className="sm:grid grid-cols-2 w-5/6 gap-3 mx-auto">
            {posts.map((post: any) => (
              <div key={post.id}>
                <CategoryPost
                  title={post.title}
                  description={post.description}
                  date={post.date}
                  tags={post.tags}
                  slug={post.slug}
                />
              </div>
            ))}
          </section>
          <Pagenation
            numberOfPage={numberOfPagesByCategory}
            tag={currentCategory}
          />
        </div>
        <Tag allTags={allTags} />
      </main>
    </div>
  );
};

export default BlogCategoryPageList;
