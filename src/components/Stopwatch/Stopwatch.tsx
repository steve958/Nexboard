import React, { useEffect, useState } from 'react'
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { Tooltip, Zoom } from '@mui/material';

interface StopwatchProps {
    onTimeUpdate?: (hours: number) => void;
}

export default function Stopwatch({ onTimeUpdate }: StopwatchProps = {}) {

    const [time, setTime] = useState(0);

    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval: any;
        if (isRunning) {
            // Update every 100ms for smoother display
            interval = setInterval(() => setTime((prevTime) => prevTime + 100), 100);
        } else {
            clearInterval(interval)
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    // Convert milliseconds to hours, minutes, seconds
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);

    const start = () => setIsRunning(true);

    const stop = () => setIsRunning(false);

    const reset = () => {
        setTime(0);
        setIsRunning(false);
    };

    const getElapsedHours = () => {
        return time / 3600000; // Convert milliseconds to hours
    };

    // Keyboard shortcuts (Space to toggle, R to reset)
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Only handle if not typing in an input field
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.code === 'Space') {
                e.preventDefault();
                setIsRunning(prev => !prev);
            } else if (e.code === 'KeyR' && e.ctrlKey) {
                e.preventDefault();
                reset();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    // Notify parent of time updates
    useEffect(() => {
        if (onTimeUpdate && !isRunning && time > 0) {
            onTimeUpdate(getElapsedHours());
        }
    }, [isRunning, time, onTimeUpdate]);

    return (
        <div className="stopwatch-container">
            <Tooltip
                title={
                    <div className='tooltip-text'>
                        <p>Keep track of task duration</p>
                        <p style={{ fontSize: '12px', marginTop: '4px' }}>Space: Start/Pause | Ctrl+R: Reset</p>
                    </div>
                }
                TransitionComponent={Zoom}
            >
                <p className="stopwatch-time">
                    {hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}:
                    {seconds.toString().padStart(2, "0")}
                </p>
            </Tooltip>
            <div className="stopwatch-buttons">
                <Tooltip title="Start (Space)" arrow>
                    <PlayArrowIcon
                        className='icon'
                        onClick={start}
                        style={{ color: isRunning ? '#ccc' : '#7e755a' }}
                    />
                </Tooltip>
                <Tooltip title="Pause (Space)" arrow>
                    <PauseIcon
                        className='icon'
                        onClick={stop}
                        style={{ color: !isRunning ? '#ccc' : '#7e755a' }}
                    />
                </Tooltip>
                <Tooltip title="Reset (Ctrl+R)" arrow>
                    <StopIcon className='icon' onClick={reset} />
                </Tooltip>
            </div>
        </div>
    );
};