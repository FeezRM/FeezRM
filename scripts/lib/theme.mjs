// Palettes for the two rendered variants. Keys are identical so the renderer
// never branches on theme -- it just looks colours up.

export const THEMES = {
  dark: {
    name: 'dark',
    card: '#0b0f17',
    titlebar: '#131924',
    border: '#252d3b',
    shadow: '#000000',
    text: '#c9d1d9',
    dim: '#7d8796',
    faint: '#4c5566',
    user: '#a78bfa',
    path: '#58a6ff',
    green: '#3fb950',
    amber: '#d29922',
    cyan: '#56d4dd',
    cursor: '#a78bfa',
    mark: '#a78bfa',
    markAlt: '#58a6ff'
  },
  light: {
    name: 'light',
    card: '#ffffff',
    titlebar: '#f2f4f8',
    border: '#d5dbe3',
    shadow: '#0b0f17',
    text: '#1f2328',
    dim: '#5f6774',
    faint: '#9aa3b0',
    user: '#7c3aed',
    path: '#0969da',
    green: '#1a7f37',
    amber: '#9a6700',
    cyan: '#0d7c8a',
    cursor: '#7c3aed',
    mark: '#7c3aed',
    markAlt: '#0969da'
  }
};

// Traffic lights read the same on both themes.
export const LIGHTS = ['#ff5f57', '#febc2e', '#28c840'];
