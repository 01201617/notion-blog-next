import type { GetStaticProps } from "next";
import Link from "next/link";
import SinglePost from "../components/Post/SinglePost";
import Tag from "../components/Tag/Tag";
import { getAllTags, getPostsForTopPage } from "../lib/notionAPI";

export const getStaticProps: GetStaticProps = async () => {
  const slicedPosts = await getPostsForTopPage(4);
  const allTags = await getAllTags();

  return {
    props: {
      slicedPosts,
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

const Home = ({
  slicedPosts,
  allTags,
}: {
  slicedPosts: AllPosts;
  allTags: string[];
}) => {
  return (
    <div className="container h-full mx-auto">
      <main className="container w-full mt-16">
        <div className="text-gray-800 text-5xl font-medium text-center mb-16">
          Let&apos;s Learn Language🚀
        </div>
        {slicedPosts.map((post: any) => (
          <div key={post.id} className="mx-4">
            <SinglePost
              title={post.title}
              description={post.description}
              date={post.date}
              tags={post.tags}
              slug={post.slug}
              isPagenationPage={false}
              category={post.categories}
            />
          </div>
        ))}

        <Link
          href="/posts/page/1"
          className="mb-6 lg:w-1/2 mx-auto px-5 block text-right"
        >
          ...もっと見る
        </Link>

        <Tag allTags={allTags} />
      </main>
    </div>
  );
};

export default Home;
