import { UserAuth } from "@/context/AuthContext";
import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import Image from "next/image";
import dashboardImg from "../../../public/dashboardImg.png";
import router from "next/router";
import Face6Icon from "@mui/icons-material/Face6";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from "@mui/material";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/components/firebase";
import { toast } from "react-toastify";
import { UserProject, UserTask } from "../dashboard";
import CloseIcon from "@mui/icons-material/Close";

export default function Task() {
    const [containerWidth, setContainerWidth] = useState(0);
    const [deleteModalClicked, setDeleteModalClicked] = useState(false);
    const [userClicked, setUserClicked] = useState(false);
    const [taskDetails, setTaskDetails] = useState<UserTask>({} as UserTask);

    const { currentTask, logout, user, project } = UserAuth();

    const ref = useRef<null | any>(null);

    useEffect(() => {
        if (!(currentTask as UserTask).id) {
            router.push("/dashboard");
        } else {
            setTaskDetails(currentTask);
        }
    }, [currentTask]);

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


    async function deleteTask() {
        try {
            const docSnap = await getDoc(getUserRef());
            const projects = docSnap.data()?.projects;
            let selected = projects.find(
                (projectData: UserProject) => projectData.id === project
            );
            selected.tasks = selected.tasks.filter((task: UserTask) => task.id !== taskDetails.id)
            let filtered = projects.filter(
                (projectData: UserProject) => projectData.id !== project
            );

            await setDoc(getUserRef(), {
                projects: [selected, ...filtered],
            });
            toast.success("Task is deleted!", { position: "top-center" });
            setTaskDetails({} as UserTask)
            router.push("/dashboard");
        } catch (error) {
            toast.error("Error occurred", { position: "top-center" });
            console.log(error);
        }
    }


    async function saveTask() {
        if (
            !taskDetails.description ||
            !taskDetails.heading ||
            !taskDetails.estimation ||
            !taskDetails.status
        ) {
            toast.error("Please fill all task details", { position: "top-center" });
            return;
        }
        try {
            const docSnap = await getDoc(getUserRef());
            const projects = docSnap.data()?.projects;
            let selected = projects.find(
                (projectData: UserProject) => projectData.id === project
            );
            selected.tasks = selected.tasks.filter((task: UserTask) => task.id !== taskDetails.id)
            selected.tasks.push(taskDetails)
            let filtered = projects.filter(
                (projectData: UserProject) => projectData.id !== project
            );

            await setDoc(getUserRef(), {
                projects: [selected, ...filtered],
            });
            toast.success("Task is saved!", { position: "top-center" });
            setTaskDetails({} as UserTask)
            router.push("/dashboard");
        } catch (error) {
            toast.error("Error occurred", { position: "top-center" });
            console.log(error);
        }

    }

    function getUserRef() {
        const userRef = doc(db, "users", user.uid);
        return userRef;
    }

    const handleUserClick = () => {
        setUserClicked((cliked: boolean) => !cliked);
    };

    const handleBackButton = () => {
        router.push("/dashboard");
    };

    const handleTaskDetailsChange = (value: string, property: string) => {
        switch (property) {
            case "heading":
                setTaskDetails((oldState: UserTask) => {
                    return { ...oldState, heading: value };
                });
                return;
            case "description":
                setTaskDetails((oldState: UserTask) => {
                    return { ...oldState, description: value };
                });
                return;
            case "estimation":
                setTaskDetails((oldState: UserTask) => {
                    return { ...oldState, estimation: Number(value) };
                });
                return;
            case "completed":
                setTaskDetails((oldState: UserTask) => {
                    return { ...oldState, completed: Number(value) };
                });
                return;
            case "status":
                setTaskDetails((oldState: UserTask) => {
                    return { ...oldState, status: value };
                });
                return;

            default:
                break;
        }
    };

    const handleDeleteModalClick = (e: any) => {
        if (e.target.className !== "delete-project-container" && deleteModalClicked)
            return;
        setDeleteModalClicked((clicked: boolean) => !clicked);
    };

    const handleCloseDeleteModal = () => {
        setDeleteModalClicked((clicked: boolean) => !clicked);
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <div className="task-container" ref={ref}>
            {deleteModalClicked && (
                <div
                    className="delete-project-container"
                    onClick={handleDeleteModalClick}
                >
                    <div className="delete-project-wrapper">
                        <h3>{`Are you sure you want to permanently delete this task?`}</h3>
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
                                    onClick={deleteTask}
                                >
                                    delete task
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
                    <CloseIcon className="delete-task-icon icon" onClick={handleCloseDeleteModal} />
                </div>
            )}
            <ArrowBackIcon className="icon back-icon" onClick={handleBackButton} />
            <Image
                src={dashboardImg}
                width={containerWidth ? containerWidth * 0.75 : 1500}
                height={800}
                alt=""
                loading="lazy"
            ></Image>
            <div
                className="task-wrapper"
                style={{ width: `${containerWidth ? containerWidth * 0.75 : 1500}` }}
            >
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
                    <span className="created-wrapper">
                        <p>Task created</p>
                        <p>{(currentTask as UserTask).created?.toString()}</p>
                    </span>
                    <TextField
                        defaultValue={(currentTask as UserTask).heading}
                        id="outlined-basic7"
                        required
                        onChange={(e) => handleTaskDetailsChange(e.target.value, "heading")}
                        variant="outlined"
                        label="Task heading"
                        placeholder="e.g. web shop app"
                        sx={{
                            "& > :not(style)": {
                                marginBottom: "10px",
                            },
                        }}
                    />
                    <TextField
                        id="standard-multiline-flexible"
                        variant="outlined"
                        required
                        onChange={(e) =>
                            handleTaskDetailsChange(e.target.value, "description")
                        }
                        multiline
                        label="Description"
                        defaultValue={(currentTask as UserTask).description}
                        rows={10}
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
                            onChange={(e) =>
                                handleTaskDetailsChange(e.target.value, "estimation")
                            }
                            defaultValue={(currentTask as UserTask).estimation}
                            className="estimation-input"
                            min={1}
                        />
                        <p>hours</p>
                    </span>
                    <span className="estimated-wrapper">
                        <p>Completed:</p>
                        <input
                            type="number"
                            defaultValue={(currentTask as UserTask).completed}
                            onChange={(e) =>
                                handleTaskDetailsChange(e.target.value, "completed")
                            }
                            className="estimation-input"
                            min={1}
                        />
                        <p>hours</p>
                    </span>
                    <Box sx={{ width: 250, marginBottom: "20px" }}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Task status</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                defaultValue={(currentTask as UserTask).status}
                                onChange={(e) =>
                                    handleTaskDetailsChange(e.target.value, "status")
                                }
                                label="Select project"
                            >
                                <MenuItem value="new">NEW</MenuItem>
                                <MenuItem value="active">ACTIVE</MenuItem>
                                <MenuItem value="resolved">RESOLVED</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Stack spacing={2} direction="row">
                        <Button
                            variant="contained"
                            className="delete-confirm-button"
                            onClick={saveTask}
                        >
                            save task
                        </Button>
                        <Button variant="contained" className="delete-back-button" onClick={handleDeleteModalClick}>
                            delete task
                        </Button>
                    </Stack>
                </Box>
            </div>
            <div className="user-container">
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
