import store from 'store';
import RSSParser from 'rss-parser';

import cache from './cache';

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

  emitter.on('show cache', (callback = () => {}) => {
    appState.isLoadingCache = true;
    emitter.emit('render', () => {
      const { fullListPage, fullListPageSize } = appState;
      cache.entries.orderBy('pubDate').reverse()
        .offset(fullListPage * fullListPageSize)
        .toArray().then(entries => {
          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (!appState.feedsMostRecent.hasOwnProperty(entry.feed)) {
              appState.feedsMostRecent[entry.feed] = new Date(entry.pubDate);
            }
          }
          appState.displayedEntries = entries;
          appState.isLoadingCache = false;
          emitter.emit('render', callback);
        });
    });
  });

  emitter.on('load feeds', () => {
    appState.isLoadingFeeds = true;

    emitter.emit('render', () => {
      const storedFeeds = store.get('feeds');
      let loadProcess;
      if (!storedFeeds) {
        loadProcess = Promise.resolve();
      } else {
        loadProcess = new Promise((loadResolve, loadReject) => {
          const fetches = [];

          storedFeeds.forEach(feedURL => {
            if (!appState.feedsMostRecent.hasOwnProperty(feedURL)) {
              appState.feedsMostRecent[feedURL] = new Date(0);
            }

            const feedPromise = new Promise((feedResolve, feedReject) => {
              rss.parseURL(CORS_PROXY + feedURL, function (err, feed) {
                if (err) {
                  feedReject(err);
                } else {
                  console.log(feed);
                  const latestCached = appState.feedsMostRecent[feedURL];
                  for (let i = 0; i < feed.items.length; i++) {
                    const entry = feed.items[i];
                    const pubDate = new Date(entry.pubDate);
                    if (latestCached < pubDate) {
                      if (i === 0) {
                        appState.feedsMostRecent[feedURL] = pubDate;
                      }
                      
                      cache.entries.add({
                        feed: feedURL,
                        name: entry.title,
                        pubDate: pubDate,
                        author: entry.creator || entry['dc:creator'] || entry.author,
                        content: entry.content,
                        link: entry.link,
                        guid: entry.guid,
                      }).then(() => {
                        console.info('chached entry:', entry);
                      }).catch(error => {
                        console.error('cache add error:', error);
                      })
                    } else {
                      break;
                    }
                    // console.log(entry);
                  }
                  feedResolve();
                }
              });
            }).catch(error => {
              console.error('feed error:', error);
            });

            fetches.push(feedPromise);
          });

          Promise.all(fetches).then(() => {
            loadResolve();
          }).catch((rejection) => {
            console.error('fetches error:', rejection);
            loadReject(rejection);
          });
        });
      }
      
      loadProcess.then(() => {
        appState.isLoadingFeeds = false;
        emitter.emit('show cache');
      }).catch(rejection => {
        console.error('Overall load error:', rejection);
      });
    });
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
      emitter.emit('load feeds');
    }
  });
}