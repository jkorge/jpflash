import { createRoot } from 'react-dom/client';

const api_url = 'https://jkorge.pythonanywhere.com';
const content = createRoot(document.getElementById('content'));

function render(id, component) {
    createRoot(document.getElementById(id)).render(component);
}

function navigate(pageComponent) {
    content.render(pageComponent);
}

export { render, navigate, api_url };