import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  ChartData,
  ChartDataset,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController
);
import { format, subDays, isValid } from "date-fns";

const labels = ["January", "February", "March", "April", "May", "June", "July"];

export const data = {
  labels,
  datasets: [
    {
      type: "line" as const,
      label: "Dataset 1",
      borderColor: "rgb(255, 99, 132)",
      borderWidth: 2,
      fill: false,
      data: labels.map((label, index) => index),
    },
    {
      type: "bar" as const,
      label: "Dataset 2",
      backgroundColor: "rgb(75, 192, 192)",
      data: labels.map((label, index) => index),
      borderColor: "white",
      borderWidth: 2,
    },
    {
      type: "bar" as const,
      label: "Dataset 3",
      backgroundColor: "rgb(53, 162, 235)",
      data: labels.map((label, index) => index),
    },
  ],
};

type taskList = {
  todo: string;
  taskDay: Date;
  startAt: string;
  endAt: string;
  createdAt: Date;
  categories: [string];
  tags: [string];
  tagWhos: [string];
  tagWheres: [string];
  author: {
    username: string;
    id: string;
  };
};

interface TimeEntry {
  date: Date;
  tags: string[];
  hour: number;
}

type Props = {
  taskList: taskList[];
  dayUnit: number;
  tagWhatListWithColors: { [key: string]: string };
};

export const AnalysisChart = ({
  taskList,
  dayUnit,
  tagWhatListWithColors,
}: Props) => {
  const [graphData, setGraphData] =
    useState<ChartData<"line" | "bar", number[], string>>(data);

  const timeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const calculateTimeDifference = (time1: string, time2: string) => {
    const minutes1 = timeToMinutes(time1);
    const minutes2 = timeToMinutes(time2);

    return Math.abs(minutes1 - minutes2);
  };

  const tagsWithHour = (taskList: taskList[]) => {
    return taskList.map((task) => {
      return {
        date: task.taskDay,
        tags: task.tags,
        hour: calculateTimeDifference(task.endAt, task.startAt),
      };
    });
  };

  function calculateTagHours(
    entries: TimeEntry[],
    dayUnit: number
  ): Record<string, { tag: string; hours: number }[]> {
    // tagHoursをentriesから作成（準備）
    const tagHours: Record<string, Record<string, number>> = {};
    let dayCount = 1;
    // entriesの中から最初の有効なdateを検索
    let lastProcessedDate = "";
    for (const entry of entries) {
      const dateObj = new Date(entry.date);
      if (isValid(dateObj)) {
        lastProcessedDate = dateObj.toISOString().split("T")[0];
        break; // 最初の有効な日付を見つけたらループを抜ける
      }
    }

    // 有効な日付が一つもない場合のフォールバック
    if (!lastProcessedDate) {
      lastProcessedDate = format(new Date(), "yyyy-MM-dd");
    }
    let displayDay = lastProcessedDate;

    // tagHoursをentriesから作成(メイン)
    entries.forEach((entry) => {
      const { date, tags, hour } = entry;
      // dateをDateオブジェクトに変換します（既にDateオブジェクトである場合はそのまま使用します）。
      const dateObj = new Date(date);
      if (!isValid(dateObj)) {
        return false; // 無効な場合はフィルタリング
      }
      const dateString = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD形式の文字列に変換
      if (displayDay === "") {
        displayDay = dateString;
      }
      // 日付が変わったらdayCountをインクリメント
      if (dateString !== lastProcessedDate) {
        dayCount++;
        lastProcessedDate = dateString; // 最後に処理された日付を更新
      }

      // dayUnitの周期ごとにdisplayDayを更新
      if (dayCount > dayUnit) {
        displayDay = dateString;
        dayCount = 1; // dayUnit周期の最初の日からカウントをリセット
      }

      if (!tagHours[displayDay]) {
        tagHours[displayDay] = {};
      }

      const timePerTag = hour / tags.length;

      tags.forEach((tag) => {
        if (!tagHours[displayDay][tag]) {
          tagHours[displayDay][tag] = 0;
        }
        tagHours[displayDay][tag] += timePerTag;
      });
    });

    // タグの合計時間で並べ替えて新しい構造を作成
    const sortedTagHours: Record<string, { tag: string; hours: number }[]> = {};

    Object.keys(tagHours).forEach((date) => {
      const tagsArray = Object.entries(tagHours[date])
        .map(([tag, hours]) => ({ tag, hours }))
        .sort((a, b) => b.hours - a.hours); // 各日付でタグを時間に基づいて並べ替え

      // 並べ替えた結果を保存
      sortedTagHours[date] = tagsArray;
    });

    return sortedTagHours;
  }

  const createGraphData = (
    tagHours: Record<string, { tag: string; hours: number }[]>
  ) => {
    // 日付とタグの一意のリストを抽出します。
    const dates = Object.keys(tagHours);
    // 日付と曜日を含むラベルの配列を生成
    const labelsWithDayOfWeek = dates.map((dateString) => {
      const date = new Date(dateString);
      // 'en-US'ロケールを使用し、曜日を含む完全な日付を表示
      // ロケールやオプションは必要に応じて調整してください
      return date.toLocaleDateString("ja-JP", {
        weekday: "short",
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
    });
    // タグの一意のリストを抽出します。
    const uniqueTags = Array.from(
      new Set(
        Object.values(tagHours)
          .flat()
          .map(({ tag }) => tag)
      )
    );

    // データセットを準備します。
    const datasets = uniqueTags.map((tag) => ({
      label: tag,
      // 各日付について、対応するタグの時間を検索し、存在しない場合は0を使用します。
      data: dates.map((date) => {
        const tagEntry = tagHours[date].find((entry) => entry.tag === tag);
        return tagEntry ? tagEntry.hours : 0;
      }),
      backgroundColor: tagWhatListWithColors[tag], // タグごとに異なる色を指定
    }));

    // Chart.js用のデータオブジェクトを作成します。
    const data = {
      labels: labelsWithDayOfWeek,
      datasets: datasets,
    };

    setGraphData(data);
  };

  useEffect(() => {
    const entries = tagsWithHour(taskList);
    const tagHours = calculateTagHours(entries, dayUnit);
    createGraphData(tagHours);
  }, [taskList, dayUnit]);

  return <Chart type="bar" data={graphData} />;
};
