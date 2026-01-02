import path from "node:path";
import { promises as fs } from "node:fs";
// import { Task } from "./types.ts";

interface Task {
  task: string;
  startDate: string;
  endDate: string;
  completed: boolean;
}

const getFilePath = () => path.join("C:\\Users\\Nuno\\Documents\\projects\\mcp-tasks", "tasks.json");

export async function addTask(task: Task): Promise<Task> {
    try {
        const filepath = getFilePath();
        let tasks: Task[] = [];
        try {
            const data = await fs.readFile(filepath, "utf8");
            tasks = JSON.parse(data);
        }catch (error) {
            tasks = [];
        }
        tasks.push(task);
        await fs.writeFile(filepath, JSON.stringify(tasks, null, 2), "utf8");
        return task;
    } catch (error) {
        throw new Error(`Failed to load addTask module: ${error}`);
    }   
}

export async function listTasks(): Promise<Task[]> {
    try {
        const filepath = getFilePath();
        let tasks: Task[] = [];
        try {
            const data = await fs.readFile(filepath, "utf8");
            tasks = JSON.parse(data);
        }catch (error) {
            tasks = [];
        }

        return tasks;
    } catch (error) {
        throw new Error(`Failed to load listTasks module: ${error}`);
    }   
}