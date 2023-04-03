import type {GatsbyConfig} from 'gatsby';

const config: GatsbyConfig = {
	siteMetadata: {
		title: 'BlackElephant do Brasil',
		siteUrl: 'https://www.blackelephant.com.br/',
	},
	graphqlTypegen: true,
	plugins: [
		'gatsby-plugin-styled-components',
		// 'gatsby-plugin-google-gtag',
		'gatsby-plugin-image',
		'gatsby-plugin-sharp',
		'gatsby-transformer-sharp',
		'gatsby-plugin-netlify',
		'gatsby-plugin-react-helmet',
	],
};

export default config;
