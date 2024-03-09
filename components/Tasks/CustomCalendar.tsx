import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format } from "date-fns";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  color?: string; // イベントの背景色を指定するオプショナルプロパティ
}

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

interface CustomCalendarProps {
  taskList: taskList[];
  tagWhatListWithColors: { [key: string]: string };
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  taskList,
  tagWhatListWithColors,
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const eventStyleGetter = (event: CalendarEvent) => {
    var style = {
      backgroundColor: event.color || "#3174ad", // デフォルトの色またはイベントに設定された色
      borderRadius: "0px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return {
      style: style,
    };
  };

  const convertDate = (task: taskList, specificTime: string) => {
    let yyyyMMdd = "";
    if (task.taskDay !== undefined) {
      yyyyMMdd = format(task.taskDay, "yyyyMMdd");
    } else {
      yyyyMMdd = format(task.createdAt, "yyyyMMdd");
    }
    const time = specificTime.split(":")[0] + specificTime.split(":")[1];
    const fullTime = yyyyMMdd + time;
    const year = parseInt(fullTime.substring(0, 4));
    const month = parseInt(fullTime.substring(4, 6)) - 1;
    const date = parseInt(fullTime.substring(6, 8));
    const hour = parseInt(fullTime.substring(8, 10));
    const min = parseInt(fullTime.substring(10, 12));
    const fullTimeDate = new Date(year, month, date, hour, min);
    return fullTimeDate;
  };

  const createEvents = () => {
    const eventsFromTasks = taskList.map((task) => {
      return {
        title: task.todo + " " + task.tags.join(" "),
        start: convertDate(task, task.startAt),
        end: convertDate(task, task.endAt),
        color: tagWhatListWithColors[task.tags[0]],
      };
    });
    setEvents(eventsFromTasks);
  };

  useEffect(() => {
    createEvents();
  }, [taskList]);

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: "100vh" }}
      eventPropGetter={eventStyleGetter}
    />
  );
};

export default CustomCalendar;
