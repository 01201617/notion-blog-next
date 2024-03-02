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
import { isValid } from "date-fns";

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

// データセットの型を拡張して、チャートのタイプごとに型を用意します。
type LineDataset = ChartDataset<"line"> & {
  data: number[];
};

type BarDataset = ChartDataset<"bar"> & {
  data: number[];
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

type graphData = {
  labels: string[];
  datasets: (
    | {
        type: "line";
        label: string;
        borderColor: string;
        borderWidth: number;
        fill: boolean;
        data: number[];
        backgroundColor?: undefined;
      }
    | {
        type: "bar";
        label: string;
        backgroundColor: string;
        data: number[];
        borderColor: string;
        borderWidth: number;
        fill?: undefined;
      }
    | null
  )[];
};

interface TimeEntry {
  date: Date;
  tags: string[];
  hour: number;
}

type Props = {
  taskList: taskList[];
  tagWhatListWithColors: { [key: string]: string };
};

export const AnalysisChart = ({ taskList, tagWhatListWithColors }: Props) => {
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
    entries: TimeEntry[]
  ): Record<string, { tag: string; hours: number }[]> {
    const tagHours: Record<string, Record<string, number>> = {};

    entries.forEach((entry) => {
      const { date, tags, hour } = entry;
      // dateをDateオブジェクトに変換します（既にDateオブジェクトである場合はそのまま使用します）。
      const dateObj = new Date(date);
      if (!isValid(dateObj)) {
        return false; // 無効な場合はフィルタリング
      }
      const dateString = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD形式の文字列に変換

      if (!tagHours[dateString]) {
        tagHours[dateString] = {};
      }

      const timePerTag = hour / tags.length;

      tags.forEach((tag) => {
        if (!tagHours[dateString][tag]) {
          tagHours[dateString][tag] = 0;
        }
        tagHours[dateString][tag] += timePerTag;
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

  function sortTasksByTotalHours(
    tagHours: Record<string, { tag: string; hours: number }[]>
  ): Record<string, { tag: string; hours: number }[]> {
    // ステップ1: 全タスクの合計時間を計算
    const totalHoursPerTag: Record<string, number> = {};

    Object.values(tagHours)
      .flat()
      .forEach(({ tag, hours }) => {
        if (!totalHoursPerTag[tag]) {
          totalHoursPerTag[tag] = 0;
        }
        totalHoursPerTag[tag] += hours;
      });

    // ステップ2: タスクを合計時間に基づいて並び替えるためのタグのリストを生成
    const tagsSortedByTotalHours = Object.entries(totalHoursPerTag)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);

    // ステップ3: 各日にわたるタスクを並び替え
    const sortedTagHoursByTotal: Record<
      string,
      { tag: string; hours: number }[]
    > = {};

    Object.keys(tagHours).forEach((date) => {
      const dayTags = tagHours[date];
      const sortedDayTags = tagsSortedByTotalHours.map((sortedTag) => {
        const tagData = dayTags.find(({ tag }) => tag === sortedTag);
        return tagData || { tag: sortedTag, hours: 0 }; // タグがその日に存在しない場合は0時間として扱う
      });

      sortedTagHoursByTotal[date] = sortedDayTags.filter(
        (tagData) => tagData.hours > 0
      ); // 0時間のタグを除外
    });

    return sortedTagHoursByTotal;
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
    const tagHours = calculateTagHours(entries);
    createGraphData(tagHours);
  }, [taskList]);

  return <Chart type="bar" data={graphData} />;
};
