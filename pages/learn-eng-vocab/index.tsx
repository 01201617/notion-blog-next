"use client";
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../components/Tasks/firebase";

import Login from "../../components/Tasks/Login";
import Logout from "../../components/Tasks/Logout";
import Tasks from "../../components/Tasks/Tasks";
import FlipCard from "../../components/Vocab/FlipCard";
import ToggleButton from "../../components/Vocab/ToggleButton";
import VocabForm from "../../components/Vocab/VocabForm";

type Vocab = {
  id: string;
  eng: string;
  jpn: string;
  isFavorite: boolean;
  categories: string[];
  remarks: string;
  createdAt: any;
  updatedAt: any;
  lastReadAt: any;
};

const VocabPage = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [showEnglish, setShowEnglish] = useState(true);
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [flippedStates, setFlippedStates] = useState<boolean[]>([]);

  useEffect(() => {
    setIsAuth(Boolean(localStorage.getItem("isAuth")));
  }, []);

  // Firestore から vocabs を取得
  useEffect(() => {
    const q = query(collection(db, "vocabs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Vocab[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Vocab[];
      setVocabs(fetched);
      setFlippedStates(fetched.map(() => false)); // 取得時に初期化
    });

    return () => unsubscribe(); // クリーンアップ
  }, []);

  // 表示言語切り替え時にカード状態リセット
  useEffect(() => {
    setFlippedStates(vocabs.map(() => false));
  }, [showEnglish, vocabs]);

  const toggleLanguage = () => {
    setShowEnglish((prev) => !prev);
  };

  const handleCardClick = (index: number) => {
    setFlippedStates((prev) =>
      prev.map((val, i) => (i === index ? !val : val))
    );
  };

  return (
    <>
      {!isAuth ? (
        <Login setIsAuth={setIsAuth} />
      ) : (
        <div className="p-4 space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-2">🧠 英熟語学習カード</h2>
            <div className="min-h-screen bg-gray-100">
              <h1 className="text-2xl font-bold text-center py-6">
                📘 英熟語 登録フォーム
              </h1>
              <VocabForm />
            </div>

            <ToggleButton showEnglish={showEnglish} toggle={toggleLanguage} />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {vocabs.map((item, index) => (
                <FlipCard
                  key={item.id}
                  front={showEnglish ? item.eng : item.jpn}
                  back={showEnglish ? item.jpn : item.eng}
                  flipped={flippedStates[index]}
                  onClick={() => handleCardClick(index)}
                  showEnglish={showEnglish}
                />
              ))}
            </div>
          </div>

          <Logout setIsAuth={setIsAuth} />
        </div>
      )}
    </>
  );
};

export default VocabPage;
