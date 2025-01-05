export const ExtractJSON = (response: string):any => {
    try {
    const jsonContent: string = response
        .replace(/^```json\s|\s```$/g, "")
        .trim()
        .split("```")[0];

        return JSON.parse(jsonContent)
    } catch(err) {
        return response
    }
}