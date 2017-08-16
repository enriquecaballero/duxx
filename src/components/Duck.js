/*
  - Duck.js
  Create a simple fetch-and-set reducer duck bundle without the boilerplating
*/

import createActions from "./createActions";
import createActionCreators from "./createActionCreators";

const initialState = {
  isFetching: false,
  data: null,
  error: null
};

export default class Duck {
  constructor (type, binding, transformer) {
    this.actions = createActions (type);
    this.actionCreators = createActionCreators (this.actions);
    this.binding = binding;
    this.transformer = transformer;
    this.initialState = this.bind (initialState);
  }
  bind = object => {
    return this.binding ? this.binding (object) : object;
  };
  bindReducerState = (binding, transformer) => {
    this.binding = binding;
    this.transformer = transformer;
    this.initialState = this.bind (initialState);
    return this;
  };
  fetch = (...options) => {
    const { request, success, failure } = this.actionCreators;
    return function () {
      return async dispatch => {
        dispatch (request ());
        try {
          let response = await fetch (...options);
          let data = await response.json ();
          dispatch (success (data));
        } catch (error) {
          dispatch (failure (error));
        }
      };
    };
  };
  reducer = (onSuccess, onError) => {
    return (state = this.initialState, action) => {
      if (this.transformer) state = this.transformer (state);
      switch (action.type) {
        case this.actions.request:
          return this.bind ({
            ...state,
            isFetching: true
          });
        case this.actions.success:
          return this.bind ({
            ...state,
            isFetching: false,
            data: onSuccess ? onSuccess (action.data) : action.data
          });
        case this.actions.failure:
          return this.bind ({
            ...state,
            isFetching: false,
            error: onError ? onError (action.error) : action.error
          });
        default:
          return this.bind (state);
      }
    };
  };
}
