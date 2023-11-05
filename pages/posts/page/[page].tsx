import type { GetStaticPaths, GetStaticProps } from "next";
import Pagenation from "../../../components/Pagenation/Pagenation";
import SinglePost from "../../../components/Post/SinglePost";
import Tag from "../../../components/Tag/Tag";
import {
  getAllTags,
  getNumberOfPage,
  getPostsByPage,
} from "../../../lib/notionAPI";

export const getStaticPaths: GetStaticPaths = async () => {
  const numberOfPage = await getNumberOfPage();
  let params = [];
  for (let i = 1; i <= numberOfPage; i++) {
    params.push({ params: { page: i.toString() } });
  }
  return {
    paths: params,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const currentPage = context.params?.page || "1";
  const postsByPage = await getPostsByPage(
    parseInt(currentPage.toString(), 10)
  );
  const numberOfPage = await getNumberOfPage();

  const allTags = await getAllTags();

  return {
    props: {
      postsByPage,
      numberOfPage,
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
  category: string;
}[];

const BlogPageList = ({
  postsByPage,
  numberOfPage,
  allTags,
}: {
  postsByPage: AllPosts;
  numberOfPage: number;
  allTags: string[];
}) => {
  return (
    <div className="container h-full mx-auto">
      <main className="container w-full mt-16">
        <h1 className="text-gray-800 text-5xl font-medium text-center mb-16">
          Let&apos;s Learn Language🚀
        </h1>
        <section className="sm:grid grid-cols-2 w-5/6 gap-3 mx-auto">
          {postsByPage.map((post: any) => (
            <div key={post.id}>
              <SinglePost
                title={post.title}
                description={post.description}
                date={post.date}
                tags={post.tags}
                slug={post.slug}
                isPagenationPage={true}
                category={post.categories}
              />
            </div>
          ))}
        </section>
        <Pagenation numberOfPage={numberOfPage} tag={""} />
        <Tag allTags={allTags} />
      </main>
    </div>
  );
};

export default BlogPageList;
