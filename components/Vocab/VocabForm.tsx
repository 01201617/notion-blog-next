"use client";

import React, { useEffect, useState } from "react";
import { addVocab } from "./firestoreUtils";
import { db, auth } from "../Tasks/firebase";
import { collection, getDocs } from "firebase/firestore";
import colormap from "colormap";
import TagsInput from "../Tasks/TagsInput";

const VocabForm = () => {
  const [eng, setEng] = useState("");
  const [jpn, setJpn] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [remarks, setRemarks] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [tagVocabColors, setTagVocabColors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    getTagVocabs();
  }, []);

  type TagDocument = {
    id: string;
    tag: string;
    author?: {
      id: string;
      username?: string;
    };
  };

  const getTagVocabs = async () => {
    const data = await getDocs(collection(db, "tagVocabs"));
    const collectionTags: TagDocument[] = data.docs.map((doc) => ({
      ...(doc.data() as Omit<TagDocument, "id">),
      id: doc.id,
    }));

    const tagLists = collectionTags
      .filter((doc) => doc.author?.id === auth.currentUser?.uid)
      .map((doc) => doc.tag);

    const colorSize = tagLists.length > 5 ? tagLists.length : 6;
    const colors = colormap({
      colormap: "jet",
      nshades: colorSize,
      format: "hex",
      alpha: 0.5,
    });

    const tagColors = tagLists.reduce((obj, tag, index) => {
      obj[tag] = colors[index];
      return obj;
    }, {} as { [key: string]: string });

    setTagVocabColors(tagColors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addVocab({ eng, jpn, categories, remarks, isFavorite });
    setEng("");
    setJpn("");
    setRemarks("");
    setCategories([]);
    setIsFavorite(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-xl mx-auto">
      <input
        type="text"
        placeholder="英語(or Q)"
        value={eng}
        onChange={(e) => setEng(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="日本語訳(or A)"
        value={jpn}
        onChange={(e) => setJpn(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      <TagsInput
        tagKind="tagVocabs"
        tagWhats={categories}
        onChangeTags={setCategories}
        tagWhatListWithColors={tagVocabColors}
      />

      <textarea
        placeholder="備考"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isFavorite}
          onChange={() => setIsFavorite(!isFavorite)}
        />
        <span>お気に入り</span>
      </label>
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        登録
      </button>
    </form>
  );
};

export default VocabForm;
