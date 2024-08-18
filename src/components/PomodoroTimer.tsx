"use client"
import { useState, useEffect, useRef } from 'react';

type Mode = 'work' | 'break';

const PomodoroTimer = () => {
  const [time, setTime] = useState<number>(() => {
    const savedTime = localStorage.getItem('time');
    return savedTime ? parseInt(savedTime) : 25 * 60; // 25 minutes in seconds
  });
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mode, setMode] = useState<Mode>(() => {
    const savedMode = localStorage.getItem('mode');
    return savedMode ? (savedMode as Mode) : 'work';
  });
  const [workDuration, setWorkDuration] = useState<number>(() => {
    const savedWorkDuration = localStorage.getItem('workDuration');
    return savedWorkDuration ? parseInt(savedWorkDuration) : 25;
  });
  const [breakDuration, setBreakDuration] = useState<number>(() => {
    const savedBreakDuration = localStorage.getItem('breakDuration');
    return savedBreakDuration ? parseInt(savedBreakDuration) : 5;
  });
  const [progress, setProgress] = useState<number>(0);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode === 'true' ? true : false;
  });
  const [task, setTask] = useState<string>('');
  const [tasks, setTasks] = useState<string[]>(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
        setProgress((prevProgress) => prevProgress + (100 / (mode === 'work' ? workDuration * 60 : breakDuration * 60)));
      }, 1000);
    } else if (time === 0) {
      if (audioRef.current) audioRef.current.play();
      if (mode === 'work') {
        setMode('break');
        setTime(breakDuration * 60);
        setProgress(0);
      } else {
        setMode('work');
        setTime(workDuration * 60);
        setProgress(0);
      }
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, mode, workDuration, breakDuration]);

  useEffect(() => {
    localStorage.setItem('workDuration', workDuration.toString());
    localStorage.setItem('breakDuration', breakDuration.toString());
    localStorage.setItem('mode', mode);
    localStorage.setItem('time', time.toString());
    localStorage.setItem('darkMode', darkMode.toString());
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [workDuration, breakDuration, mode, time, darkMode, tasks]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(mode === 'work' ? workDuration * 60 : breakDuration * 60);
    setProgress(0);
  };

  const addTask = () => {
    if (task) {
      setTasks([...tasks, task]);
      setTask('');
      if(audioRef.current) audioRef.current.play()
    }
  };

  const removeTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
     <>
     <div className=''>
     <div className={` bg-gradient-to-b from-gray-600 to-black  flex flex-col items-center justify-center h-screen w-full bg-gray-100 dark:bg-gray-900   text-white `}>
      <h1 className="text-4xl font-bold mb-6">{mode === 'work' ? 'Work Time' : 'Break Time'}</h1>
      <div className="text-6xl font-mono mb-8">{formatTime(time)}</div>
      <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-6">
        <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={toggleTimer}
          className={`px-6 py-3 rounded-lg text-white ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
        >
          Reset
        </button>
      </div>
      <div className="flex mt-6 space-x-4">
        <input
          type="number"
          value={workDuration}
          onChange={(e) => setWorkDuration(Number(e.target.value))}
          className="w-16 p-2 rounded-lg border text-black border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
        />
        <span>minutes for work</span>
      </div>
      <div className="flex mt-2 space-x-4">
        <input
          type="number"
          value={breakDuration}
          onChange={(e) => setBreakDuration(Number(e.target.value))}
          className="w-16 p-2 rounded-lg border text-black border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
        />
        <span>minutes for break</span>
      </div>
     
      <div className="mt-8 w-full max-w-md">
        <h2 className="text-2xl mb-4">Tasks</h2>
        <div className="flex mb-4">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="flex-1 p-2 rounded-lg border text-black border-gray-300 dark:border-gray-600   dark:bg-gray-800"
            placeholder="Add a new task..."
          />
          <button
            onClick={addTask}
            className="ml-4 px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
          >
            Add Task
          </button>
        </div>
        <ul className="space-y-2">
          {tasks.map((task, index) => (
            <li
              key={index}
              className="flex justify-between p-2 rounded-lg bg-gray-200 text-black dark:bg-gray-700"
            >
              {task}
              <button
                onClick={() => removeTask(index)}
                className="ml-4 text-red-500 hover:text-red-700"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      </div>
      <audio ref={audioRef} src="/game.wav" />
    </div>
     </div>
     </>
  );
};

export default PomodoroTimer;
