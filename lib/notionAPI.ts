import {Client} from "@notionhq/client"
import {NotionToMarkdown} from "notion-to-md"
import { NUMBER_OF_POSTS_PER_PAGE } from "../constants/constants";

const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({notionClient: notion})

export const getAllPosts =async () => {
    let retries = 0;
    let posts = null;
    while (retries < 3) { // 3回までリトライ
        try {
        posts = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID || "",
        page_size: 100,
        filter:{
            property: "Published",
            checkbox:{
                equals: true
            }
        },
        sorts:[
            {
                property: "Date",
                direction: "descending"
            }
        ]
    })
        break;
    } catch (error) {
        console.error('Received Notion query error. Retrying...');
    }
    }

    
    const allPosts = posts!.results;

    return allPosts.map((post)=>{
        return getPageMetaData(post);
        // return post;
    });
    
}

const getPageMetaData = (post: any)=>{

    const getTags = (tags:any) =>{
        const allTags = tags.map((tag: any)=>{
            return tag.name;
        })
    return allTags;
    }

    const getCategories = (categories:any) =>{
        const allCategories = categories.map((category: any)=>{
            return category.name;
        })
    return allCategories.length >0 ? allCategories : ["others"];
    }


    return{
        id: post.id,
        title: post.properties.名前.title[0].plain_text,
        description: post.properties.Description.rich_text[0].plain_text,
        date: post.properties.Date.date.start,
        slug: post.properties.Slug.rich_text[0].plain_text,
        tags: getTags(post.properties.タグ.multi_select),
        categories: getCategories(post.properties.Category.multi_select),
        access: post.properties.access?.number
    }
}

export const getSinglePost =async (slug:string) => {
    const response = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID || "",
        filter: {
            property: "Slug",
            formula: {
                string: {
                    equals: slug,
                }
            }
        }

    })
    // console.log(response.results[0])

    const page = response.results[0];
    const metadata = getPageMetaData(page)
    // console.log(metadata)
    const mdBlocks = await n2m.pageToMarkdown(page.id)
    const mdString = n2m.toMarkdownString(mdBlocks).parent
    const newMarkdown = await replaceImgUrl(mdString)
    // console.log(newMarkdown)
    return {metadata,
        markdown: newMarkdown
    }

    
}

export const replaceImgUrl = async (mdString: string) => {

    let newMarkdown = mdString
    // 正規表現を使用して文字列を抽出
    const regex = /!\[(.*?)\.(jpeg|jpg|png)\]\((.*?)\)/g
    const matches = Array.from(mdString.matchAll(regex));

    // 抽出した情報を処理
    const extractedData = matches.map((match) => {
    return {
        fileName: match[1],
        imageExtension: match[2], // 画像拡張子を取得
        url: match[3],
    };
    });
    extractedData.forEach(async (data: {fileName:string, imageExtension:string, url:string}) => {
        // console.log(data.fileName)
        // notionのurlを、ローカル保存の画像urlへ置き換えていく
        newMarkdown = newMarkdown.replace(data.url, "/img/"+data.fileName+"."+data.imageExtension);
    });

    return newMarkdown
  
  }

/* TopPage用の記事の取得 */
export const getPostsForTopPage =async (pageSize = 4) => {
    const allPosts = await getAllPosts();
    const slicedPosts = allPosts.slice(0, pageSize)
    return slicedPosts
}

/* ページ番号に応じた記事取得 */
export const getPostsByPage = async(page: number) =>{
    const allPosts = await getAllPosts();
    const startIndex = (page -1) * NUMBER_OF_POSTS_PER_PAGE;
    const endIndex = startIndex + NUMBER_OF_POSTS_PER_PAGE;
    const slicedPosts = allPosts.slice(startIndex, endIndex)
    return slicedPosts
}

export const getNumberOfPage =async () => {
    const allPosts = await getAllPosts();

    return Math.floor(allPosts.length / NUMBER_OF_POSTS_PER_PAGE) + (allPosts.length % NUMBER_OF_POSTS_PER_PAGE >0 ? 1 : 0)
}

/* Tagに応じたポスト取得 */
export const getPostsTagAndPage = async(tagName: string, page:number) =>{
    const allPosts = await getAllPosts();
    const posts = allPosts.filter((post)=>post.tags.find((tag:string)=> tag===tagName))
    const startIndex = (page -1) * NUMBER_OF_POSTS_PER_PAGE;
    const endIndex = startIndex + NUMBER_OF_POSTS_PER_PAGE;
    const slicedPosts = posts.slice(startIndex, endIndex)

    return slicedPosts
}

export const getNumberOfPageByTag =async (tagName: string) => {
    const allPosts = await getAllPosts();
    const posts = allPosts.filter((post)=>post.tags.find((tag:string)=> tag===tagName))


    return Math.floor(posts.length / NUMBER_OF_POSTS_PER_PAGE) + (posts.length % NUMBER_OF_POSTS_PER_PAGE >0 ? 1 : 0)
}

export const getAllTags =async () => {
    const allPosts = await getAllPosts();

    const allDuplicatedTags = allPosts.flatMap((post)=>post.tags)
    const set = new Set(allDuplicatedTags)
    const allUniqueTags = Array.from(set)
    return allUniqueTags
}

export const getNumberOfPageByCategory =async (categoryName: string) => {
    const allPosts = await getAllPosts();
    const posts = allPosts.filter((post)=>post.categories.find((category:string)=> category===categoryName))


    return Math.floor(posts.length / NUMBER_OF_POSTS_PER_PAGE) + (posts.length % NUMBER_OF_POSTS_PER_PAGE >0 ? 1 : 0)
}

export const getPostsCategoryAndPage = async(categoryName: string, page:number) =>{
    const allPosts = await getAllPosts();
    const posts = allPosts.filter((post)=>post.categories.find((category:string)=> category===categoryName))
    const startIndex = (page -1) * NUMBER_OF_POSTS_PER_PAGE;
    const endIndex = startIndex + NUMBER_OF_POSTS_PER_PAGE;
    const slicedPosts = posts.slice(startIndex, endIndex)

    return slicedPosts
}

type notionData = {  
    Category: { id: string, type: string, multi_select: string[] },
    'タグ': { id: string, type: string, multi_select: string[] },
    Description: { id: string, type: string, rich_text: string[] },
    Published: { id: string, type: string, checkbox: boolean },
    Slug: { id: string, type: string, rich_text: string[] },
    Date: { id: string, type: string, date: string[] },
    access: { id: string, type: string, number: number },
    '名前': { id: string, type: string, title: string[] }
}

// レコードを更新
// export const countUpAccess =async(recordId:string, updatedData:notionData)=> {
//     try {
//       const response = await notion.pages.update({
//         page_id: recordId,
//         properties: updatedData,
//       });
//       console.log('レコードが更新されました:', response);
//     } catch (error) {
//       console.error('エラー:', error);
//     }
//   }


// Initializing a client
export const countUpAccess = async (slug:string) => {
    console.log(slug)
    const response = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID!,
        filter: {
            property: "Slug",
            formula: {
                string: {
                    equals: slug,
                }
            }
        }

    })

    
    
    const userInfo = response.results[0]; //n0bisukeさんの情報が入っている
    const userRecordId = response.results[0].id; //n0bisukeさんの情報があるレコードのID
    // let userScore = userInfo.properties['access'].number || 0; //スコアの値がなかったら0で
    // userScore++; //1点追加
    
    
    //2. レコードのIDを指定して更新
    const response2 = await notion.pages.update({
        page_id: userRecordId,
        properties: {
            'age': { 
                type: 'number',
                number: 11 //追加された点数でDB更新
            },
        },
    });
    
    console.log(response2);    
}