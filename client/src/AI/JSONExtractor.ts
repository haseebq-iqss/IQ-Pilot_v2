export const ExtractJSON = (response: string):any => {
    const jsonContent: string = response
        .replace(/^```json\s|\s```$/g, "")
        .trim()
        .split("```")[0];

    return JSON.parse(jsonContent)
}