export async function ProcessPrompt(rawPrompt: string): Promise<string[]> {
    const kbPath = "/knowledge_base"; // Path to your knowledge base in the public directory

    // Define types for mappings and knowledge base
    type KeywordToFileMapping = Record<string, string>;
    type KnowledgeBase = Record<string, string>;

    // Keyword to file mapping
    const keywordToFileMapping: KeywordToFileMapping = {
        general: `${kbPath}/general_kb.txt`,
        control: `${kbPath}/control_kb.txt`,
        app_structure: `${kbPath}/app_structure_kb.txt`,
        roster: `${kbPath}/rostering_kb.txt`,
        statistics: `${kbPath}/statistics_kb.txt`,
    };

    // Function to preload all knowledge base files
    async function preloadKnowledgeBase(): Promise<KnowledgeBase> {
        const knowledgeBase: KnowledgeBase = {};
        for (const [_, filePath] of Object.entries(keywordToFileMapping)) {
            if (!knowledgeBase[filePath]) {
                try {
                    const response = await fetch(filePath);
                    if (response.ok) {
                        knowledgeBase[filePath] = await response.text();
                    } else {
                        console.error(`Error loading file ${filePath}: ${response.statusText}`);
                        knowledgeBase[filePath] = ""; // Default to empty string if the file is missing
                    }
                } catch (err) {
                    console.error(`Error loading file ${filePath}:`, err);
                    knowledgeBase[filePath] = ""; // Default to empty string if there's an error
                }
            }
        }
        return knowledgeBase;
    }

    // Load knowledge base
    const knowledgeBase = await preloadKnowledgeBase();

    // Function to retrieve relevant context
    function RetrieveRelevantContext(prompt: string): string[] {
        const contextMessage = ">> Here is the Context:";
        const processedContext: string[] = [contextMessage];

        // Always include the general knowledge base
        const generalFilePath = keywordToFileMapping["general"];
        const controlFilePath = keywordToFileMapping["control"];
        const appStructureFilePath = keywordToFileMapping["app_structure"];
        if (knowledgeBase[generalFilePath] && knowledgeBase[controlFilePath] && knowledgeBase[appStructureFilePath]) {
            processedContext.push(knowledgeBase[generalFilePath]);
            processedContext.push(knowledgeBase[controlFilePath]);
            processedContext.push(knowledgeBase[appStructureFilePath]);
        }

        // Extract unique keywords from the prompt
        const promptWords = new Set(prompt.toLowerCase().split(/\W+/)); // Split by non-word characters

        // Add relevant files based on keywords in the prompt
        for (const [keyword, filePath] of Object.entries(keywordToFileMapping)) {
            // Perform fuzzy matching or direct matching
            if (promptWords.has(keyword) && knowledgeBase[filePath]) {
                processedContext.push(knowledgeBase[filePath]);
            }
        }

        // Add the prompt at the end
        processedContext.push(">> Here is the Prompt:", prompt);

        return processedContext;
    }

    // Return the processed context
    return RetrieveRelevantContext(rawPrompt);
}
