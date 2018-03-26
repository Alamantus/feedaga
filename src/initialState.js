export default (state) => {
  state.isLoadingFeeds = true;

  state.feedsMostRecent = {};
  
  state.views = {};

  return state;
}