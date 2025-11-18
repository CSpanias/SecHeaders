async function loadPoCs() {
  try {
    const response = await fetch('/api/pocs');
    const pocs = await response.json();

    const grid = document.getElementById('pocGrid');
    if (!grid) return console.error('pocGrid element not found');

    grid.innerHTML = '';

    pocs.forEach(poc => {
      const card = document.createElement('div');
      card.className = 'bg-white p-6 rounded-xl shadow hover:shadow-lg transition';

      card.innerHTML = `
        <h2 class="text-xl font-semibold mb-2">${poc.title}</h2>
        <p class="text-gray-600 mb-4">${poc.description}</p>
        <a href="/headers/${poc.folder}/" class="inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Open PoC</a>
      `;

      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Failed to load PoCs:', error);
  }
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', loadPoCs);
