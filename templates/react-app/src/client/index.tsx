import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './landings/App';
import { Provider } from 'react-redux';
import store from './reducer/store';
// import './esri-config';

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
