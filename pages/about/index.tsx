"use client";

import { useEffect, useState } from "react";

interface ClockData {
  currentDateTime: string;
}

const About = () => {
  const [clockData, setClockData] = useState<ClockData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [randomNumber, setRandomNumber] = useState<string>();

  async function fetchRandomNumber() {
    try {
      const response = await fetch(
        "https://www.random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain&rnd=new"
      );
      if (response.ok) {
        const data = await response.text();
        setRandomNumber(data.trim());
      } else {
        console.error("データを取得できませんでした。");
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);
    }
  }

  const fetchClockData = async () => {
    try {
      const response = await fetch("http://worldclockapi.com/api/json/utc/now");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: ClockData = await response.json();
      setClockData(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomNumber();
    fetchClockData();
  }, []);
  return (
    <>
      <p>build@{clockData?.currentDateTime}</p>
      <p>randomNumber:{randomNumber}</p>
      <button
        onClick={fetchRandomNumber}
        className="bg-gray-800 hover:bg-gray-700 text-white rounded px-4 py-2"
      >
        ランダム数更新
      </button>
      <div>about (preparing)</div>
    </>
  );
};

export default About;
