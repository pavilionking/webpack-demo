import React from 'react';
import ReactDom from 'react-dom';

require('css/style.less');
import Hello from './components/hello.jsx';
ReactDom.render(<Hello />, document.getElementById('abc'));
