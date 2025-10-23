import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import dashboardImg from "../../../public/dashboardImg.png";
import { Box, Button, FormControl, FormLabel, Select, Stack, Input, Textarea, Tooltip, IconButton, Heading, SimpleGrid, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, HStack, Badge, Text, Skeleton, SkeletonText, Progress as ChakraProgress } from "@chakra-ui/react";
import { MdMenu, MdArrowUpward, MdRedo, MdLogout, MdClose, MdInfo } from "react-icons/md";
import { DndContext, closestCorners, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { UserAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useToast } from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/components/firebase";
import CircularIndeterminate from "@/components/Loader/Loader";
import Stopwatch from "@/components/Stopwatch/Stopwatch";

interface NewTask {
    heading: string;
    description: string;
    estimation: number;
}

export interface UserTask {
    heading: string;
    description: string;
    estimation: number;
    created: Date;
    status: string;
    completed: number;
    id: number;
    number: number;
}

export interface UserProject {
    tasks: UserTask[];
    name: string;
    id: string;
    userStory: string;
}

export interface UserData {
    projects: UserProject[];
}

interface ProjectSummary {
    totalTasks: number;
    totalEstimation: number;
    tasksCompleted: number;
    estimationAcc: number;
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` as any : undefined,
    transition: transition as any,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

export default function Dashboard() {
    const { handleSelectedTask, project, setProject } = UserAuth();

    const ref = useRef<null | any>(null);

    const { logout, user } = UserAuth();
    const [userData, setUserData] = useState<UserData>({} as UserData);
    const [containerWidth, setContainerWidth] = useState(0);
    const [menuClicked, setMenuClicked] = useState(false);
    const [userClicked, setUserClicked] = useState(false);
    const [newProjectClicked, setNewProjectClicked] = useState(false);
    const [editProjectClicked, setEditProjectClicked] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [userStory, setUserStory] = useState("");
    const [deleteModalClicked, setDeleteModalClicked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newTaskClicked, setNewTaskClicked] = useState(false);
    const [newTaskDetails, setNewTaskDetails] = useState<NewTask>({
        heading: "",
        description: "",
        estimation: 0,
    });
    // Quick add inputs
    const [quickHeading, setQuickHeading] = useState<string>("");
    const [quickEstimation, setQuickEstimation] = useState<string>("");
    const [projectSummary, setProjectSummary] = useState<ProjectSummary>({
        totalTasks: 0,
        totalEstimation: 0,
        tasksCompleted: 0,
        estimationAcc: 0,
    });

    const router = useRouter();
    const toast = useToast();

    function handleLogoutDash() {
        logout();
        router.push("/");
    }

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );

    useEffect(() => {
        if (user) fetchUserData();
    }, [user]);

    useLayoutEffect(() => {
        window.addEventListener("resize", () => {
            if (ref.current) {
                setContainerWidth(ref.current.offsetWidth);
            }
        });
        return () => {
            window.removeEventListener("resize", () => {
                if (ref.current) {
                    setContainerWidth(ref.current.offsetWidth);
                }
            });
        };
    }, []);

    useEffect(() => {
        if (userData?.projects?.length > 0 && !project) {
            setProject(userData?.projects[userData.projects.length - 1]?.id);
            generateProjectSummary(
                userData?.projects[userData.projects.length - 1]?.id
            );
        } else {
            generateProjectSummary(project);
        }
    }, [userData]);

    useEffect(() => {
        generateProjectSummary(project);
    }, [project]);

    useEffect(() => {
        if (editProjectClicked) {
            const name = getUsersProjectName() ?? "";
            const story = getUsersProjectStory() ?? "";
            setUserStory(story);
            setNewProjectName(name);
        }
    }, [editProjectClicked]);

    // Handle Escape key to close modals
    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (newProjectClicked) {
                    handleCloseProjectClick(e);
                } else if (editProjectClicked) {
                    handleCloseEditProjectClick(e);
                } else if (deleteModalClicked) {
                    handleCloseDeleteModal();
                } else if (newTaskClicked) {
                    handleCloseNewTask();
                } else if (userClicked) {
                    handleUserCloseClick();
                }
            }
        };

        window.addEventListener('keydown', handleEscapeKey);
        return () => window.removeEventListener('keydown', handleEscapeKey);
    }, [newProjectClicked, editProjectClicked, deleteModalClicked, newTaskClicked, userClicked]);

    // api calls

    async function addNewTask() {
        if (
            !newTaskDetails.description ||
            !newTaskDetails.heading ||
            !newTaskDetails.estimation
        ) {
            toast({ status: 'error', title: 'Please fill all task details' });
            return;
        } else {
            const id = userData?.projects.find(
                (projectData: UserProject) => projectData.id === project
            )?.id;
            if (!id) return;
            try {
                setLoading(true);
                const tasksLength = userData?.projects.find(
                    (projectData: UserProject) => projectData.id === project
                )?.tasks.length;

                const newTask = {
                    ...newTaskDetails,
                    created: new Date().toDateString(),
                    status: "new",
                    id: uuidv4(),
                    completed: 0,
                    number: tasksLength ? tasksLength + 1 : 1,
                };

                const docSnap = await getDoc(getUserRef());
                const projects = docSnap.data()?.projects;
                const selected = projects.find(
                    (project: UserProject) => project.id === id
                );
                selected.tasks.push(newTask);
                const filtered = projects.filter(
                    (project: UserProject) => project.id !== id
                );
                await setDoc(getUserRef(), {
                    projects: [selected, ...filtered],
                });
                toast({ status: 'success', title: 'New task is added!' });
                setLoading(false);
                fetchUserData();
                handleCloseNewTask();
                setNewTaskDetails({
                    heading: "",
                    description: "",
                    estimation: 0,
                });
            } catch (error) {
                toast({ status: 'error', title: 'Error occurred' });
                console.log(error);
                setLoading(false);
            }
        }
    }

    async function quickAdd() {
        if (!quickHeading.trim() || !Number(quickEstimation)) {
            toast({ status: 'error', title: 'Enter heading and estimation' });
            return;
        }
        const id = userData?.projects.find((p: UserProject) => p.id === project)?.id;
        if (!id) return;
        try {
            setLoading(true);
            const tasksLength = userData?.projects.find((p: UserProject) => p.id === project)?.tasks.length;
            const newTask = {
                heading: quickHeading.trim(),
                description: '',
                estimation: Number(quickEstimation),
                created: new Date().toDateString(),
                status: 'new',
                id: uuidv4(),
                completed: 0,
                number: tasksLength ? tasksLength + 1 : 1,
            } as unknown as UserTask;
            const docSnap = await getDoc(getUserRef());
            const projects = docSnap.data()?.projects;
            const selected = projects.find((p: UserProject) => p.id === id);
            selected.tasks.push(newTask);
            const filtered = projects.filter((p: UserProject) => p.id !== id);
            await setDoc(getUserRef(), { projects: [selected, ...filtered] });
            toast({ status: 'success', title: 'Task added' });
            setQuickHeading('');
            setQuickEstimation('');
            setLoading(false);
            fetchUserData();
        } catch (error) {
            toast({ status: 'error', title: 'Error occurred' });
            setLoading(false);
        }
    }

    async function deleteProject() {
        const id = userData?.projects.find(
            (projectData: UserProject) => projectData.id === project
        )?.id;
        if (!id) return;
        try {
            setLoading(true);
            const docSnap = await getDoc(getUserRef());
            const projects = docSnap.data()?.projects;
            const filtered = projects.filter(
                (project: UserProject) => project.id !== id
            );
            await setDoc(getUserRef(), {
                projects: [...filtered],
            });
            fetchUserData();
            handleCloseDeleteModal();
            setProject("");
            setLoading(false);
            toast({ status: 'success', title: 'Project deleted' });
        } catch (error) {
            toast({ status: 'error', title: 'Error occurred' });
            console.log(error);
            setLoading(false);
        }
    }

    async function fetchUserData() {
        try {
            const docSnap = await getDoc(getUserRef());
            if (docSnap) {
                setUserData(docSnap.data() as UserData);
            }
        } catch (error) {
            toast({ status: 'error', title: 'Error occurred' });
        }
    }

    async function editProject() {
        if (!newProjectName || !userStory) {
            toast({ status: 'error', title: 'Please fill all project details' });
            return;
        }

        try {
            setLoading(true);
            const docSnap = await getDoc(getUserRef());
            const projects = docSnap.data()?.projects;
            const editedProject = projects.find(
                (projectData: UserProject) => projectData.id === project
            );
            const projectDetails = {
                ...editedProject,
                name: newProjectName,
                userStory,
            };
            const filteredProjects = projects.filter(
                (projectData: UserProject) => projectData.id !== project
            );
            await setDoc(getUserRef(), {
                projects: [...filteredProjects, { ...projectDetails }],
            });
            fetchUserData();
            setNewProjectName("");
            setUserStory("");
            setEditProjectClicked(false);
            setLoading(false);
            toast({ status: 'success', title: 'Project is saved!' });
        } catch (error) {
            toast({ status: 'error', title: 'Error occurred' });
            console.error(error);
            setLoading(false);
        }
    }

    async function addNewProject() {
        if (!newProjectName || !userStory) {
            toast({ status: 'error', title: 'Please fill all project details' });
            return;
        }
        const newProject = {
            id: uuidv4(),
            name: newProjectName,
            tasks: [],
            userStory,
        };
        setNewProjectName("");
        setUserStory("");
        setNewProjectClicked(false);

        try {
            setLoading(true);
            const oldProjects = userData.projects ?? [];
            await setDoc(getUserRef(), {
                projects: [...oldProjects, { ...newProject }],
            });
            fetchUserData();
            setProject("");
            toast({ status: 'success', title: 'New project is added' });
            setLoading(false);
        } catch (error) {
            toast({ status: 'error', title: 'Error occurred' });
            console.error(error);
            setLoading(false);
        }
    }

    async function handleStatusChangeUp(e: any, task: UserTask) {
        e.stopPropagation();

        const taskDetails = task;

        if (taskDetails.status === "new") {
            taskDetails.status = "active";
        } else taskDetails.status = "resolved";

        try {
            const docSnap = await getDoc(getUserRef());
            const projects = docSnap.data()?.projects;
            let selected = projects.find(
                (projectData: UserProject) => projectData.id === project
            );
            selected.tasks = selected.tasks.filter(
                (taskData: UserTask) => taskData.id !== task.id
            );
            selected.tasks.push(taskDetails);
            let filtered = projects.filter(
                (projectData: UserProject) => projectData.id !== project
            );

            await setDoc(getUserRef(), {
                projects: [selected, ...filtered],
            });
            toast({ status: 'success', title: 'Status changed!' });
            fetchUserData();
        } catch (error) {
            toast({ status: 'error', title: 'Error occurred' });
            console.log(error);
        }
    }

    async function handleStatusChangeDown(e: any, task: UserTask) {
        e.stopPropagation();
        const taskDetails = task;

        if (taskDetails.status === "active") {
            taskDetails.status = "new";
        } else taskDetails.status = "active";

        try {
            const docSnap = await getDoc(getUserRef());
            const projects = docSnap.data()?.projects;
            let selected = projects.find(
                (projectData: UserProject) => projectData.id === project
            );
            selected.tasks = selected.tasks.filter(
                (taskData: UserTask) => taskData.id !== task.id
            );
            selected.tasks.push(taskDetails);
            let filtered = projects.filter(
                (projectData: UserProject) => projectData.id !== project
            );

            await setDoc(getUserRef(), {
                projects: [selected, ...filtered],
            });
            toast({ status: 'success', title: 'Status changed!' });
            fetchUserData();
        } catch (error) {
            toast({ status: 'error', title: 'Error occurred' });
            console.log(error);
        }
    }

    // helpers

    function findSelectedProject() {
        return userData?.projects?.find((p: UserProject) => p.id === project)
    }

    function getTaskById(id: string) {
        const p = findSelectedProject();
        if (!p) return null;
        return p.tasks.find((t: UserTask) => String((t as any).id) === id) || null;
    }

    function onDragEnd(event: any) {
        const { active, over } = event;
        if (!over) return;
        const activeId = String(active.id).replace(/^task:/, '');
        const overId = String(over.id);
        let targetStatus: 'new' | 'active' | 'resolved';
        if (overId.startsWith('column:')) {
            targetStatus = overId.split(':')[1] as any;
        } else {
            const targetTask = getTaskById(overId.replace(/^task:/, ''));
            targetStatus = (targetTask?.status as any) ?? 'new';
        }
        reorderOrMove(activeId, targetStatus, overId);
    }

    async function reorderOrMove(activeId: string, targetStatus: 'new'|'active'|'resolved', overId: string) {
        const p = findSelectedProject();
        if (!p) return;
        const tasks = [...p.tasks];
        const fromIndex = tasks.findIndex(t => String((t as any).id) === activeId);
        if (fromIndex < 0) return;
        const moving: any = { ...(tasks[fromIndex] as any) };
        const fromStatus = moving.status as 'new'|'active'|'resolved';
        tasks.splice(fromIndex, 1);
        moving.status = targetStatus;
        // Build list of indices with target status
        const targetIndices = tasks.map((t, idx) => ({t, idx})).filter(x => (x.t as any).status === targetStatus).map(x => x.idx);
        let insertAt = targetIndices.length ? targetIndices[targetIndices.length-1] + 1 : tasks.length;
        if (overId.startsWith('task:')) {
            const targetId = overId.replace('task:', '');
            const overIndex = tasks.findIndex(t => String((t as any).id) === targetId);
            if (overIndex >= 0) insertAt = overIndex;
        }
        tasks.splice(insertAt, 0, moving);
        tasks.forEach((t:any, i) => { t.number = i+1; });
        try {
            const docSnap = await getDoc(getUserRef());
            const projects = docSnap.data()?.projects;
            const sel = projects.find((pp: UserProject) => pp.id === project);
            sel.tasks = tasks;
            const filtered = projects.filter((pp: UserProject) => pp.id !== project);
            await setDoc(getUserRef(), { projects: [sel, ...filtered] });
            fetchUserData();
            toast({ status: 'success', title: fromStatus === targetStatus ? 'Reordered' : 'Moved' });
        } catch {
            toast({ status: 'error', title: 'Reorder failed' });
        }
    }

    function generateProjectSummary(projectId: string) {
        const singleProject = userData.projects?.find(
            (projectData: UserProject) => projectData.id === projectId
        );
        const totalTasks = singleProject?.tasks.length ?? 0;
        const totalEstimation =
            singleProject?.tasks.reduce(
                (acc: number, current: UserTask) => acc + current.estimation,
                0
            ) ?? 0;
        const tasksCompleted =
            singleProject?.tasks.filter(
                (task: UserTask) => task.status === "resolved"
            ).length ?? 0;
        let estimationAcc = 0;
        const completedTime = singleProject?.tasks.filter(
            (task: UserTask) => task.completed > 0
        );
        completedTime?.forEach((task: UserTask) => {
            estimationAcc += task.estimation - task.completed;
        });
        setProjectSummary({
            totalTasks,
            totalEstimation,
            tasksCompleted,
            estimationAcc,
        });
    }

    function getTaskEstimationAcc(task: UserTask) {
        const estimationAcc = task.estimation - task.completed;
        if (task.completed) {
            return estimationAcc > 0 ? (
                <span className="acc-plus">{`(+${estimationAcc})`}</span>
            ) : estimationAcc === 0 ? (
                <span className="acc-zero">{`(${estimationAcc})`}</span>
            ) : (
                <span className="acc-minus">{`(${estimationAcc})`}</span>
            );
        }
        return "";
    }

    function taskHeadingCrop(heading: string) {
        return heading.length > 30 ? heading.slice(0, 30).concat("...") : heading;
    }

    function getUserRef() {
        const userRef = doc(db, "users", user.uid);
        return userRef;
    }

    function getUsersProjectName() {
        return userData?.projects?.find(
            (projectData: UserProject) => projectData.id === project
        )?.name;
    }

    function getUsersProjectStory() {
        return userData?.projects?.find(
            (projectData: UserProject) => projectData.id === project
        )?.userStory;
    }

    // click event handlers

    const handleProjectClick = (e: any) => {
        if (
            (e.target.className !== "new-project-container" && newProjectClicked) ||
            userStory ||
            newProjectName
        )
            return;
        setNewProjectClicked((clicked: boolean) => !clicked);
    };

    const handleEditProjectClick = (e: any) => {
        if (
            (e.target.className !== "new-project-container" && editProjectClicked) ||
            userStory ||
            newProjectName
        )
            return;
        setEditProjectClicked((clicked: boolean) => !clicked);
    };

    const handleCloseEditProjectClick = (e: any) => {
        setUserStory("");
        setNewProjectName("");
        setEditProjectClicked((clicked: boolean) => !clicked);
    };

    const handleDeleteModalClick = (e: any) => {
        if (e.target.className !== "delete-project-container" && deleteModalClicked)
            return;
        setDeleteModalClicked((clicked: boolean) => !clicked);
    };

    const handleNewTaskClick = (e: any) => {
        if (
            (e.target.className !== "new-task-container" && newTaskClicked) ||
            newTaskDetails.description ||
            newTaskDetails.heading
        )
            return;
        setNewTaskClicked((clicked: boolean) => !clicked);
    };

    const handleCloseNewTask = () => {
        setNewTaskDetails({
            heading: "",
            description: "",
            estimation: 0,
        });
        setNewTaskClicked((clicked: boolean) => !clicked);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalClicked((clicked: boolean) => !clicked);
    };

    const handleCloseProjectClick = (e: any) => {
        setUserStory("");
        setNewProjectName("");
        setNewProjectClicked((clicked: boolean) => !clicked);
    };

const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setProject(event.target.value as string);
    };

    const handleMenuClick = () => {
        setMenuClicked((clicked: boolean) => !clicked);
    };

    const handleUserClick = (e?: any) => {
        if (e && e.target.className !== "delete-project-container" && userClicked)
            return;
        setUserClicked((clicked: boolean) => !clicked);
    };

    const handleUserCloseClick = () => {
        setUserClicked((clicked: boolean) => !clicked);
    };

    const handleEditTask = (task: UserTask, e: any) => {
        router.push(`/task`);
        handleSelectedTask(task);
    };

    // user state handlers

    const handleNewTaskDetails = (value: string, property: string) => {
        switch (property) {
            case "heading":
                setNewTaskDetails((oldState: NewTask) => {
                    return { ...oldState, heading: value };
                });
                return;
            case "description":
                setNewTaskDetails((oldState: NewTask) => {
                    return { ...oldState, description: value };
                });
                return;
            case "estimation":
                setNewTaskDetails((oldState: NewTask) => {
                    return { ...oldState, estimation: Number(value) };
                });
                return;
            default:
                break;
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };

return (
        <Box className="dashboard-container-grid" ref={ref} id={newProjectClicked ? "cover" : ""}>
{userClicked && (
                <Modal isOpen={userClicked} onClose={handleUserCloseClick} isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Are you sure you want to logout?</ModalHeader>
                        <ModalCloseButton />
                        <ModalFooter>
                            <Stack direction="row">
                                <Button colorScheme="brand" onClick={handleLogout}>logout</Button>
                                <Button variant="ghost" onClick={handleUserCloseClick}>return</Button>
                            </Stack>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
{newProjectClicked && (
<Modal isOpen={newProjectClicked} onClose={() => handleCloseProjectClick({})} size="lg" isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Pick a name for the project</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack>
                                <FormControl isRequired>
                                    <FormLabel>Project name</FormLabel>
                                    <Input placeholder="e.g. web shop app" onChange={(e) => setNewProjectName(e.target.value)} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>User story</FormLabel>
                                    <Textarea rows={8} placeholder="e.g. ..." onChange={(e) => setUserStory(e.target.value)} />
                                </FormControl>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Stack direction="row">
                                <Button colorScheme="brand" onClick={addNewProject}>create project</Button>
                                <Button variant="ghost" onClick={handleCloseProjectClick}>return</Button>
                            </Stack>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
{editProjectClicked && (
<Modal isOpen={editProjectClicked} onClose={() => handleCloseEditProjectClick({})} size="lg" isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Edit project</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack>
                                <FormControl isRequired>
                                    <FormLabel>Project name</FormLabel>
                                    <Input defaultValue={getUsersProjectName()} onChange={(e) => setNewProjectName(e.target.value)} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>User story</FormLabel>
                                    <Textarea rows={8} defaultValue={getUsersProjectStory() ?? ""} onChange={(e) => setUserStory(e.target.value)} />
                                </FormControl>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Stack direction="row">
                                <Button colorScheme="brand" onClick={editProject}>save project</Button>
                                <Button variant="ghost" onClick={handleCloseEditProjectClick}>return</Button>
                            </Stack>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
{deleteModalClicked && (
                <Modal isOpen={deleteModalClicked} onClose={handleCloseDeleteModal} isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{`Are you sure you want to permanently delete ${getUsersProjectName()}?`}</ModalHeader>
                        <ModalCloseButton />
                        <ModalFooter>
                            <Stack direction="row">
                                <Button colorScheme="red" onClick={deleteProject}>delete project</Button>
                                <Button variant="ghost" onClick={handleCloseDeleteModal}>return</Button>
                            </Stack>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
{newTaskClicked && (
                <Modal isOpen={newTaskClicked} onClose={handleCloseNewTask} size="lg" isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Fill task details</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <Stack>
                                <FormControl isRequired>
                                    <FormLabel>Task heading</FormLabel>
                                    <Input placeholder="e.g. create ui navbar" onChange={(e) => handleNewTaskDetails(e.target.value, "heading")} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Description</FormLabel>
                                    <Textarea rows={8} placeholder="..." onChange={(e) => handleNewTaskDetails(e.target.value, "description")} />
                                </FormControl>
                                <HStack>
                                    <FormLabel m={0}>Estimation:</FormLabel>
                                    <Input type="number" min={1} onChange={(e) => handleNewTaskDetails(e.target.value, "estimation")} width="120px" />
                                    <Box as="span">hours</Box>
                                </HStack>
                            </Stack>
                        </ModalBody>
                        <ModalFooter>
                            <Stack direction="row">
                                <Button colorScheme="brand" onClick={addNewTask}>save task</Button>
                                <Button variant="ghost" onClick={handleCloseNewTask}>return</Button>
                            </Stack>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
<Box className="menu-icon">
                {menuClicked ? (
                    <IconButton aria-label="close menu" icon={<MdArrowUpward />} onClick={handleMenuClick} />
                ) : (
                    <IconButton aria-label="open menu" icon={<MdMenu />} onClick={handleMenuClick} />
                )}
            </Box>

{menuClicked && (
                <Box className="topbar">
                    <Button colorScheme="brand" className="dashboard-button top-button" onClick={handleProjectClick}>new project</Button>
                    <Button colorScheme="brand" className="dashboard-button top-button" onClick={handleEditProjectClick}>edit project</Button>
                    <Button colorScheme="red" className="dashboard-button top-button" onClick={handleDeleteModalClick}>delete project</Button>
                    <Button colorScheme="brand" className="dashboard-button top-button" onClick={handleNewTaskClick}>new task</Button>
                </Box>
            )}
<Box className="dashboard-left-wrapper">
                <Button colorScheme="brand" className="dashboard-button" onClick={handleProjectClick}>new project</Button>
                <Button colorScheme="brand" className="dashboard-button" onClick={handleEditProjectClick}>edit project</Button>
                <Button colorScheme="red" className="dashboard-button" onClick={handleDeleteModalClick}>delete project</Button>
                <Button colorScheme="brand" className="dashboard-button" onClick={handleNewTaskClick}>new task</Button>
                <Box className="summary-container">
                    <Heading size="sm" mb={3}>PROJECT SUMMARY</Heading>
                    <HStack spacing={2} width="85%" justifyContent="space-between">
                        <Text>Total tasks:</Text>
                        <Badge colorScheme="brand">{projectSummary?.totalTasks}</Badge>
                    </HStack>
                    <HStack spacing={2} width="85%" justifyContent="space-between">
                        <Text>Total estimation:</Text>
                        <Badge>{projectSummary?.totalEstimation} h</Badge>
                    </HStack>
                    <HStack spacing={2} width="85%" justifyContent="space-between">
                        <Text>Tasks completed:</Text>
                        <HStack>
                            <Badge colorScheme="green">{projectSummary?.tasksCompleted}</Badge>
                            <Text>/</Text>
                            <Badge>{projectSummary?.totalTasks}</Badge>
                        </HStack>
                    </HStack>
                    <HStack spacing={2} width="85%" justifyContent="space-between">
                        <Text>Estimation accuracy</Text>
                        <Badge colorScheme={projectSummary?.estimationAcc > 0 ? 'red' : 'green'}>
                            {projectSummary?.estimationAcc ? (projectSummary.estimationAcc > 0 ? `+${projectSummary.estimationAcc} h` : `${projectSummary.estimationAcc} h`) : '-'}
                        </Badge>
                    </HStack>
                </Box>
            </Box>
            <div className="dashboard-central-wrapper">
<Box className="central-input">
                    <Box w={250}>
                        <FormControl>
                            <FormLabel>Select project</FormLabel>
                            <Select value={project} onChange={handleChange} placeholder={userData?.projects?.length ? undefined : 'project list is empty'}>
                                {userData?.projects?.map((p: UserProject) => (
                                    <option value={p.id} key={p.id}>{p.name}</option>
                                ))}
                            </Select>
                        </FormControl>
                        <Stopwatch />
                    </Box>
                    {/* Quick add */}
                    <HStack mt={4} gap={2}>
                        <Input placeholder="Quick task heading" onChange={e => setQuickHeading(e.target.value)} />
                        <Input placeholder="Est." type="number" width="90px" onChange={e => setQuickEstimation(e.target.value)} />
                        <Button size="sm" onClick={quickAdd} colorScheme="brand">Add</Button>
                    </HStack>
                    <Tooltip label={<p className="tooltip-text">{getUsersProjectStory()}</p>} openDelay={200}>
                        <Box as={MdInfo} className="tooltip-icon" />
                    </Tooltip>
                </Box>
<Box className="central-board">
                    <Image
                        src={dashboardImg}
                        width={containerWidth ? containerWidth * 0.75 : 1500}
                        height={800}
                        alt=""
                        loading="lazy"
></Image>
                    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
                    {!loading ? (
<div className="new-container task" id="column:new" style={{paddingLeft:'3%'}}>
                        <SortableContext items={(findSelectedProject()?.tasks||[]).filter((t: UserTask)=>t.status==='new').map((t:any)=>`task:${t.id}`)} strategy={verticalListSortingStrategy}>
                            <h1>New Tasks</h1>
                            {userData?.projects
                                ?.find((projectData: UserProject) => projectData.id === project)
                                ?.tasks.filter((task: UserTask) => task.status === "new")
                                .map((task: UserTask) => {
                                    return (
                                        <SortableItem id={`task:${(task as any).id}`}>
<div
                                            className="new-task-card status-new"
                                            onClick={(e) => handleEditTask(task, e)}
                                            key={task.id}
                                        >
                                            <h3>
                                                #{task.number} {taskHeadingCrop(task.heading)}
                                            </h3>
<h3 className="estimated">
                                                Estimated {task.estimation}h{" "}
                                                {getTaskEstimationAcc(task)}
                                            </h3>
                                        </div>
                                        </SortableItem>
                                    );
                                })}
                        </SortableContext>
                        </div>
                    ) : (
                        <Stack className="new-container task" gap={4}>
                            <Skeleton height="24px" width="60%" />
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} height="90px" borderRadius="md" />
                            ))}
                        </Stack>
                    )}
                    {!loading ? (
<div className="active-container task" id="column:active">
                        <SortableContext items={(findSelectedProject()?.tasks||[]).filter((t: UserTask)=>t.status==='active').map((t:any)=>`task:${t.id}`)} strategy={verticalListSortingStrategy}>
                            <h1>Active Tasks</h1>
                            {userData?.projects
                                ?.find((projectData: UserProject) => projectData.id === project)
                                ?.tasks.filter((task: UserTask) => task.status === "active")
                                .map((task: UserTask) => {
                                    return (
<SortableItem id={`task:${(task as any).id}`}>
<div
                                            className="new-task-card status-active"
                                            onClick={(e) => handleEditTask(task, e)}
                                            key={task.id}
                                        >
                                            <h3>
                                                #{task.number} {taskHeadingCrop(task.heading)}
                                            </h3>
<h3 className="estimated">
                                                Estimated {task.estimation}h{" "}
                                                {getTaskEstimationAcc(task)}
                                            </h3>
                                        </div>
                                        </SortableItem>
                                    );
                                })}
                        </SortableContext>
                        </div>
                    ) : (
                        <Stack className="active-container task" gap={4}>
                            <Skeleton height="24px" width="60%" />
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} height="90px" borderRadius="md" />
                            ))}
                        </Stack>
                    )}
                    {!loading ? (
<div className="resolved-container task" id="column:resolved">
                        <SortableContext items={(findSelectedProject()?.tasks||[]).filter((t: UserTask)=>t.status==='resolved').map((t:any)=>`task:${t.id}`)} strategy={verticalListSortingStrategy}>
                            <h1>Resolved Tasks</h1>
                            {userData?.projects
                                ?.find((projectData: UserProject) => projectData.id === project)
                                ?.tasks.filter((task: UserTask) => task.status === "resolved")
                                .map((task: UserTask) => {
                                    return (
<SortableItem id={`task:${(task as any).id}`}>
<div
                                            className="new-task-card status-resolved"
                                            onClick={(e) => handleEditTask(task, e)}
                                            key={task.id}
                                        >
                                            <h3>
                                                #{task.number} {taskHeadingCrop(task.heading)}
                                            </h3>
<h3 className="completed">
                                                Completed in {task.completed}h{" "}
                                                {getTaskEstimationAcc(task)}
                                            </h3>
                                        </div>
                                        </SortableItem>
                                    );
                                })}
                        </SortableContext>
                        </div>
                    ) : (
                        <Stack className="resolved-container task" gap={4}>
                            <Skeleton height="24px" width="60%" />
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} height="90px" borderRadius="md" />
                            ))}
                        </Stack>
                    )}
</DndContext>
</Box>
            </div>
<Box className="user-container">
                <IconButton aria-label="logout" icon={<MdLogout />} onClick={handleLogoutDash} />
            </Box>
        </Box>
    );
}
