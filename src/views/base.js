import html from 'choo/html';

import fullList from './fullList';

export default (appState, emit) => {
  let view;

  view = [
    html`<div class="field">
    <label class="label" for="feedURL">
      RSS Feed URL
    </label>
    <div class="control">
      <input class="input" type="text" placeholder="http://some.blog/feed.rss" id="feedURL">
    </div>
  </div>`,
  html`<div class="field">
    <div class="control">
      <a class="button is-primary" onclick=${() => emit('add feed', document.getElementById('feedUrl').value)}>
        Add
      </a>
    </div>
  </div>`,
  ];

  return html`<body>
  <nav class="navbar">
    <div class="navbar-brand">
      <a class="navbar-item" href="/">
        <h1 class="title">Feedaga</h1>
      </a>
    </div>
  </nav>

  <section class="section">
    <div class="container">
      ${view}
      ${
        appState.isLoadingFeeds
        ? html`<div class="columns">
          <div class="column">
            <h3 class="subtitle">Loading Feeds</h3>
            <div class="loader"></div>
          </div>
        </div>`
        : html`<div class="field">
          <div class="control">
            <a class="button is-info" onclick=${() => emit('load feeds')}>
              Check for New Entries
            </a>
          </div>
        </div>`
      }
      ${
        appState.isLoadingCache
        ? html`<div class="loader"></div>`
        : fullList(appState)
      }
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <div class="content">
        <p>
          Feedaga feed reader
        </p>
      </div>
    </div>
  </footer>
  </body>`
}