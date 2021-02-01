import { createStore, combineReducers } from 'redux';
import theDefaultReducer from './test';

const rootReducers = combineReducers({ theDefaultReducer });

const store = createStore(rootReducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

export default store;
