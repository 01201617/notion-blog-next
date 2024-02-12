"use client";
import { collection, addDoc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { format } from "date-fns";

const Tasks = () => {
  const [postList, setPostList] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [todo, setTodo] = useState("");
  const [taskDay, setTaskDay] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const createTask = async () => {
    await addDoc(collection(db, "tasks"), {
      todo: todo,
      startAt: startAt,
      endAt: endAt,
      createdAt: new Date(),
      categories: [""],
      tags: [""],
      author: {
        username: auth.currentUser.displayName,
        id: auth.currentUser.uid,
      },
    });
    setTodo("");
    setStartAt("");
    setEndAt("");
  };

  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const calculateTimeDifference = (time1, time2) => {
    const minutes1 = timeToMinutes(time1);
    const minutes2 = timeToMinutes(time2);

    return Math.abs(minutes1 - minutes2);
  };

  const sortTasks = (taskList) => {
    const userTasks = taskList.filter((task) => {
      return task.author?.id === auth.currentUser?.uid;
    });

    const tasksWithTime = userTasks.map((task) => {
      console.log();
      const yyyyMMdd = format(task.createdAt.toDate(), "yyyyMMdd");
      const time = task.startAt.split(":")[0] + task.startAt.split(":")[1];
      const fullTime = yyyyMMdd + time;
      const year = parseInt(fullTime.substring(0, 4));
      const month = parseInt(fullTime.substring(4, 6)) - 1;
      const date = parseInt(fullTime.substring(6, 8));
      const hour = parseInt(fullTime.substring(8, 10));
      const min = parseInt(fullTime.substring(10, 12));
      const fullTimeDate = new Date(year, month, date, hour, min);

      return { ...task, fullTime: fullTime, fullTimeDate: fullTimeDate };
    });

    const sortedTasks = tasksWithTime.sort((a, b) => {
      return a.fullTime > b.fullTime ? 1 : -1;
    });

    const today = new Date();
    const resentTasks = sortedTasks.filter((task) => {
      const diffMilliSec = today - task.fullTimeDate;
      const diffDays = parseInt(diffMilliSec / 1000 / 60 / 60 / 24);
      return diffDays <= 2 && diffDays >= 0;
    });
    setStartAt(resentTasks[resentTasks.length - 1].endAt);

    return resentTasks;
  };
  const getTasks = async () => {
    const data = await getDocs(collection(db, "tasks"));
    const taskList = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setTaskList(sortTasks(taskList));
  };

  useEffect(() => {
    getTasks();
  }, []);

  return (
    <>
      <input
        type="text"
        value={todo}
        onChange={(e) => setTodo(e.target.value)}
        placeholder="タスク"
        required
      />
      <input
        type="date"
        value={taskDay}
        onChange={(e) => setStartAt(e.target.value)}
        required
      />
      <input
        type="time"
        value={startAt}
        onChange={(e) => setStartAt(e.target.value)}
        required
      />
      <input
        type="time"
        value={endAt}
        onChange={(e) => setEndAt(e.target.value)}
        required
      />
      <button
        className="bg-green-500 hover:bg-green-400 text-white rounded px-4 py-2"
        onClick={() => {
          createTask();
          getTasks();
        }}
      >
        task追加
      </button>
      <h2 className="my-10">Taskを表示↓</h2>
      {taskList.map((task, index) => {
        return (
          <div key={index}>
            {task.author?.id === auth.currentUser?.uid && (
              <div key={task.id} className="flex container m-auto">
                <div className="w-72 mr-2">{task.todo}</div>
                <div className="w-10 mr-5">
                  {task.fullTime.substring(4, 6) +
                    "/" +
                    task.fullTime.substring(6, 8)}
                </div>
                <div className="w-40 mr-3">
                  {task.startAt + "-" + task.endAt}
                </div>
                {task.startAt && (
                  <div className="w-10 mr-2">{`${calculateTimeDifference(
                    task.startAt,
                    task.endAt
                  )} 分`}</div>
                )}
                {task.categories && (
                  <div>
                    {task.categories.map((category) => (
                      <div key={category}>{category}</div>
                    ))}
                  </div>
                )}
                {task.tags && (
                  <div>
                    {task.tags.map((tag) => (
                      <div key={tag}>{tag}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default Tasks;
