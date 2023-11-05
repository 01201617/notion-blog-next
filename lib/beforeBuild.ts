
// .envの変数をこのスクリプトに反映させる。
// require('dotenv').config({ path: '.env.local' })
//プログラム起動時に、NotionDB内の写真をS3へアップロードする。
const Notion = require('@notionhq/client');
const NotionMd = require('notion-to-md');
const fs = require('fs-extra');
const axios = require('axios')

const notion = new Notion.Client({
  auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionMd.NotionToMarkdown({notionClient: notion})



export const getAllMarkDown =async () => {
  const posts = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID || "",
      page_size: 100,
  })
  const allPosts = posts.results;
  // console.log(allPosts)

  allPosts.forEach(async (post: { id: any; })=>{
    const mdBlocks = await n2m.pageToMarkdown(post.id)
    const mdString = await n2m.toMarkdownString(mdBlocks).parent
    // console.log(mdString)
    // 正規表現を使用して文字列を抽出
    const regex = /!\[(.*?)\.(jpeg|jpg|png)\]\((.*?)\)/g
    const matches = Array.from(mdString.matchAll(regex));

    // 抽出した情報を処理
    const extractedData = matches.map((match:any) => {
    return {
        fileName: match[1],
        imageExtension: match[2], // 画像拡張子を取得
        url: match[3],
    };
    });
    if (!fs.existsSync("public/img")) {
      fs.mkdirSync("public/img", { recursive: true });
    }
    extractedData.forEach(async (data: {fileName:string, imageExtension:string, url:string}) => {
      // if(data.fileName.endsWith(".jpeg")||data.fileName.endsWith(".png")||data.fileName.endsWith(".jpg")){
      const response = await axios.get(data.url, { responseType: 'arraybuffer' });
      await fs.writeFile('public/img/'+data.fileName+"."+data.imageExtension, response.data);
      console.log(`画像${data.fileName}.${data.imageExtension}をダウンロードして保存しました。`);
    // }
    });
});

}

async function main() {
  try {
    await getAllMarkDown();
    // 正常終了時の処理
  } catch (error) {
    console.error(`エラーが発生しました: ${error}`);
  }
}

main();

// Adding an Empty Export Statement
export {}; 