import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface EmptyStateProps {
    type: 'projects' | 'tasks';
    onAction: () => void;
    actionLabel: string;
}

export default function EmptyState({ type, onAction, actionLabel }: EmptyStateProps) {
    const isProjects = type === 'projects';

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#7e755a',
            }}
        >
            {isProjects ? (
                <FolderOpenIcon sx={{ fontSize: 80, color: '#AFA37B', opacity: 0.5, marginBottom: 2 }} />
            ) : (
                <AssignmentIcon sx={{ fontSize: 80, color: '#AFA37B', opacity: 0.5, marginBottom: 2 }} />
            )}

            <Typography
                variant="h5"
                sx={{
                    marginBottom: 1,
                    fontWeight: 500,
                    color: '#7e755a',
                }}
            >
                {isProjects ? 'No Projects Yet' : 'No Tasks Yet'}
            </Typography>

            <Typography
                variant="body1"
                sx={{
                    marginBottom: 3,
                    color: '#AFA37B',
                    maxWidth: '400px',
                }}
            >
                {isProjects
                    ? 'Start by creating your first project to organize your tasks and track your progress.'
                    : 'Add a new task to get started. Break down your work into manageable pieces.'}
            </Typography>

            <Button
                variant="contained"
                onClick={onAction}
                className="dashboard-button"
                sx={{
                    backgroundColor: '#ffefba',
                    color: '#7e755a',
                    '&:hover': {
                        backgroundColor: '#AFA37B',
                        color: 'white',
                    },
                    textTransform: 'none',
                    fontSize: '16px',
                    padding: '12px 32px',
                }}
            >
                {actionLabel}
            </Button>
        </Box>
    );
}
