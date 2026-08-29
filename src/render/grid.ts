import type { WireTile } from '../wire'

export function buildGrid(
  tiles: readonly WireTile[],
  onToggle: (index: number, pressed: boolean) => void,
): HTMLDivElement {
  const grid = document.createElement('div')
  grid.className = 'grid'
  grid.setAttribute('role', 'group')
  grid.setAttribute('aria-label', 'Challenge tiles')

  tiles.forEach((tile, index) => {
    const button = document.createElement('button')
    button.className = 'tile'
    button.type = 'button'
    button.setAttribute('aria-pressed', 'false')
    button.setAttribute('aria-label', tile.label)
    button.innerHTML = `${tile.art}<span class="check"><span>&check;</span></span>`
    button.addEventListener('click', () => {
      const pressed = button.getAttribute('aria-pressed') !== 'true'
      button.setAttribute('aria-pressed', String(pressed))
      onToggle(index, pressed)
    })
    grid.append(button)
  })

  return grid
}
