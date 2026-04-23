import fs from "fs";
import path from "path";

const content = fs.readFileSync(path.resolve("./Plans/learn_content.md"), "utf-8");

const glossaryMatch = content.match(/# GLOSSARY \(\d+\+ Terms\)\s+```json\s([\s\S]*?)\s```/);
if (glossaryMatch) {
    fs.mkdirSync("./frontend/src/data", { recursive: true });
    fs.writeFileSync("./frontend/src/data/glossary.json", glossaryMatch[1]);
}

const missionsMatch = content.match(/# MISSIONS\s+```json\s([\s\S]*?)\s```/);
if (missionsMatch) {
    fs.mkdirSync("./frontend/src/data", { recursive: true });
    fs.writeFileSync("./frontend/src/data/missions.json", missionsMatch[1]);
}

const modules = content.split(/# MODULE \d+:/).slice(1);
fs.mkdirSync("./frontend/src/data/lessons", { recursive: true });

modules.forEach((modText, index) => {
    const moduleId = index + 1;
    const moduleTitle = modText
        .split("\n")[0]
        .trim()
        .replace(/^ - |^— /g, "")
        .trim();

    // Split by Lesson
    const lessonsRaw = modText.split(/## Lesson \d+\.\d+ — /).slice(1);

    const lessons = lessonsRaw.map((lessonRaw, lIndex) => {
        const lessonId = `${moduleId}.${lIndex + 1}`;
        const lessonTitle = lessonRaw.split("\n")[0].trim();

        const contentMatch = lessonRaw.match(/### Content\s+([\s\S]*?)(?=### Quiz)/);
        const lessonContent = contentMatch ? contentMatch[1].trim() : "";

        const quizMatch = lessonRaw.match(/### Quiz\s+```json\s([\s\S]*?)\s```/);
        const quiz = quizMatch ? JSON.parse(quizMatch[1]) : [];

        return {
            id: lessonId,
            title: lessonTitle,
            content: lessonContent,
            quiz,
        };
    });

    const moduleObj = {
        id: `module${moduleId}`,
        title: moduleTitle,
        lessons,
    };

    fs.writeFileSync(`./frontend/src/data/lessons/module${moduleId}.json`, JSON.stringify(moduleObj, null, 2));
});
console.log("JSON parsing complete.");
