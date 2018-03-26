import html from 'choo/html';
import moment from 'moment';

export default (appState) => {
  return appState.displayedEntries.map(entry => {
    return html`<div class="columns">
      <div class="column">
        ${entry.feed}
      </div>
      <div class="column">
        ${entry.name}
      </div>
      <div class="column">
        ${moment(entry.pubDate).fromNow()}
      </div>
    </div>`;
  });
}