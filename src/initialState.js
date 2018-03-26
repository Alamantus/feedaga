export default (state) => {
  state.fullListPage = 0;
  state.fullListPageSize = 30;
  state.displayedEntries = [];
  
  state.isLoadingCache = true;
  state.isLoadingFeeds = false;

  state.feedsMostRecent = {};
  
  state.views = {};

  return state;
}