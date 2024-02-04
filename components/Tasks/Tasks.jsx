"use client";
import { collection, addDoc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";

const Tasks = () => {
  const [postList, setPostList] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [todo, setTodo] = useState("");
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
  };

  useEffect(() => {
    const getTasks = async () => {
      const data = await getDocs(collection(db, "tasks"));
      setTaskList(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getTasks();
  }, []);

  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const calculateTimeDifference = (time1, time2) => {
    const minutes1 = timeToMinutes(time1);
    const minutes2 = timeToMinutes(time2);

    return Math.abs(minutes1 - minutes2);
  };

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
        onClick={() => {
          createTask();
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
                <div className="w-10 mr-2">{task.startAt}</div>
                <div className="w-10 mr-2">{task.endAt}</div>
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
