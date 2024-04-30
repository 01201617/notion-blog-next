import { format, parseISO } from 'date-fns';
import { auth} from "./firebase";

interface Task {
  author?: { id: string };
  startAt?: string;
  createdAt: any;
  taskDay?: string;
  endAt?: string;
  tags?: string[];
  tagWhos?: string[];
  tagWheres?: string[];
}

const sortTasks = (taskList: Task[], startDay: string, endDay: string) => {
  const userTasks = taskList
    .filter((task) => task.author?.id === auth.currentUser?.uid)
    .filter((task) => {
      const hasStartAt = task.startAt !== undefined;

      let date: Date | undefined;
      if (task.createdAt) {
        if (typeof task.createdAt.toDate === 'function') {
          date = task.createdAt.toDate();
        } else if (task.createdAt.seconds) {
          date = new Date(task.createdAt.seconds * 1000);
        } else if (typeof task.createdAt === 'string' || typeof task.createdAt === 'number') {
          date = new Date(task.createdAt);
        }
      }

      return hasStartAt && date instanceof Date && !isNaN(date.getTime());
    });

  const tasksWithTime = userTasks.map((task) => {
    let taskDate: Date;

    if (task.taskDay && /^\d{4}-\d{2}-\d{2}$/.test(task.taskDay)) {
      taskDate = new Date(task.taskDay);
    } else {
      if (typeof task.createdAt.toDate === 'function') {
        taskDate = task.createdAt.toDate();
      } else if (task.createdAt.seconds) {
        taskDate = new Date(task.createdAt.seconds * 1000);
      } else {
        taskDate = new Date();
      }
    }

    const yyyyMMdd = format(taskDate, 'yyyyMMdd');
    const time = task.startAt!.split(':')[0] + task.startAt!.split(':')[1];
    const fullTime = yyyyMMdd + time;
    const year = parseInt(fullTime.substring(0, 4));
    const month = parseInt(fullTime.substring(4, 6)) - 1;
    const date = parseInt(fullTime.substring(6, 8));
    const hour = parseInt(fullTime.substring(8, 10));
    const min = parseInt(fullTime.substring(10, 12));
    const fullTimeDate = new Date(year, month, date, hour, min);

    return { ...task, fullTime: fullTime, fullTimeDate: fullTimeDate };
  });

  const sortedTasks = tasksWithTime.sort((a, b) => a.fullTime > b.fullTime ? 1 : -1);

  const recentTasks = sortedTasks.filter((task) => {
    const diffMilliSecFromStart = parseISO(startDay).getTime() - task.fullTimeDate.getTime();
    const diffDaysFromStart = Math.floor(diffMilliSecFromStart / (1000 * 60 * 60 * 24));
    const diffMilliSecFromEnd = parseISO(endDay).getTime() - task.fullTimeDate.getTime();
    const diffDaysFromEnd = Math.floor(diffMilliSecFromEnd / (1000 * 60 * 60 * 24));
    return diffDaysFromStart <= 0 && diffDaysFromEnd >= -1;
  });

  // console.log(recentTasks);

  return recentTasks;
};

export { sortTasks };
