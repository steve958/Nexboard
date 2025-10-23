import { UserAuth } from "@/context/AuthContext";
import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import Image from "next/image";
import dashboardImg from "../../../public/dashboardImg.png";
import router from "next/router";
import { MdLogout, MdArrowBack, MdClose } from "react-icons/md";
import { Box, Button, FormControl, FormLabel, Select, Stack, Input, Textarea, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalFooter, ModalBody, HStack } from "@chakra-ui/react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/components/firebase";
import { useToast } from "@chakra-ui/react";
import { UserProject, UserTask } from "../dashboard";
import CircularIndeterminate from "@/components/Loader/Loader";

export default function Task() {
    const [containerWidth, setContainerWidth] = useState(0);
    const [deleteModalClicked, setDeleteModalClicked] = useState(false);
    const [userClicked, setUserClicked] = useState(false);
    const [taskDetails, setTaskDetails] = useState<UserTask>({} as UserTask);
    const [loading, setLoading] = useState(false)

    const { currentTask, logout, user, project } = UserAuth();
    const toast = useToast();

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
            setLoading(true)
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
            setLoading(false)
            toast({ status: 'success', title: 'Task is deleted!' });
            setTaskDetails({} as UserTask)
            router.push("/dashboard");
        } catch (error) {
            toast({ status: 'error', title: 'Error occurred' });
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
            toast({ status: 'error', title: 'Please fill all task details' });
            return;
        }
        try {
            setLoading(true)
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
            setLoading(false)
            toast({ status: 'success', title: 'Task is saved!' });
            setTaskDetails({} as UserTask)
            router.push("/dashboard");
        } catch (error) {
            toast({ status: 'error', title: 'Error occurred' });
            console.log(error);
        }

    }

    function getUserRef() {
        const userRef = doc(db, "users", user.uid);
        return userRef;
    }

    const handleUserClick = (e: any) => {
        if (e.target.className !== "delete-project-container" && userClicked)
            return;
        setUserClicked((cliked: boolean) => !cliked);
    };

    const handleUserCloseClick = () => {
        setUserClicked((clicked: boolean) => !clicked)
    }

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
{deleteModalClicked && (
                <Modal isOpen={deleteModalClicked} onClose={handleCloseDeleteModal} isCentered>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>{`Are you sure you want to permanently delete this task?`}</ModalHeader>
                        <ModalCloseButton />
                        <ModalFooter>
                            <Stack spacing={2} direction="row">
                                <Button colorScheme="red" onClick={deleteTask}>delete task</Button>
                                <Button variant="ghost" onClick={handleCloseDeleteModal}>return</Button>
                            </Stack>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
<Box as={MdArrowBack} className="icon back-icon" onClick={handleBackButton} />
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
                {!loading ?
<Box as="form">
                        <span className="created-wrapper">
                            <p>Task created</p>
                            <p>{(currentTask as UserTask).created?.toString()}</p>
                        </span>
<FormControl isRequired mb={2}>
                            <FormLabel>Task heading</FormLabel>
                            <Input defaultValue={(currentTask as UserTask).heading} onChange={(e) => handleTaskDetailsChange(e.target.value, "heading")} placeholder="e.g. web shop app" />
                        </FormControl>
<FormControl isRequired mb={2}>
                            <FormLabel>Description</FormLabel>
                            <Textarea defaultValue={(currentTask as UserTask).description} rows={10} placeholder="e.g. navbar should have five different icons connected to page routing" onChange={(e) => handleTaskDetailsChange(e.target.value, "description")} />
                        </FormControl>
<HStack className="estimated-wrapper">
                            <p>Estimation:</p>
                            <Input type="number" onChange={(e) => handleTaskDetailsChange(e.target.value, "estimation")} defaultValue={(currentTask as UserTask).estimation as any} min={1} width="120px" />
                            <p>hours</p>
                        </HStack>
<HStack className="estimated-wrapper">
                            <p>Completed:</p>
                            <Input type="number" defaultValue={(currentTask as UserTask).completed as any} onChange={(e) => handleTaskDetailsChange(e.target.value, "completed")} min={0} width="120px" />
                            <p>hours</p>
                        </HStack>
<Box w={250} mb="20px">
                            <FormControl>
                                <FormLabel>Task status</FormLabel>
                                <Select defaultValue={(currentTask as UserTask).status} onChange={(e) => handleTaskDetailsChange(e.target.value, "status")}>
                                    <option value="new">NEW</option>
                                    <option value="active">ACTIVE</option>
                                    <option value="resolved">RESOLVED</option>
                                </Select>
                            </FormControl>
                        </Box>
<Stack spacing={2} direction="row">
                            <Button colorScheme="brand" onClick={saveTask}>save task</Button>
                            <Button colorScheme="red" variant="solid" onClick={handleDeleteModalClick}>delete task</Button>
                        </Stack>
                    </Box>
                    : <CircularIndeterminate />}
            </div>
            <div className="user-container">
<Box as={MdLogout} className="icon" onClick={handleUserClick as any} />
            </div>
        </div>
    );
}
