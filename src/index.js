import "babel-polyfill";
import choo from 'choo';

import initialState from './initialState';
import setupEmitter from './setupEmitter';
import baseView from './views/base';

const app = choo({ href: false }); // Setting {href: false} allows links to work normally :)

app.use((state, emitter) => {
  state = initialState(state);

  emitter.on('DOMContentLoaded', () => {
    setupEmitter(state, emitter);

    emitter.emit('show cache');
  });
});

app.route('*', baseView);

window.onload = () => {
  app.mount('body');
}
