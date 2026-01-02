import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { addTask, listTasks } from "./services/tasks.js";
// Create server instance
const server = new McpServer({
    name: "tasks",
    version: "1.0.0",
});
server.registerTool("add_task", {
    description: "Add a new task to the task list.",
    inputSchema: z.object({
        task: z.string().describe("The description of the task."),
        startDate: z.string().describe("The start date of the task in DD-MM-YYYY format."),
        endDate: z.string().describe("The end date of the task in DD-MM-YYYY format."),
        completed: z.boolean().describe("Whether the task is completed or not."),
    }),
}, async ({ task, startDate, endDate, completed }) => {
    addTask({ task, startDate, endDate, completed });
    return {
        content: [
            { type: "text",
                text: `Task "${task}" added successfully.`,
            },
        ]
    };
});
server.registerTool("list_tasks", { description: "List all tasks." }, async () => {
    const tasks = await listTasks();
    const header = '| ID | Task | Start | End | Completed |\n|----|------|-------|-----|-----------|';
    const rows = tasks.map(t => `| ${t.id ?? ''} | ${t.task} | ${t.startDate} | ${t.endDate} | ${t.completed} |`).join('\n');
    const md = tasks.length ? `${header}\n${rows}` : 'No tasks found.';
    return {
        content: [
            { type: "text",
                text: md,
            },
        ]
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
