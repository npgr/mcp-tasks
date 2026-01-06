import path from "node:path";
import { promises as fs } from "node:fs";
import PocketBase from 'pocketbase';

interface Task {
    id?: number | string;
    task: string;
    startDate: string;
    endDate: string;
    completed: boolean;
}

type NewTask = Omit<Task, "id">;

const getFilePath = () => path.join("C:\\Users\\Nuno\\Documents\\projects\\mcp-tasks", "tasks.json");

const pbUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(pbUrl);

export async function addTask(newTask: NewTask): Promise<Task> {
    try {
        const formatToday = (): string => {
            const d = new Date();
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();
            return `${dd}-${mm}-${yyyy}`;
        };

        const startDate = newTask.startDate && newTask.startDate.trim() ? newTask.startDate : formatToday();

        const data = {
            task: newTask.task,
            startDate,
            endDate: newTask.endDate ?? '',
            completed: !!newTask.completed,
        };

        const record = await pb.collection('tasks').create(data);

        const created: Task = {
            id: typeof record.id === 'string' && /^\d+$/.test(record.id) ? parseInt(record.id, 10) : record.id,
            task: record.task ?? data.task,
            startDate: record.startDate ?? data.startDate,
            endDate: record.endDate ?? data.endDate,
            completed: !!record.completed,
        };

        return created;
    } catch (error) {
        throw new Error(`Failed to load addTask module: ${error}`);
    }
}

export async function listTasks(): Promise<Task[]> {
    try {
        const pbUrl = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';
        const pb = new PocketBase(pbUrl);

        // Fetch all records from the `tasks` collection
        const records = await pb.collection('tasks').getFullList({ sort: '-created' });

        const tasks: Task[] = records.map((r: any) => ({
            id: typeof r.id === 'string' && /^\d+$/.test(r.id) ? parseInt(r.id, 10) : r.id,
            task: r.task ?? r.title ?? '',
            startDate: r.startDate ?? '',
            endDate: r.endDate ?? '',
            completed: !!r.completed,
        }));

        return tasks;
    } catch (error) {
        throw new Error(`Failed to load listTasks module: ${error}`);
    }
}

export async function markTaskCompleted(taskName: string, completed: boolean): Promise<Task | null> {
    try {
        // Find the first matching task by `task` field in PocketBase
        const page = await pb.collection('tasks').getList(1, 1, { filter: `task="${taskName.replace(/"/g, '\\"')}"` });
        if (!page || !page.items || page.items.length === 0) return null;

        const record: any = page.items[0];

        const updateData = {
            task: record.task ?? taskName,
            startDate: record.startDate ?? '',
            endDate: record.endDate ?? '',
            completed: !!completed,
        };

        const updatedRecord: any = await pb.collection('tasks').update(record.id, updateData);

        const updated: Task = {
            id: typeof updatedRecord.id === 'string' && /^\d+$/.test(updatedRecord.id) ? parseInt(updatedRecord.id, 10) : updatedRecord.id,
            task: updatedRecord.task ?? updateData.task,
            startDate: updatedRecord.startDate ?? updateData.startDate,
            endDate: updatedRecord.endDate ?? updateData.endDate,
            completed: !!updatedRecord.completed,
        };

        return updated;
    } catch (error) {
        throw new Error(`Failed to complete task: ${error}`);
    }
}