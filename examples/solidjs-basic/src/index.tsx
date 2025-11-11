/* @refresh reload */
import { render } from 'solid-js/web';
import '@tendant/simple-idm-solid/styles';
import './styles.css';

import App from './App';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

render(() => <App />, root);
