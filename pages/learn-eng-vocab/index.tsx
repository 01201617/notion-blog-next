"use client";

import React, { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../components/Tasks/firebase";

import Login from "../../components/Tasks/Login";
import Logout from "../../components/Tasks/Logout";
import { updateLastReadAt } from "../../components/Vocab/firestoreUtils";
import FlipCard from "../../components/Vocab/FlipCard";
import ToggleButton from "../../components/Vocab/ToggleButton";
import VocabForm from "../../components/Vocab/VocabForm";
import ExcelUploader from "../../components/Vocab/ExcelUploader";
import FilterPanel from "../../components/Vocab/FilterPanel";
import { generateTagColors } from "../../components/Vocab/generateTagColors";

export type Vocab = {
  id: string;
  eng: string;
  jpn: string;
  isFavorite: boolean;
  categories: string[];
  remarks: string;
  createdAt: any;
  updatedAt: any;
  lastReadAt: any;
  readCount: number;
};

const VocabPage = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [showEnglish, setShowEnglish] = useState(true);
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [flippedStates, setFlippedStates] = useState<{ [id: string]: boolean }>(
    {}
  );
  const [visibleDetailsId, setVisibleDetailsId] = useState<string | null>(null);

  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [lastReadFrom, setLastReadFrom] = useState("");
  const [lastReadTo, setLastReadTo] = useState("");
  const [readCountFrom, setReadCountFrom] = useState(0);
  const [readCountTo, setReadCountTo] = useState<number | undefined>(undefined);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tagVocabColors, setTagVocabColors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    setIsAuth(Boolean(localStorage.getItem("isAuth")));
  }, []);

  useEffect(() => {
    const q = query(collection(db, "vocabs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Vocab[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Vocab[];
      setVocabs(fetched);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    generateTagColors("tagVocabs").then((colors) => setTagVocabColors(colors));
  }, []);

  const toggleLanguage = () => {
    setShowEnglish((prev) => !prev);
    const resetStates: { [id: string]: boolean } = {};
    vocabs.forEach((vocab) => {
      resetStates[vocab.id] = false;
    });
    setFlippedStates(resetStates);
    setVisibleDetailsId(null);
  };

  const handleCardClick = (vocab: Vocab) => {
    setFlippedStates((prev) => ({
      ...prev,
      [vocab.id]: !prev[vocab.id],
    }));
    setVisibleDetailsId((prev) => (prev === vocab.id ? null : vocab.id));

    const lastRead = vocab.lastReadAt?.seconds
      ? vocab.lastReadAt.seconds * 1000
      : null;
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;

    if (!lastRead || now - lastRead >= tenMinutes) {
      updateLastReadAt(vocab.id);
    }
  };

  const parseYM = (ym: string) => {
    const [year, month] = ym.split("-").map(Number);
    return new Date(year, month - 1);
  };

  const filteredVocabs = useMemo(() => {
    return vocabs.filter((vocab) => {
      const createdAt = vocab.createdAt?.toDate?.();
      const lastReadAt = vocab.lastReadAt?.toDate?.();

      const readCount = vocab.readCount ?? 0;

      if (createdFrom && createdAt && createdAt < parseYM(createdFrom))
        return false;
      if (
        createdTo &&
        createdAt &&
        createdAt >
          new Date(
            parseYM(createdTo).getFullYear(),
            parseYM(createdTo).getMonth() + 1,
            0
          )
      )
        return false;

      if (lastReadFrom && lastReadAt && lastReadAt < parseYM(lastReadFrom))
        return false;
      if (
        lastReadTo &&
        lastReadAt &&
        lastReadAt >
          new Date(
            parseYM(lastReadTo).getFullYear(),
            parseYM(lastReadTo).getMonth() + 1,
            0
          )
      )
        return false;

      if (
        vocab.readCount < readCountFrom ||
        (readCountTo !== undefined && vocab.readCount > readCountTo)
      )
        return false;

      if (selectedCategories.length > 0) {
        const overlap = vocab.categories?.some((cat) =>
          selectedCategories.includes(cat)
        );
        if (!overlap) return false;
      }

      return true;
    });
  }, [
    vocabs,
    createdFrom,
    createdTo,
    lastReadFrom,
    lastReadTo,
    readCountFrom,
    readCountTo,
    selectedCategories,
  ]);

  return (
    <>
      {!isAuth ? (
        <Login setIsAuth={setIsAuth} />
      ) : (
        <div className="p-4 space-y-6">
          <h2 className="text-lg font-bold mb-2">🧠 英熟語学習カード</h2>

          <div className="min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold text-center py-6">
              📘 英熟語 登録フォーム
            </h1>
            <VocabForm />
          </div>

          <ExcelUploader />

          <div className="flex gap-2 items-center">
            <ToggleButton showEnglish={showEnglish} toggle={toggleLanguage} />
            <FilterPanel
              createdFrom={createdFrom}
              setCreatedFrom={setCreatedFrom}
              createdTo={createdTo}
              setCreatedTo={setCreatedTo}
              lastReadFrom={lastReadFrom}
              setLastReadFrom={setLastReadFrom}
              lastReadTo={lastReadTo}
              setLastReadTo={setLastReadTo}
              readCountFrom={readCountFrom}
              setReadCountFrom={setReadCountFrom}
              readCountTo={readCountTo}
              setReadCountTo={setReadCountTo}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              tagKind="tagVocabs"
              tagWhatListWithColors={tagVocabColors}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {filteredVocabs.map((item) => (
              <FlipCard
                key={item.id}
                front={showEnglish ? item.eng : item.jpn}
                back={showEnglish ? item.jpn : item.eng}
                flipped={!!flippedStates[item.id]}
                onClick={() => handleCardClick(item)}
                showEnglish={showEnglish}
                showDetails={visibleDetailsId === item.id}
                vocabDetails={{
                  remarks: item.remarks,
                  categories: item.categories,
                  createdAt: item.createdAt,
                  lastReadAt: item.lastReadAt,
                  readCount: item.readCount ?? 0,
                }}
              />
            ))}
          </div>

          <Logout setIsAuth={setIsAuth} />
        </div>
      )}
    </>
  );
};

export default VocabPage;
