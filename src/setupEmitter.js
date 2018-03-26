import store from 'store';
import RSSParser from 'rss-parser';

// import feedCache from './feedCache';

const rss = new RSSParser();
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

export default (appState, emitter) => {
  emitter.on('render', (callback = () => {}) => {
    // Dirty hack to get the callback to call *after* re-rendering.
    setTimeout(() => {
      console.log('appState:', appState);
      callback();
    }, 50);
  });

  emitter.on('load feeds', () => {
    const storedFeeds = store.get('feeds');
    let loadProcess;
    if (!storedFeeds) {
      loadProcess = Promise.resolve();
    } else {
      loadProcess = new Promise((resolve, reject) => {
        const fetches = [];
        storedFeeds.forEach(feedURL => {
          if (!appState.feedsMostRecent.hasOwnProperty(feedURL)) {
            appState.feedsMostRecent[feedURL] = new Date(0);
          }
          const feedPromise = new Promise((resolve, reject) => {
            rss.parseURL(CORS_PROXY + feedURL, function (err, feed) {
              if (err) {
                reject(err);
              } else {
                console.log(feed);
                for (let i = 0; i < feed.items.length; i++) {
                  const entry = feed.items[i];
                  const pubDate = new Date(entry.pubDate);
                  if (i === 0) {
                    if (appState.feedsMostRecent[feedURL] < pubDate) {
                      appState.feedsMostRecent[feedURL] = pubDate;
                    } else {
                      break;
                    }
                  }
                  console.log(entry);
                }
                resolve();
              }
            })
          });
          fetches.push(feedPromise);
        });
        Promise.all(fetches).then(() => {
          resolve();
        });
      });
    }
    
    loadProcess.then(() => {
      appState.isLoadingFeeds = false;
      emitter.emit('render');
    })
  });

  emitter.on('add feed', (feedURL) => {
    if (feedURL && feedURL !== '') {
      const storedFeeds = store.get('feeds');
      let feeds;
      if (!storedFeeds) {
        feeds = new Set();
      } else {
        feeds = new Set(storedFeeds);
      }
      feeds.add(feedURL);
      store.set('feeds', Array.from(feeds));
    }
  });
}