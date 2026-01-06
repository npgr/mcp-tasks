import path from "node:path";
import { promises as fs } from "node:fs";

interface Task {
    id?: number;
    task: string;
    startDate: string;
    endDate: string;
    completed: boolean;
}

type NewTask = Omit<Task, "id">;

const getFilePath = () => path.join("C:\\Users\\Nuno\\Documents\\projects\\mcp-tasks", "tasks.json");

export async function addTask(newTask: NewTask): Promise<Task> {
    try {
        const filepath = getFilePath();
        let tasks: Task[] = [];
        try {
            const data = await fs.readFile(filepath, "utf8");
            tasks = JSON.parse(data);
        } catch (error) {
            tasks = [];
        }

        const nextId = tasks.reduce((max, t) => Math.max(max, typeof t.id === "number" ? t.id : 0), 0) + 1;

        const formatToday = (): string => {
            const d = new Date();
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();
            return `${dd}-${mm}-${yyyy}`;
        };

        const startDate = newTask.startDate && newTask.startDate.trim() ? newTask.startDate : formatToday();
        const task: Task = { id: nextId, ...newTask, startDate };
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
        } catch (error) {
            tasks = [];
        }

        return tasks;
    } catch (error) {
        throw new Error(`Failed to load listTasks module: ${error}`);
    }
}

export async function completeTask(id: number): Promise<Task | null> {
    try {
        const filepath = getFilePath();
        let tasks: Task[] = [];
        try {
            const data = await fs.readFile(filepath, "utf8");
            tasks = JSON.parse(data);
        } catch (error) {
            tasks = [];
        }

        const idx = tasks.findIndex((t) => t.id === id);
        if (idx === -1) return null;

        const updated: Task = { ...tasks[idx], completed: true };
        tasks[idx] = updated;
        await fs.writeFile(filepath, JSON.stringify(tasks, null, 2), "utf8");
        return updated;
    } catch (error) {
        throw new Error(`Failed to complete task: ${error}`);
    }
}

export async function markTaskCompleted(taskName: string, completed: boolean): Promise<Task | null> {
    try {
        const filepath = getFilePath();
        let tasks: Task[] = [];
        try {
            const data = await fs.readFile(filepath, "utf8");
            tasks = JSON.parse(data);
        } catch (error) {
            tasks = [];
        }

        const idx = tasks.findIndex((t) => t.task === taskName);
        if (idx === -1) return null;

        const updated: Task = { ...tasks[idx], completed };
        tasks[idx] = updated;
        await fs.writeFile(filepath, JSON.stringify(tasks, null, 2), "utf8");
        return updated;
    } catch (error) {
        throw new Error(`Failed to complete task: ${error}`);
    }
}