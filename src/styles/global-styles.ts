/* eslint-disable @typescript-eslint/naming-convention */
import {createGlobalStyle} from 'styled-components';

const GlobalStyle = createGlobalStyle`
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		outline: 0;
		font-family: 'DM Sans';
	}

	body {
		background: #000000;
		color: #ffffff;
		-webkit-font-smoothing: antialiased;
		overflow-x: hidden;
	}

	button {
    cursor: pointer;
  }

	::-moz-selection {
		color: #000000;
		background: #ffffff;
	}
	::selection {
		color: #000000;
		background: #ffffff;
	}
`;

export default GlobalStyle;
