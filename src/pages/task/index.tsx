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
import { doc } from "firebase/firestore";
import { db } from "@/components/firebase";
import { toast } from "react-toastify";

interface UserTask {
    heading: string;
    description: string;
    estimation: number;
    created: Date;
    status: string;
    completed: number;
    id: number;
}

export default function Task() {
    const [containerWidth, setContainerWidth] = useState(0);
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

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <div className="task-container" ref={ref}>
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
                        <Button variant="contained" className="delete-back-button">
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
