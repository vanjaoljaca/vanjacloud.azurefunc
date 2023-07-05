import fetch from 'node-fetch';

// https://github.com/HackerNews/API

interface Story {
    id: number;
    title: string;
    url: string;
    numComments: number;
}

interface Comment {
    id: number;
    text: string;
    author: string;
    children: Comment[];
}

async function getComment(id: number): Promise<Comment> {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    const comment = await response.json();
    const children = comment.kids ? await Promise.all(comment.kids.map(getComment)) : [];
    return {
        id: comment.id,
        text: comment.text,
        author: comment.by,
        children,
    };
}

async function getComments(storyId: number): Promise<Comment[]> {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
    const story = await response.json();
    const comments = story.kids ? await Promise.all(story.kids.map(getComment)) : [];
    return comments;
}


async function getStory(id: number): Promise<Story> {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    const story = await response.json();
    // const comments = await Promise.all((story.kids || []).map(getComment));
    return {
        id: story.id,
        title: story.title,
        url: story.url,
        numComments: story.descendants,
        // comments,
    };
}

async function getFrontpage(): Promise<Story[]> {
    const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const storyIds = await response.json();
    const stories = await Promise.all(storyIds.slice(0, 30).map(getStory));
    return stories.map(({id, title, url, numComments}) => ({id, title, url, numComments})); // Exclude comments
}

export default {
    getFrontpage,
    getStory,
    getComments
}