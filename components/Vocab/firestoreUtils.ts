import { doc, updateDoc, collection, addDoc, serverTimestamp, increment } from "firebase/firestore";
import { db, auth } from "../Tasks/firebase";

export const addVocab = async ({
  eng,
  jpn,
  categories,
  remarks,
  isFavorite = false,
}: {
  eng: string;
  jpn: string;
  categories: string[];
  remarks?: string;
  isFavorite?: boolean;
}) => {
  try {
    await addDoc(collection(db, "vocabs"), {
      eng,
      jpn,
      categories,
      remarks: remarks || "",
      isFavorite,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastReadAt: null,
      readCount: 0,
      author: {
        username: auth.currentUser?.displayName || "",
        id: auth.currentUser?.uid || "",
      },
    });
    console.log("✅ 単語を追加しました");
  } catch (err) {
    console.error("❌ Firestore追加エラー:", err);
  }
};

export const updateLastReadAt = async (id: string) => {
  try {
    const vocabRef = doc(db, "vocabs", id);
    await updateDoc(vocabRef, {
      lastReadAt: serverTimestamp(),
      readCount: increment(1), // 読了回数を+1
    });
    console.log(`📖 ${id} の lastReadAt と readCount を更新しました`);
  } catch (err) {
    console.error("❌ lastReadAt 更新エラー:", err);
  }
};