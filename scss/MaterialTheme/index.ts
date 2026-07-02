import { common } from '@mui/material/colors';
import shadow from './shadow';
import typography from './typography';

/**
 * Shared component overrides — colors reference the CSS design tokens
 * in scss/theme.scss, so a single set of overrides serves both themes.
 */
const components = {
	MuiTypography: {
		styleOverrides: {
			root: {
				letterSpacing: '0',
			},
		},
		defaultProps: {
			variantMapping: {
				h1: 'h1',
				h2: 'h2',
				h3: 'h3',
				h4: 'h4',
				h5: 'h5',
				h6: 'h6',
				subtitle1: 'p',
				subtitle2: 'p',
				subtitle3: 'p',
				body1: 'p',
				body2: 'p',
			},
		},
	},
	MuiLink: {
		styleOverrides: {
			root: {
				color: 'var(--text-2)',
				textDecoration: 'none',
			},
		},
	},
	MuiDivider: {
		styleOverrides: {
			root: {
				borderColor: 'var(--border-soft)',
			},
		},
	},
	MuiBox: {
		styleOverrides: {
			root: {
				padding: '0',
			},
		},
		makeStyles: {
			root: {
				padding: 0,
			},
		},
		sx: {
			'&.MuiBox-root': {
				component: 'div',
			},
		},
	},
	MuiContainer: {
		styleOverrides: {
			root: {
				maxWidth: 'inherit',
				padding: '0',
				'@media (min-width: 600px)': {
					paddingLeft: 0,
					paddingRight: 0,
				},
			},
		},
	},
	MuiCssBaseline: {
		styleOverrides: {
			html: { height: '100%' },
			body: { background: 'var(--bg-page)', height: '100%', minHeight: '100%' },
			p: {
				margin: '0',
			},
		},
	},
	MuiAvatar: {
		styleOverrides: {
			root: {
				marginLeft: '0',
			},
		},
	},
	MuiButton: {
		styleOverrides: {
			root: {
				color: 'var(--text-1)',
				minWidth: 'auto',
				lineHeight: '1.2',
				boxShadow: 'none',
				ButtonText: {
					color: 'var(--text-1)',
				},
			},
		},
	},
	MuiIconButton: {
		styleOverrides: {
			root: {},
		},
	},
	MuiListItemButton: {
		styleOverrides: {
			root: {
				padding: '0',
			},
		},
	},
	MuiList: {
		styleOverrides: {
			root: {
				padding: '0',
			},
		},
	},
	MuiListItem: {
		styleOverrides: {
			root: {
				MuiSelect: {
					backgroundColor: 'var(--surface-2)',
				},
				padding: '0',
			},
		},
	},
	MuiFormControl: {
		styleOverrides: {
			root: {
				width: '100%',
			},
		},
	},
	MuiFormControlLabel: {
		styleOverrides: {
			root: {
				marginRight: '0',
			},
		},
	},
	MuiSelect: {
		styleOverrides: {
			root: {},
			select: {
				textAlign: 'left',
			},
		},
	},
	MuiInputBase: {
		styleOverrides: {
			root: {
				input: {},
			},
		},
	},
	MuiOutlinedInput: {
		styleOverrides: {
			root: {
				height: '48px',
				width: '100%',
				backgroundColor: 'var(--surface)',
				input: {},
			},
			notchedOutline: {
				padding: '8px',
				top: '-9px',
				border: '1px solid var(--border-soft)',
			},
		},
	},
	MuiFormHelperText: {
		styleOverrides: {
			root: {
				margin: '5px 0 0 2px',
				lineHeight: '1.2',
			},
		},
	},
	MuiStepper: {
		styleOverrides: {
			root: {
				alignItems: 'center',
			},
		},
	},
	MuiTabPanel: {
		styleOverrides: {
			root: {
				padding: '0',
			},
		},
	},
	MuiSvgIcon: {
		styleOverrides: {
			root: {},
		},
	},
	MuiStepIcon: {
		styleOverrides: {
			root: {
				color: 'var(--surface)',
				borderRadius: '50%',
				border: '1px solid var(--border-soft)',
			},
			text: {
				fill: 'var(--text-4)',
			},
		},
	},
	MuiStepConnector: {
		styleOverrides: {
			line: {
				borderColor: 'var(--border-soft)',
			},
		},
	},
	MuiStepLabel: {
		styleOverrides: {
			label: {
				fontSize: '14px',
			},
		},
	},
	MuiCheckbox: {
		styleOverrides: {
			root: {
				'&.Mui-checked': {
					color: 'var(--text-1)',
				},
			},
		},
	},
	MuiFab: {
		styleOverrides: {
			root: {
				width: '40px',
				height: '40px',
				background: 'var(--surface)',
				color: 'var(--text-1)',
			},
			hover: {
				background: 'var(--surface)',
			},
		},
	},
	MuiPaper: {
		styleOverrides: {
			root: {
				MuiMenu: {
					boxShadow: 'rgb(145 158 171 / 24%) 0px 0px 2px 0px, rgb(145 158 171 / 24%) -20px 20px 40px -4px',
				},
			},
		},
	},
	MuiMenuItem: {
		styleOverrides: {
			root: {
				padding: '6px 8px',
			},
		},
	},
	MuiAlert: {
		styleOverrides: {
			root: {
				boxShadow: 'none',
			},
		},
	},
	MuiChip: {
		styleOverrides: {
			root: {
				border: '1px solid var(--border)',
				color: 'var(--text-1)',
			},
		},
	},
};

/**
 * LIGHT THEME (DEFAULT)
 */
export const light = {
	palette: {
		mode: 'light',
		background: {
			default: '#f4f6f8',
			paper: common.white,
		},
		primary: {
			contrastText: '#ffffff',
			main: '#E92C28',
		},
		secondary: {
			main: '#1646C1',
		},
		text: {
			primary: '#212121',
			secondary: '#616161',
			dark: common.black,
		},
		divider: '#eeeeee',
	},
	components,
	shadow,
	typography,
};

/**
 * DARK THEME
 */
export const dark = {
	palette: {
		mode: 'dark',
		background: {
			default: '#1e1b17',
			paper: '#272420',
		},
		primary: {
			contrastText: '#ffffff',
			main: '#E92C28',
		},
		secondary: {
			main: '#6B8AFD',
		},
		text: {
			primary: '#f2f0ec',
			secondary: '#cfcac2',
			dark: common.white,
		},
		divider: '#363129',
	},
	components,
	shadow,
	typography,
};
