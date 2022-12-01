import { Server } from 'miragejs';

declare global {
  type User = {
    id: string;
    name: string;
    surname: string;
    sex: 'female' | 'male';
    age: number;
    taskIds: Array<string>;
  };

  type Task = {
    id: string;
    title: string;
    startAt: string;
    user: User;
  };

  interface Window {
    server: Server;
  }

  let server: Server;
}

window.server = window.server || {};
