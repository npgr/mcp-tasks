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
        const task: Task = { id: nextId, ...newTask };
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

        // let needsRewrite = false;
        // let maxId = tasks.reduce((max, t) => Math.max(max, typeof t.id === "number" ? t.id : 0), 0);
        // tasks = tasks.map((t) => {
        //     if (typeof t.id !== "number") {
        //         needsRewrite = true;
        //         maxId += 1;
        //         return { ...t, id: maxId };
        //     }
        //     return t;
        // });

        // if (needsRewrite) {
        //     await fs.writeFile(filepath, JSON.stringify(tasks, null, 2), "utf8");
        // }

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