import React from 'react';
import { Box, Text, Button } from '@chakra-ui/react';
import { MdFolderOpen, MdAssignment } from 'react-icons/md';

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
                <Box as={MdFolderOpen} style={{ fontSize: 80, color: '#AFA37B', opacity: 0.5, marginBottom: 8 }} />
            ) : (
                <Box as={MdAssignment} style={{ fontSize: 80, color: '#AFA37B', opacity: 0.5, marginBottom: 8 }} />
            )}

            <Text fontSize="xl" fontWeight={500} color="#7e755a" mb={1}>
                {isProjects ? 'No Projects Yet' : 'No Tasks Yet'}
            </Text>

            <Text mb={3} color="#AFA37B" maxW="400px">
                {isProjects
                    ? 'Start by creating your first project to organize your tasks and track your progress.'
                    : 'Add a new task to get started. Break down your work into manageable pieces.'}
            </Text>

            <Button colorScheme="brand" onClick={onAction} className="dashboard-button">
                {actionLabel}
            </Button>
        </Box>
    );
}
