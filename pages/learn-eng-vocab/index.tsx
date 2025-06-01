"use client";
import React, { useEffect, useState } from "react";
import Login from "../../components/Tasks/Login";
import Logout from "../../components/Tasks/Logout";
import Tasks from "../../components/Tasks/Tasks";
import FlipCard from "../../components/Vocab/FlipCard";
import ToggleButton from "../../components/Vocab/ToggleButton";
import idioms from "../../components/Vocab/idioms.json";

const VocabPage = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [showEnglish, setShowEnglish] = useState(true);
  const [flippedStates, setFlippedStates] = useState<boolean[]>([]);

  useEffect(() => {
    setIsAuth(Boolean(localStorage.getItem("isAuth")));
  }, []);

  useEffect(() => {
    // 初期化
    setFlippedStates(idioms.map(() => false));
  }, [showEnglish]);

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
            <ToggleButton showEnglish={showEnglish} toggle={toggleLanguage} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {idioms.map((item, index) => (
                <FlipCard
                  key={index}
                  front={showEnglish ? item.en : item.jp}
                  back={showEnglish ? item.jp : item.en}
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
