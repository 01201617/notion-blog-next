import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkBreaks from "remark-breaks";
import CodeCopyBtn from "../../components/CodeCopyBtn";
import AccessCount from "../../components/Sidebar/AccessCount";
import TableOfContents from "../../components/Sidebar/TableOfContents";
import { getAllPosts, getSinglePost } from "../../lib/notionAPI";

export const getStaticPaths = async () => {
  const allPosts = await getAllPosts();
  const paths = allPosts.map(({ slug }) => ({ params: { slug } }));
  //   console.log(paths);
  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps = async ({ params }: any) => {
  const post = await getSinglePost(params.slug);

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 6,
  };
};

const Post = ({ post }: any) => {
  // Add the CodeCopyBtn component to our PRE element
  const Pre = ({ children }: any) => (
    <pre className="blog-pre">
      <CodeCopyBtn>{children}</CodeCopyBtn>
      {children}
    </pre>
  );

  return (
    <div className="md:flex px-5 md:px-10">
      <div className="toc-body w-full">
        <section className="container lg:px-2 h-screen  mx-auto mt-20">
          <h1 className="bg-green-100 md:w-2/3 text-4xl font-bold text-gray-600">
            {post.metadata.title}
          </h1>
          <div className="border-b-2 md:w-2/3 border-gray-600 "></div>
          <span className="text-gray-500 md:w-2/3 ">{post.metadata.date}</span>
          <br />
          <div className="container mx-auto flew-wrap justify-between">
            {post.metadata.tags.map((tag: string, index: number) => (
              <p
                key={index}
                className="text-white bg-gray-600 rounded-xl m-1 px-2 inline-block"
              >
                <Link href={`/posts/tag/${tag}/page/1`}>{tag}</Link>
              </p>
            ))}
          </div>
          <div className="mt-12 font-medium md:w-2/3 ">
            <ReactMarkdown
              remarkPlugins={[remarkBreaks]}
              className="post-markdown"
              linkTarget="_blank"
              components={{
                p: ({ children }) => (
                  <p style={{ marginBottom: "2em" }}>{children}</p>
                ),
                pre: Pre,
                code({
                  node,
                  inline,
                  className = "blog-code",
                  children,
                  ...props
                }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {post.markdown}
            </ReactMarkdown>
            <div>{post.metadata.access}</div>
            <Link href={"/"}>
              <span className="pb-40 block mt-3 text-sky-900">
                ← ホームに戻る
              </span>
            </Link>
            <div className="md:absolute top-20 right-10">
              <AccessCount slug={post.metadata.slug} />
            </div>
          </div>
        </section>
      </div>
      <TableOfContents />
    </div>
  );
};

export default Post;
