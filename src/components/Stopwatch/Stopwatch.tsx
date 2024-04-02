import React, { useEffect, useState } from 'react'
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { Tooltip, Zoom } from '@mui/material';

export default function Stopwatch() {

    const [time, setTime] = useState(0);

    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval: any;
        if (isRunning) {
            interval = setInterval(() => setTime((prevTime) => prevTime + 1), 10);
        } else {
            clearInterval(interval)
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const hours = Math.floor(time / 360000);

    const minutes = Math.floor((time % 360000) / 6000);

    const seconds = Math.floor((time % 6000) / 100);

    const start = () => setIsRunning(true);

    const stop = () => setIsRunning(false);

    const reset = () => {
        setTime(0);
        setIsRunning(false);
    };

    return (
        <div className="stopwatch-container">
            <Tooltip title={<p className='tooltip-text'>Keep track of task duration</p>} TransitionComponent={Zoom}>
                <p className="stopwatch-time">
                    {hours}:{minutes.toString().padStart(2, "0")}:
                    {seconds.toString().padStart(2, "0")}
                </p>
            </Tooltip>
            <div className="stopwatch-buttons">
                <PlayArrowIcon className='icon' onClick={start} />
                <PauseIcon className='icon' onClick={stop} />
                <StopIcon className='icon' onClick={reset} />
            </div>
        </div>
    );
};