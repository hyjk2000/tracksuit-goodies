import select from "@inquirer/select";
import open from "open";
import axiosClient from "./axiosClient.js";

const { data: quizzes } = await axiosClient.get<Page>("stuff/page?path=quizzes");
const storyId = await select({
  message: "Select a quiz",
  choices: quizzes.data[0].stories.map((story) => ({
    name: story.content.title,
    value: story.id,
  })),
  default: quizzes.data[0].stories.find((story) =>
    /morning trivia challenge/i.test(story.content.title),
  )?.id,
});
const story = quizzes.data[0].stories.find((story) => story.id === storyId);
if (story === undefined) throw new Error("Cannot find quizzes");

const { data: quiz } = await axiosClient.get<Story>(`stuff/story/${story.id}`);
const assetRegex = /https:\/\/www\.riddle\.com\/embed\/a\/[\w]+/;
const widget = quiz.content.contentBody.assets.find((asset) => assetRegex.test(asset.item.content));
if (widget === undefined) throw new Error("Cannot find widget");

const url = (assetRegex.exec(widget.item.content) ?? [])[0];
if (url === undefined) throw new Error("Cannot extract URL");

await open(url);
