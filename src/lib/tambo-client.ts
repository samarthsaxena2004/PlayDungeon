// TAMBO_TOOLS removed as it was unused

const TAMBO_BASE_URL = "https://api.tambo.co";

interface TamboConfig {
    key: string;
    projectId: string; // Not used in URL, but implied by key
    modelAlias: string; // Used as context or just implied by key
}

interface TamboRequestOptions {
    model?: string;
    max_tokens?: number;
    temperature?: number;
    tools?: unknown[];
    tool_choice?: "auto" | "none" | "required";
}

export interface TamboResponse {
    content: string;
    toolCalls: unknown[];
    role: string;
}

function getConfigurationForModel(requestedModel: string): TamboConfig {
    const primaryKey = process.env.TAMBO_API_KEY || process.env.NEXT_PUBLIC_TAMBO_API_KEY!;
    const primaryProject = process.env.TAMBO_PROJECT_ID || process.env.NEXT_PUBLIC_TAMBO_PROJECT_ID!;

    // Config Map - STRICTLY TAMBO
    // Debug log
    if (!primaryKey) console.error("❌ Tambo Client: Missing API KEY");

    return {
        key: primaryKey,
        projectId: primaryProject,
        modelAlias: "glmv4-7"
    };
}

async function createThread(apiKey: string): Promise<string> {
    const response = await fetch(`${TAMBO_BASE_URL}/threads`, {
        method: "POST",
        headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            projectId: getConfigurationForModel("tambo-story-v1").projectId, // Default project if not specified
            metadata: {
                source: "game-story-engine"
            }
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to create thread: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    return data.id;
}

export async function generateWithTambo(
    messages: { role: string; content: string }[],
    options: TamboRequestOptions = {}
): Promise<TamboResponse> {
    const requestedModel = options.model || "tambo-story-v1";
    const config = getConfigurationForModel(requestedModel);

    if (!messages.length) throw new Error("Messages array cannot be empty");

    try {
        // 1. Create a transient thread
        const threadId = await createThread(config.key);

        // 2. Prepare payload
        const messageToAppend = messages[messages.length - 1];
        const initialMessages = messages.slice(0, messages.length - 1).map(m => ({
            role: m.role,
            content: m.content
        }));

        // 3. Advance thread (Streaming)
        // The API now requires /advancestream
        const advanceUrl = `${TAMBO_BASE_URL}/threads/${threadId}/advancestream`;

        const requestBody = {
            initialMessages,
            messageToAppend: {
                role: messageToAppend.role,
                content: [{ type: "text", text: messageToAppend.content }]
            }
        };

        // Add tool definitions if present
        if (options.tools && options.tools.length > 0) {
            (requestBody as Record<string, unknown>).tools = options.tools;
            if (options.tool_choice) {
                (requestBody as Record<string, unknown>).tool_choice = options.tool_choice;
            }
        }

        const response = await fetch(advanceUrl, {
            method: "POST",
            headers: {
                "x-api-key": config.key,
                "Content-Type": "application/json",
                "Accept": "text/event-stream"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Tambo Advance failed: ${response.status} ${await response.text()}`);
        }

        // 4. Parse SSE Stream
        if (!response.body) {
            throw new Error("No response body received from Tambo stream");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        const toolCalls: unknown[] = [];
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");

            // Pending line stays in buffer
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (line.trim() === "" || line.startsWith(":")) continue;
                if (line.startsWith("data: ")) {
                    const dataStr = line.slice(6);
                    if (dataStr.trim() === "DONE") continue;

                    try {
                        const data = JSON.parse(dataStr);
                        // Access 'messageAdded'
                        if (data.messageAdded) {
                            const msg = data.messageAdded;

                            // Handle content
                            if (msg.content) {
                                if (Array.isArray(msg.content)) {
                                    assistantContent = msg.content.map((c: { text: string }) => c.text || "").join("");
                                } else if (typeof msg.content === 'string') {
                                    assistantContent = msg.content;
                                }
                            }

                            // Handle tool calls
                            if (msg.toolCalls && Array.isArray(msg.toolCalls)) {
                                toolCalls.push(...msg.toolCalls);
                            }
                        }
                    } catch (e) {
                        // ignore parse errors for partial chunks
                    }
                }
            }
        }

        return {
            content: assistantContent,
            toolCalls: toolCalls,
            role: "assistant"
        };

    } catch (error) {
        console.error(`[Tambo] Error using model ${requestedModel} (Project ${config.projectId}):`, error);
        throw error;
    }
}
