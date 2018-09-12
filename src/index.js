import React from 'react';
import ReactDOM from 'react-dom';
import Main from './main/index';
import './index.less';

let app = document.createElement('div');
document.body.appendChild(app);
ReactDOM.render(<Main />, app);