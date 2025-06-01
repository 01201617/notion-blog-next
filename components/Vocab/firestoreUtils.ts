import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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
