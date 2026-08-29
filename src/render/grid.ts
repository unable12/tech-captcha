import type { WireTile } from '../wire'

export function buildGrid(
  tiles: readonly WireTile[],
  columns: number,
  onToggle: (index: number, pressed: boolean) => void,
): HTMLDivElement {
  const grid = document.createElement('div')
  grid.className = 'grid'
  grid.style.setProperty('--columns', String(columns))
  grid.setAttribute('role', 'group')
  grid.setAttribute('aria-label', 'Challenge tiles')

  tiles.forEach((tile, index) => {
    const button = document.createElement('button')
    button.className = tile.text === undefined ? 'tile is-art' : 'tile is-phrase'
    button.type = 'button'
    button.setAttribute('aria-pressed', 'false')
    button.setAttribute('aria-label', tile.label)

    if (tile.text === undefined) {
      button.innerHTML = `${tile.art}<span class="check"><span>&check;</span></span>`
    } else {
      button.textContent = tile.text
    }

    button.addEventListener('click', () => {
      const pressed = button.getAttribute('aria-pressed') !== 'true'
      button.setAttribute('aria-pressed', String(pressed))
      onToggle(index, pressed)
    })
    grid.append(button)
  })

  return grid
}
