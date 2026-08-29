export const STYLES = /* css */ `
  :host {
    display: inline-block;
  }

  /* Inherited properties (font, color, letter-spacing...) flow from the host
     into the shadow tree, and a host page can hit the host element with
     !important. Outer selectors can never match .card, so resetting here is
     the only airtight place to establish our own typography. */
  .card {
    all: initial;
    box-sizing: border-box;
    display: block;
    font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 14px;
    line-height: normal;
    color: #000;
    text-align: left;
    width: 320px;
    background: #fff;
    border: 1px solid #d3d3d3;
    border-radius: 3px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
    overflow: hidden;
  }

  .card *,
  .card *::before,
  .card *::after {
    box-sizing: border-box;
  }

  .header {
    background: #1a73e8;
    color: #fff;
    padding: 14px 16px 12px;
  }

  .prompt {
    font-size: 14px;
    line-height: 1.25;
  }

  .subject {
    font-size: 21px;
    font-weight: 500;
    line-height: 1.25;
    margin-top: 2px;
  }

  .hint {
    font-size: 12px;
    line-height: 1.3;
    margin-top: 8px;
    opacity: 0.85;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    padding: 8px;
    background: #fff;
  }

  .tile {
    all: unset;
    box-sizing: border-box;
    display: block;
    position: relative;
    aspect-ratio: 1;
    cursor: pointer;
    overflow: hidden;
    background: #f1f3f4;
    transition: transform 120ms ease;
  }

  .tile:focus-visible {
    outline: 3px solid #1a73e8;
    outline-offset: 2px;
  }

  .tile[aria-pressed="true"] {
    transform: scale(0.82);
  }

  .tile svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .check {
    position: absolute;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
  }

  .tile[aria-pressed="true"] .check {
    display: flex;
  }

  .check span {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #fff;
    color: #1a73e8;
    font-size: 18px;
    line-height: 28px;
    text-align: center;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  }

  .footer {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px;
    border-top: 1px solid #e0e0e0;
  }

  .icon {
    all: unset;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    cursor: pointer;
    color: #9aa0a6;
  }

  .icon:hover { background: #f1f3f4; color: #5f6368; }
  .icon:focus-visible { outline: 2px solid #1a73e8; outline-offset: 1px; }
  .icon svg { width: 20px; height: 20px; fill: currentColor; }

  .status {
    flex: 1;
    padding: 0 6px;
    font-size: 12px;
    line-height: 1.2;
  }

  .status.is-error { color: #d93025; }

  .verify {
    all: unset;
    box-sizing: border-box;
    display: inline-block;
    background: #1a73e8;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    padding: 9px 18px;
    border-radius: 2px;
    cursor: pointer;
  }

  .verify:hover { background: #1765cc; }
  .verify:focus-visible { outline: 2px solid #1a73e8; outline-offset: 2px; }
`
