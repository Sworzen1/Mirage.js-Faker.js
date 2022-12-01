import { belongsTo, createServer, hasMany, Model } from 'miragejs';
import { faker } from '@faker-js/faker';

export namespace Mirage {
  const randomYear = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  export const createMirageServer = () => {
    createServer({
      models: {
        task: Model.extend({
          user: belongsTo('user'),
        }),
        user: Model.extend({
          task: hasMany('task'),
        }),
      },

      seeds(server) {
        const tasks = Array.from({ length: 2 });
        tasks.forEach((task) => {
          server.create('task', {
            id: faker.datatype.uuid(),
            title: faker.word.verb(),
            startAt: faker.date.past(),
            user: null,
          });
        });

        const users = Array.from({ length: 2 });
        users.forEach((user) => {
          server.create('user', {
            id: faker.datatype.uuid(),
            name: faker.name.firstName(),
            surname: faker.name.lastName(),
            sex: faker.name.sex(),
            age: randomYear(25, 99),
            task: null,
          });
        });
      },

      routes() {
        this.get('api/users', (scheme) => {
          return scheme.all('user');
        });

        this.get('api/tasks', (scheme) => {
          return scheme.all('task');
        });

        this.post('api/tasks/create', (scheme, request) => {
          const title = request.requestBody.title;
          const userId = request.requestBody.user;
          const user = scheme.findBy('user', { id: userId });

          return scheme.create('task', {
            id: faker.datatype.uuid(),
            title: title,
            startAt: new Date(),
            user,
          });
        });

        this.post('api/tasks/update/:id', (scheme, request) => {
          const taskId = request.params.id;
          const title = request.requestBody.title;

          return scheme.findBy('task', { id: taskId })?.update('title', title);
        });

        this.delete('api/tasks/delete/:id', (scheme, request) => {
          const taskId = request.params.id;

          return scheme.findBy('task', { id: taskId })?.destroy();
        });

        this.get('api/tasks/:userId', (scheme, request) => {
          const userId = request.params.userId;
          const user = scheme.findBy('user', { id: userId });

          return user.taskIds.map((taskId: string) =>
            scheme.findBy('task', { id: taskId })
          );
        });
      },
    });
  };
}
