import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import dashboardImg from "../../../public/dashboardImg.png";
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    TextField,
    Tooltip,
} from "@mui/material";
import Zoom from "@mui/material/Zoom";
import MenuIcon from "@mui/icons-material/Menu";
import NorthIcon from "@mui/icons-material/North";
import RedoIcon from "@mui/icons-material/Redo";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import { UserAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/components/firebase";
import CircularIndeterminate from "@/components/Loader/Loader";

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
    const [projectSummary, setProjectSummary] = useState<ProjectSummary>({
        totalTasks: 0,
        totalEstimation: 0,
        tasksCompleted: 0,
        estimationAcc: 0,
    });

    const router = useRouter();

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

    // api calls

    async function addNewTask() {
        if (
            !newTaskDetails.description ||
            !newTaskDetails.heading ||
            !newTaskDetails.estimation
        ) {
            toast.error("Please fill all task details", { position: "top-center" });
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
                toast.success("New task is added!", { position: "top-center" });
                setLoading(false);
                fetchUserData();
                handleCloseNewTask();
                setNewTaskDetails({
                    heading: "",
                    description: "",
                    estimation: 0,
                });
            } catch (error) {
                toast.error("Error occurred", { position: "top-center" });
                console.log(error);
                setLoading(false);
            }
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
            toast.success("Project deleted", { position: "top-center" });
        } catch (error) {
            toast.error("Error occurred", { position: "top-center" });
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
            toast.error("Error occurred", { position: "top-center" });
        }
    }

    async function editProject() {
        if (!newProjectName || !userStory) {
            toast.error("Please fill all project details", {
                position: "top-center",
            });
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
            toast.success("Project is saved!", { position: "top-center" });
        } catch (error) {
            toast.error("Error occurred", { position: "top-center" });
            console.error(error);
            setLoading(false);
        }
    }

    async function addNewProject() {
        if (!newProjectName || !userStory) {
            toast.error("Please fill all project details", {
                position: "top-center",
            });
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
            toast.success("New project is added", { position: "top-center" });
            setLoading(false);
        } catch (error) {
            toast.error("Error occurred", { position: "top-center" });
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
            toast.success("Status changed!", { position: "top-center" });
            fetchUserData();
        } catch (error) {
            toast.error("Error occurred", { position: "top-center" });
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
            toast.success("Status changed!", { position: "top-center" });
            fetchUserData();
        } catch (error) {
            toast.error("Error occurred", { position: "top-center" });
            console.log(error);
        }
    }

    // helpers

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

    const handleChange = (event: SelectChangeEvent) => {
        setProject(event.target.value as string);
    };

    const handleMenuClick = () => {
        setMenuClicked((clicked: boolean) => !clicked);
    };

    const handleUserClick = (e: any) => {
        if (e.target.className !== "delete-project-container" && userClicked)
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
        <div
            className="dashboard-container-grid"
            ref={ref}
            id={newProjectClicked ? "cover" : ""}
        >
            {userClicked && (
                <div
                    className="delete-project-container"
                    onClick={(e) => handleUserClick(e)}
                >
                    <div className="delete-project-wrapper">
                        <h3>{`Are you sure you want to logout?`}</h3>
                        <Box
                            component="form"
                            sx={{
                                "& > :not(style)": {
                                    width: "100%",
                                    display: "flex",
                                },
                            }}
                            noValidate
                            autoComplete="off"
                        >
                            <Stack spacing={2} direction="row">
                                <Button
                                    variant="contained"
                                    className="delete-confirm-button"
                                    onClick={handleLogout}
                                >
                                    logout
                                </Button>
                                <Button
                                    variant="contained"
                                    className="delete-back-button"
                                    onClick={handleUserCloseClick}
                                >
                                    return
                                </Button>
                            </Stack>
                        </Box>
                    </div>
                    <CloseIcon className="close-icon" onClick={handleUserCloseClick} />
                </div>
            )}
            {newProjectClicked && (
                <div className="new-project-container" onClick={handleProjectClick}>
                    <div className="new-project-wrapper">
                        <h3>Pick a name for the project</h3>
                        <Box
                            component="form"
                            sx={{
                                "& > :not(style)": {
                                    width: "100%",
                                    display: "flex",
                                },
                            }}
                            noValidate
                            autoComplete="off"
                        >
                            <TextField
                                id="outlined-basic4"
                                variant="outlined"
                                label="Project name"
                                required
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="e.g. web shop app"
                                sx={{
                                    "& > :not(style)": {
                                        marginBottom: "10px",
                                    },
                                }}
                            />
                            <TextField
                                id="standard-multiline-flexible"
                                className="project-user-story"
                                variant="outlined"
                                label="User story"
                                required
                                multiline
                                onChange={(e) => setUserStory(e.target.value)}
                                rows={12}
                                placeholder="e.g. I want my web shop to have browsing through a variety of products conveniently categorized to find what I need quickly and easily. When I find a product I'm interested in, I want to see detailed information about it, including images, descriptions, and prices. If I'm unsure about a product, I want to be able to read reviews and see ratings from other users to help me make a decision."
                                sx={{
                                    "& > :not(style)": {
                                        marginBottom: "10px",
                                    },
                                }}
                            />
                            <Stack spacing={2} direction="row">
                                <Button
                                    variant="contained"
                                    className="login-button"
                                    onClick={addNewProject}
                                >
                                    create project
                                </Button>
                                <Button
                                    variant="contained"
                                    className="login-button"
                                    onClick={handleCloseProjectClick}
                                >
                                    return
                                </Button>
                            </Stack>
                        </Box>
                    </div>
                    <CloseIcon className="close-icon" onClick={handleCloseProjectClick} />
                </div>
            )}
            {editProjectClicked && (
                <div className="new-project-container" onClick={handleEditProjectClick}>
                    <div className="new-project-wrapper">
                        <h3>Pick a name for the project</h3>
                        <Box
                            component="form"
                            sx={{
                                "& > :not(style)": {
                                    width: "100%",
                                    display: "flex",
                                },
                            }}
                            noValidate
                            autoComplete="off"
                        >
                            <TextField
                                id="outlined-basic4"
                                variant="outlined"
                                label="Project name"
                                required
                                defaultValue={getUsersProjectName()}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="e.g. web shop app"
                                sx={{
                                    "& > :not(style)": {
                                        marginBottom: "10px",
                                    },
                                }}
                            />
                            <TextField
                                id="standard-multiline-flexible"
                                className="project-user-story"
                                variant="outlined"
                                label="User story"
                                required
                                multiline
                                defaultValue={getUsersProjectStory() ?? "djoka"}
                                onChange={(e) => setUserStory(e.target.value)}
                                rows={12}
                                placeholder="e.g. I want my web shop to have browsing through a variety of products conveniently categorized to find what I need quickly and easily. When I find a product I'm interested in, I want to see detailed information about it, including images, descriptions, and prices. If I'm unsure about a product, I want to be able to read reviews and see ratings from other users to help me make a decision."
                                sx={{
                                    "& > :not(style)": {
                                        marginBottom: "10px",
                                    },
                                }}
                            />
                            <Stack spacing={2} direction="row">
                                <Button
                                    variant="contained"
                                    className="login-button"
                                    onClick={editProject}
                                >
                                    save project
                                </Button>
                                <Button
                                    variant="contained"
                                    className="login-button"
                                    onClick={handleCloseEditProjectClick}
                                >
                                    return
                                </Button>
                            </Stack>
                        </Box>
                    </div>
                    <CloseIcon className="close-icon" onClick={handleCloseProjectClick} />
                </div>
            )}
            {deleteModalClicked && (
                <div
                    className="delete-project-container"
                    onClick={handleDeleteModalClick}
                >
                    <div className="delete-project-wrapper">
                        <h3>{`Are you sure you want to permanently delete ${getUsersProjectName()}?`}</h3>
                        <Box
                            component="form"
                            sx={{
                                "& > :not(style)": {
                                    width: "100%",
                                    display: "flex",
                                },
                            }}
                            noValidate
                            autoComplete="off"
                        >
                            <Stack spacing={2} direction="row">
                                <Button
                                    variant="contained"
                                    className="delete-confirm-button"
                                    onClick={deleteProject}
                                >
                                    delete project
                                </Button>
                                <Button
                                    variant="contained"
                                    className="delete-back-button"
                                    onClick={handleCloseDeleteModal}
                                >
                                    return
                                </Button>
                            </Stack>
                        </Box>
                    </div>
                    <CloseIcon className="close-icon" onClick={handleCloseDeleteModal} />
                </div>
            )}
            {newTaskClicked && (
                <div className="new-task-container" onClick={handleNewTaskClick}>
                    <div className="new-task-wrapper">
                        <h3>Fill task details</h3>
                        <Box
                            component="form"
                            sx={{
                                "& > :not(style)": {
                                    width: "100%",
                                    display: "flex",
                                },
                            }}
                            noValidate
                            autoComplete="off"
                        >
                            <TextField
                                id="outlined-basic12"
                                variant="outlined"
                                label="Task heading"
                                required
                                onChange={(e) =>
                                    handleNewTaskDetails(e.target.value, "heading")
                                }
                                placeholder="e.g. create ui navbar"
                                sx={{
                                    "& > :not(style)": {
                                        marginBottom: "10px",
                                    },
                                }}
                            />
                            <TextField
                                id="standard-multiline-flexible"
                                variant="outlined"
                                label="Description"
                                required
                                multiline
                                rows={10}
                                onChange={(e) =>
                                    handleNewTaskDetails(e.target.value, "description")
                                }
                                placeholder="e.g. navbar should have five different icons connected to page routing"
                                sx={{
                                    "& > :not(style)": {
                                        marginBottom: "10px",
                                    },
                                }}
                            />
                            <span className="estimated-wrapper">
                                <p>Estimation:</p>
                                <input
                                    type="number"
                                    className="estimation-input"
                                    min={1}
                                    onChange={(e) =>
                                        handleNewTaskDetails(e.target.value, "estimation")
                                    }
                                />
                                <p>hours</p>
                            </span>
                            <Stack spacing={2} direction="row">
                                <Button
                                    variant="contained"
                                    className="delete-confirm-button"
                                    onClick={addNewTask}
                                >
                                    save task
                                </Button>
                                <Button
                                    variant="contained"
                                    className="delete-back-button"
                                    onClick={handleCloseNewTask}
                                >
                                    return
                                </Button>
                            </Stack>
                        </Box>
                    </div>
                    <CloseIcon className="close-icon" onClick={handleCloseNewTask} />
                </div>
            )}
            <div className="menu-icon">
                {menuClicked ? (
                    <NorthIcon
                        className="icon bring-to-front"
                        onClick={handleMenuClick}
                    />
                ) : (
                    <MenuIcon className="icon" onClick={handleMenuClick} />
                )}
            </div>

            {menuClicked && (
                <div className="topbar">
                    <Button
                        variant="contained"
                        className="dashboard-button top-button"
                        onClick={handleProjectClick}
                    >
                        new project
                    </Button>
                    <Button
                        variant="contained"
                        className="dashboard-button top-button"
                        onClick={handleEditProjectClick}
                    >
                        edit project
                    </Button>
                    <Button
                        variant="contained"
                        className="dashboard-button top-button"
                        onClick={handleDeleteModalClick}
                    >
                        delete project
                    </Button>
                    <Button
                        variant="contained"
                        className="dashboard-button top-button"
                        onClick={handleNewTaskClick}
                    >
                        new task
                    </Button>
                </div>
            )}
            <div className="dashboard-left-wrapper">
                <Button
                    variant="contained"
                    className="dashboard-button"
                    onClick={handleProjectClick}
                >
                    new project
                </Button>
                <Button
                    variant="contained"
                    className="dashboard-button"
                    onClick={handleEditProjectClick}
                >
                    edit project
                </Button>
                <Button
                    variant="contained"
                    className="dashboard-button"
                    onClick={handleDeleteModalClick}
                >
                    delete project
                </Button>
                <Button
                    variant="contained"
                    className="dashboard-button"
                    onClick={handleNewTaskClick}
                >
                    new task
                </Button>
                <div className="summary-container">
                    <h3>PROJECT SUMMARY</h3>
                    <Stack
                        spacing={2}
                        direction="row"
                        width="85%"
                        justifyContent="space-between"
                    >
                        <p>Total tasks:</p>
                        <p>
                            <b>{projectSummary?.totalTasks}</b>
                        </p>
                    </Stack>
                    <Stack
                        spacing={2}
                        direction="row"
                        width="85%"
                        justifyContent="space-between"
                    >
                        <p>Total estimation:</p>
                        <p>
                            <b>{projectSummary?.totalEstimation} h</b>
                        </p>
                    </Stack>
                    <Stack
                        spacing={2}
                        direction="row"
                        width="85%"
                        justifyContent="space-between"
                    >
                        <p>Tasks completed:</p>
                        <p>
                            <span style={{ color: "green" }}>
                                <b>{projectSummary?.tasksCompleted}</b>
                            </span>{" "}
                            / <b>{projectSummary?.totalTasks}</b>
                        </p>
                    </Stack>
                    <Stack
                        spacing={2}
                        direction="row"
                        width="85%"
                        justifyContent="space-between"
                    >
                        <p>Estimation accuracy</p>
                        <p
                            className={
                                projectSummary?.estimationAcc > 0 ? "acc-plus" : "acc-minus"
                            }
                        >
                            {projectSummary?.estimationAcc
                                ? `${projectSummary?.estimationAcc > 0
                                    ? `+${projectSummary.estimationAcc} h`
                                    : `${projectSummary.estimationAcc} h`
                                }`
                                : "-"}
                        </p>
                    </Stack>
                </div>
            </div>
            <div className="dashboard-central-wrapper">
                <div className="central-input">
                    <Box sx={{ width: 250 }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">
                                Select project
                            </InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={project}
                                label="Select project"
                                onChange={handleChange}
                            >
                                {userData?.projects?.length > 0 ? (
                                    userData.projects?.map((project: UserProject) => {
                                        return (
                                            <MenuItem value={project.id} key={project.id}>
                                                {project.name}
                                            </MenuItem>
                                        );
                                    })
                                ) : (
                                    <p
                                        style={{
                                            padding: "10px",
                                            color: "gray",
                                            cursor: "not-allowed",
                                        }}
                                    >
                                        project list is empty
                                    </p>
                                )}
                            </Select>
                        </FormControl>
                    </Box>
                    <Tooltip
                        title={<p className="tooltip-text">{getUsersProjectStory()}</p>}
                        TransitionComponent={Zoom}
                    >
                        <InfoIcon className="tooltip-icon" />
                    </Tooltip>
                </div>
                <div className="central-board">
                    <Image
                        src={dashboardImg}
                        width={containerWidth ? containerWidth * 0.75 : 1500}
                        height={800}
                        alt=""
                        loading="lazy"
                    ></Image>
                    {!loading ? (
                        <div className="new-container task">
                            <h1>New Tasks</h1>
                            {userData?.projects
                                ?.find((projectData: UserProject) => projectData.id === project)
                                ?.tasks.filter((task: UserTask) => task.status === "new")
                                .map((task: UserTask) => {
                                    return (
                                        <div
                                            className="new-task-card"
                                            onClick={(e) => handleEditTask(task, e)}
                                            key={task.id}
                                            id="move"
                                        >
                                            <h3>
                                                #{task.number} {taskHeadingCrop(task.heading)}
                                            </h3>
                                            <RedoIcon
                                                className="icon task-icon-foward"
                                                onClick={(e) => handleStatusChangeUp(e, task)}
                                            />
                                            <h3 className="estimated">
                                                Estimated {task.estimation}h{" "}
                                                {getTaskEstimationAcc(task)}
                                            </h3>
                                            <Tooltip
                                                title={
                                                    <p className="tooltip-text">{task.description}</p>
                                                }
                                                TransitionComponent={Zoom}
                                            >
                                                <InfoIcon className="tooltip-icon-task" />
                                            </Tooltip>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <CircularIndeterminate />
                    )}
                    {!loading ? (
                        <div className="active-container task">
                            <h1>Active Tasks</h1>
                            {userData?.projects
                                ?.find((projectData: UserProject) => projectData.id === project)
                                ?.tasks.filter((task: UserTask) => task.status === "active")
                                .map((task: UserTask) => {
                                    return (
                                        <div
                                            className="new-task-card"
                                            onClick={(e) => handleEditTask(task, e)}
                                            key={task.id}
                                        >
                                            <h3>
                                                #{task.number} {taskHeadingCrop(task.heading)}
                                            </h3>
                                            <RedoIcon
                                                className="icon task-icon-foward"
                                                onClick={(e) => handleStatusChangeUp(e, task)}
                                            />
                                            <h3 className="estimated">
                                                Estimated {task.estimation}h{" "}
                                                {getTaskEstimationAcc(task)}
                                            </h3>
                                            <RedoIcon
                                                className="icon task-icon-backward"
                                                onClick={(e) => handleStatusChangeDown(e, task)}
                                            />
                                            <Tooltip
                                                title={
                                                    <p className="tooltip-text">{task.description}</p>
                                                }
                                                TransitionComponent={Zoom}
                                            >
                                                <InfoIcon className="tooltip-icon-task" />
                                            </Tooltip>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <CircularIndeterminate />
                    )}
                    {!loading ? (
                        <div className="resolved-container task">
                            <h1>Resolved Tasks</h1>
                            {userData?.projects
                                ?.find((projectData: UserProject) => projectData.id === project)
                                ?.tasks.filter((task: UserTask) => task.status === "resolved")
                                .map((task: UserTask) => {
                                    return (
                                        <div
                                            className="new-task-card"
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
                                            <RedoIcon
                                                className="icon task-icon-backward"
                                                onClick={(e) => handleStatusChangeDown(e, task)}
                                            />
                                            <Tooltip
                                                title={
                                                    <p className="tooltip-text">{task.description}</p>
                                                }
                                                TransitionComponent={Zoom}
                                            >
                                                <InfoIcon className="tooltip-icon-task" />
                                            </Tooltip>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <CircularIndeterminate />
                    )}
                </div>
            </div>
            <div className="dashboard-right-wrapper">
                <LogoutIcon className="icon" onClick={(e) => handleUserClick(e)} />
            </div>
        </div>
    );
}
