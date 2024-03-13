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
} from "@mui/material";
import Face6Icon from "@mui/icons-material/Face6";
import MenuIcon from "@mui/icons-material/Menu";
import NorthIcon from "@mui/icons-material/North";
import RedoIcon from "@mui/icons-material/Redo";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import { UserAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/components/firebase";

interface NewTask {
    heading: string;
    description: string;
    estimation: number;
}

interface UserTask {
    heading: string;
    description: string;
    estimation: number;
    created: Date;
    status: string;
    completed: number;
    id: number
}

interface UserProject {
    tasks: UserTask[];
    name: string;
    id: string;
}

interface UserData {
    projects: UserProject[];
}

export default function Dashboard() {

    const { handleSelectedTask, project, setProject } = UserAuth()

    const ref = useRef<null | any>(null);

    const { logout, user } = UserAuth();
    const [userData, setUserData] = useState<UserData>({} as UserData);
    const [containerWidth, setContainerWidth] = useState(0);
    const [menuClicked, setMenuClicked] = useState(false);
    const [userClicked, setUserClicked] = useState(false);
    const [newProjectClicked, setNewProjectClicked] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [deleteModalClicked, setDeleteModalClicked] = useState(false);
    const [newTaskClicked, setNewTaskClicked] = useState(false);
    const [newTaskDetails, setNewTaskDetails] = useState<NewTask>({
        heading: "",
        description: "",
        estimation: 0,
    });

    const router = useRouter();

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
        if (user) fetchUserData();
    }, [user]);

    useEffect(() => {
        if (userData?.projects?.length > 0 && !project) {
            setProject(userData?.projects[userData.projects.length - 1]?.id);
        }
    }, [userData]);

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

                const newTask = {
                    ...newTaskDetails,
                    created: new Date().toDateString(),
                    status: 'new',
                    id: uuidv4(),
                    completed: 0
                }

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
            }
        }
    }

    async function deleteProject() {
        const id = userData?.projects.find(
            (projectData: UserProject) => projectData.id === project
        )?.id;
        if (!id) return;
        try {
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
            toast.success("Project deleted", { position: "top-center" });
        } catch (error) { }
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

    async function addNewProject() {
        if (!newProjectName) {
            toast.error("Please fill the project name field", {
                position: "top-center",
            });
            return;
        }
        const newProject = {
            id: uuidv4(),
            name: newProjectName,
            tasks: [],
        };
        setNewProjectName("");
        setNewProjectClicked(false);

        try {
            const oldProjects = userData.projects ?? [];
            await setDoc(getUserRef(), {
                projects: [...oldProjects, { ...newProject }],
            });
            fetchUserData();

            toast.success("New project is added", { position: "top-center" });
        } catch (error) {
            toast.error("Error occurred", { position: "top-center" });
        }
    }

    function getUserRef() {
        const userRef = doc(db, "users", user.uid);
        return userRef;
    }

    function getUsersProjectName() {
        return userData?.projects.find(
            (projectData: UserProject) => projectData.id === project)?.name;
    }

    const handleProjectClick = (e: any) => {
        if (e.target.className !== "new-project-container" && newProjectClicked)
            return;
        setNewProjectClicked((clicked: boolean) => !clicked);
    };

    const handleDeleteModalClick = (e: any) => {
        if (e.target.className !== "delete-project-container" && deleteModalClicked)
            return;
        setDeleteModalClicked((clicked: boolean) => !clicked);
    };

    const handleNewTaskClick = (e: any) => {
        if (e.target.className !== "new-task-container" && newTaskClicked) return;
        setNewTaskClicked((clicked: boolean) => !clicked);
    };

    const handleCloseNewTask = () => {
        setNewTaskClicked((clicked: boolean) => !clicked);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalClicked((clicked: boolean) => !clicked);
    };

    const handleCloseProjectClick = (e: any) => {
        setNewProjectClicked((clicked: boolean) => !clicked);
    };

    const handleChange = (event: SelectChangeEvent) => {
        setProject(event.target.value as string);
    };

    const handleMenuClick = () => {
        setMenuClicked((clicked: boolean) => !clicked);
    };

    const handleUserClick = () => {
        setUserClicked((cliked: boolean) => !cliked);
    };

    const handleEditTask = (task: UserTask) => {
        router.push(`/task`)
        handleSelectedTask(task)
    }

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
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="e.g. web shop app"
                                sx={{
                                    "& > :not(style)": {
                                        marginBottom: "10px",
                                    },
                                }}
                            />
                            <Button
                                variant="contained"
                                className="login-button"
                                onClick={addNewProject}
                            >
                                create project
                            </Button>
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
                        <h3>{`Are you sure you want to permanently remove ${getUsersProjectName()}?`}</h3>
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
                <div className="new-task-container">
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
                        onClick={handleNewTaskClick}
                    >
                        new task
                    </Button>
                    <Button
                        variant="contained"
                        className="dashboard-button top-button"
                        onClick={handleDeleteModalClick}
                    >
                        delete project
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
                    onClick={handleNewTaskClick}
                >
                    new task
                </Button>
                <Button
                    variant="contained"
                    className="dashboard-button"
                    onClick={handleDeleteModalClick}
                >
                    delete project
                </Button>
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
                                {userData?.projects?.length > 0 ?
                                    userData.projects?.map((project: UserProject) => {
                                        return (
                                            <MenuItem value={project.id} key={project.id}>
                                                {project.name}
                                            </MenuItem>
                                        );
                                    }) : <p style={{ padding: '10px', color: 'gray', cursor: 'not-allowed' }}>project list is empty</p>}
                            </Select>
                        </FormControl>
                    </Box>
                </div>
                <div className="central-board">
                    <Image
                        src={dashboardImg}
                        width={containerWidth ? containerWidth * 0.75 : 1500}
                        height={800}
                        alt=""
                        loading="lazy"
                    ></Image>
                    <div className="new-container task">
                        <h1>New Tasks</h1>
                        {userData?.projects?.find((projectData: UserProject) => projectData.id === project)?.tasks.map((task: UserTask) => {
                            return (<div className="new-task-card" onClick={() => handleEditTask(task)} key={task.id}>
                                <h3>#123 Task 1</h3>
                                <RedoIcon className="icon task-icon-foward" />
                                <h3 className="estimated">Estimated {task.estimation}h</h3>
                            </div>)
                        })}

                    </div>
                    <div className="active-container task">
                        <h1>Active Tasks</h1>
                        <div className="new-task-card">
                            <h3>#123 Task 1</h3>
                            <RedoIcon className="icon task-icon-foward" />
                            <h3 className="estimated">Estimated 19h</h3>
                            <RedoIcon className="icon task-icon-backward" />
                        </div>
                    </div>
                    <div className="resolved-container task">
                        <h1>Resolved Tasks</h1>
                        <div className="new-task-card">
                            <h3>#123 Task 1</h3>
                            <RedoIcon className="icon task-icon-backward" />
                            <h3 className="estimated">Estimated 19h</h3>
                        </div>
                    </div>
                </div>
            </div>
            <div className="dashboard-right-wrapper">
                <Face6Icon className="icon" onClick={handleUserClick} />
                {userClicked && (
                    <div className="user-menu">
                        <p>logout</p>
                        <LogoutIcon className="icon" onClick={handleLogout} />
                    </div>
                )}
            </div>
        </div>
    );
}
