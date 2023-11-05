import type { GetStaticPaths, GetStaticProps } from "next";
import Pagenation from "../../../../../components/Pagenation/Pagenation";
import SinglePost from "../../../../../components/Post/SinglePost";
import Tag from "../../../../../components/Tag/Tag";
import {
  getAllTags,
  getNumberOfPageByTag,
  getPostsTagAndPage,
} from "../../../../../lib/notionAPI";

export const getStaticPaths: GetStaticPaths = async () => {
  const allTags = await getAllTags();
  let params: { params: { tag: string; page: string } }[] = [];

  await Promise.all(
    allTags.map((tag) => {
      return getNumberOfPageByTag(tag).then((numberOfPageByTag: number) => {
        for (let i = 1; i <= numberOfPageByTag; i++) {
          params.push({ params: { tag: tag, page: i.toString() } });
        }
      });
    })
  );

  //   console.log(params);

  return {
    paths: params,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const currentTag: string = context.params?.tag?.toString() || "";
  const currentPage = context.params?.page?.toString() || "1";

  const upperCaseCurrentTag =
    currentTag.charAt(0).toUpperCase() + currentTag.slice(1);
  //   console.log(upperCaseCurrentTag);

  const posts = await getPostsTagAndPage(
    upperCaseCurrentTag,
    parseInt(currentPage, 10)
  );

  const numberOfPagesByTag = await getNumberOfPageByTag(upperCaseCurrentTag);

  const allTags = await getAllTags();

  return {
    props: {
      posts,
      numberOfPagesByTag,
      upperCaseCurrentTag,
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

const BlogTagPageList = ({
  posts,
  numberOfPagesByTag,
  upperCaseCurrentTag,
  allTags,
}: {
  posts: AllPosts;
  numberOfPagesByTag: number;
  upperCaseCurrentTag: string;
  allTags: string[];
}) => {
  return (
    <div className="container h-full mx-auto">
      <main className="container w-full mt-16">
        <h1 className="text-5xl font-medium text-center mb-16">
          Let&apos;s Learn Language🚀
        </h1>
        <section className="sm:grid grid-cols-2 w-5/6 gap-3 mx-auto">
          {posts.map((post: any) => (
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
        <Pagenation
          numberOfPage={numberOfPagesByTag}
          tag={upperCaseCurrentTag}
        />
        <Tag allTags={allTags} />
      </main>
    </div>
  );
};

export default BlogTagPageList;
