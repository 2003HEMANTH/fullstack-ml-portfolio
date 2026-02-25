export interface Project {
    _id: string;
    title: string;
    description: string;
    techStack: string[];
    githubUrl: string;
    liveUrl: string;
    imageUrl: string;
    featured: boolean;
    createdAt: string;
  }
  
  export interface Blog {
    _id: string;
    title: string;
    content: string;
    summary: string;
    coverImage: string;
    tags: string[];
    published: boolean;
    author: { name: string };
    createdAt: string;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
  }