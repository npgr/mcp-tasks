import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { addTask, listTasks, markTaskCompleted, deleteTask } from "./services/tasks.js";
// Create server instance
const server = new McpServer({
    name: "tasks",
    version: "1.0.0",
});
server.registerTool("add_task", {
    description: "Add a new task to the task list.",
    inputSchema: z.object({
        task: z.string().describe("The description of the task."),
        startDate: z.string().optional().describe("The start date of the task in DD-MM-YYYY format."),
        endDate: z.string().optional().describe("The end date of the task in DD-MM-YYYY format."),
        completed: z.boolean().optional().describe("Whether the task is completed or not."),
    }),
}, async ({ task, startDate = "", endDate = "", completed = false }) => {
    addTask({ task, startDate, endDate, completed });
    return {
        content: [
            { type: "text",
                text: `Task "${task}" added successfully.`,
            },
        ]
    };
});
server.registerTool("list_tasks", {
    description: "List all tasks.",
    inputSchema: z.object({
        completed: z.boolean().optional().describe("Optional filter: true for completed tasks, false for incomplete tasks."),
    }),
}, async (input) => {
    const { completed } = input ?? {};
    const tasks = await listTasks();
    const filtered = typeof completed === 'boolean' ? tasks.filter((t) => t.completed === completed) : tasks;
    const text = filtered.length ? JSON.stringify(filtered) : '[]';
    return {
        content: [
            { type: "text",
                text,
            },
        ]
    };
});
server.registerTool("mark_task_completed", {
    description: "Mark a task completed by exact task name.",
    inputSchema: z.object({
        taskName: z.string().describe("The exact name of the task to mark completed."),
    }),
}, async ({ taskName }) => {
    const updated = await markTaskCompleted(taskName, true);
    if (!updated) {
        return {
            content: [
                { type: "text", text: `Task with name "${taskName}" not found.` },
            ],
        };
    }
    return {
        content: [
            { type: "text", text: `Task "${updated.task}" marked completed.` },
        ],
    };
});
server.registerTool("mark_task_pending", {
    description: "Mark a task pending by exact task name.",
    inputSchema: z.object({
        taskName: z.string().describe("The exact name of the task to mark pending."),
    }),
}, async ({ taskName }) => {
    const updated = await markTaskCompleted(taskName, false);
    if (!updated) {
        return {
            content: [
                { type: "text", text: `Task with name "${taskName}" not found.` },
            ],
        };
    }
    return {
        content: [
            { type: "text", text: `Task "${updated.task}" marked pending.` },
        ],
    };
});
server.registerTool("delete_task", {
    description: "Delete a task by exact task name.",
    inputSchema: z.object({
        taskName: z.string().describe("The exact name of the task to delete."),
    }),
}, async ({ taskName }) => {
    const deleted = await deleteTask(taskName);
    if (!deleted) {
        return {
            content: [
                { type: "text", text: `Task with name "${taskName}" not found.` },
            ],
        };
    }
    return {
        content: [
            { type: "text", text: `Task "${deleted.task}" deleted.` },
        ],
    };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Tasks MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
