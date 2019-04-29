import PropTypes from 'prop-types';
import createConnector from '../core/createConnector';
import {
  cleanUpValue,
  refineValue,
  getCurrentRefinementValue,
  getIndexId,
} from '../core/indexUtils';

function getId() {
  return 'query';
}

function getAdditionalId() {
  return 'additionalVoiceParameters';
}

function getCurrentRefinementQuery(props, searchState, context) {
  const id = getId();
  const currentRefinement = getCurrentRefinementValue(
    props,
    searchState,
    context,
    id,
    ''
  );

  if (currentRefinement) {
    return currentRefinement;
  }
  return '';
}

function getCurrentRefinementAdditional(props, searchState, context) {
  const id = getAdditionalId();
  const currentRefinement = getCurrentRefinementValue(
    props,
    searchState,
    context,
    id,
    ''
  );

  if (currentRefinement) {
    return currentRefinement;
  }
  return {};
}

function refine(props, searchState, nextRefinement, context) {
  const id = getId();
  const voiceParams = getAdditionalId();

  const nextValue = {
    [id]: nextRefinement,
    [voiceParams]:
      typeof props.additionalQueryParameters === 'function'
        ? {
            queryLanguages: props.language
              ? [props.language.split('-')[0]]
              : undefined,
            ignorePlurals: true,
            removeStopWords: true,
            optionalWords: nextRefinement,
            ...props.additionalQueryParameters({ query: nextRefinement }),
          }
        : {},
  };
  const resetPage = true;
  return refineValue(searchState, nextValue, context, resetPage);
}

function cleanUp(props, searchState, context) {
  const interimState = cleanUpValue(searchState, context, getId());
  return cleanUpValue(interimState, context, getAdditionalId());
}

export default createConnector({
  displayName: 'AlgoliaVoiceSearch',

  propTypes: {
    defaultRefinement: PropTypes.string,
  },

  getProvidedProps(props, searchState, searchResults) {
    return {
      currentRefinement: getCurrentRefinementQuery(
        props,
        searchState,
        this.context
      ),
      isSearchStalled: searchResults.isSearchStalled,
    };
  },

  refine(props, searchState, nextRefinement) {
    return refine(props, searchState, nextRefinement, this.context);
  },

  cleanUp(props, searchState) {
    return cleanUp(props, searchState, this.context);
  },

  getSearchParameters(searchParameters, props, searchState) {
    const query = getCurrentRefinementQuery(props, searchState, this.context);
    const additionalParams = getCurrentRefinementAdditional(
      props,
      searchState,
      this.context
    );

    return searchParameters
      .setQuery(query)
      .setQueryParameters(additionalParams);
  },

  getMetadata(props, searchState) {
    const id = getId(props);
    const currentRefinement = getCurrentRefinementQuery(
      props,
      searchState,
      this.context
    );
    return {
      id,
      index: getIndexId(this.context),
      items:
        currentRefinement === null
          ? []
          : [
              {
                label: `${id}: ${currentRefinement}`,
                value: nextState => refine(props, nextState, '', this.context),
                currentRefinement,
              },
            ],
    };
  },
});
