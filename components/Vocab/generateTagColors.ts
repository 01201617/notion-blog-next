import { collection, getDocs } from "firebase/firestore";
import { db } from "../Tasks/firebase";
import colormap from "colormap";

export const generateTagColors = async (
  tagKind: string
): Promise<{ [key: string]: string }> => {
  const snapshot = await getDocs(collection(db, tagKind));
  const tags = snapshot.docs.map((doc) => doc.data().tag);
  const uniqueTags = Array.from(new Set(tags));

  const nshades = Math.max(6, uniqueTags.length); // 🔑 最低6にする
  const colorList = colormap({
    colormap: "jet",
    nshades,
    format: "hex",
  });

  const tagColors: { [key: string]: string } = {};
  uniqueTags.forEach((tag, index) => {
    tagColors[tag] = colorList[index];
  });

  return tagColors;
};
