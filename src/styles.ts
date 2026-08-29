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
    /* Named, never fetched. A widget that loads a webfont from inside someone
       else's page is a privacy problem and dies to their CSP, so this only
       picks Inter up when the host already has it and otherwise lands on the
       platform UI face. */
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: normal;
    color: #000;
    text-align: left;
    width: 340px;
    background: #fff;
    border: 1px solid #e4e4e7;
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
    padding: 15px 16px 14px;
  }

  .prompt {
    color: rgba(255, 255, 255, 0.86);
    font-size: 13px;
    line-height: 1.3;
    letter-spacing: -0.005em;
  }

  .subject {
    font-size: 21px;
    font-weight: 600;
    line-height: 1.2;
    letter-spacing: -0.018em;
    margin-top: 3px;
  }

  .hint {
    color: rgba(255, 255, 255, 0.82);
    font-size: 12px;
    line-height: 1.35;
    margin-top: 9px;
  }

  /* Residue, not a callout. It sits on the card surface rather than inside the
     blue header, because the header is the captcha's own voice and this is
     supposed to read as something that leaked in. Hairline matches the footer
     rule so the strip belongs to the card rather than being bolted onto it. */
  .injection {
    padding: 9px 12px 10px;
    border-bottom: 1px solid #e4e4e7;
    color: #71717a;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 11px;
    line-height: 1.4;
    letter-spacing: -0.01em;
  }

  .injection[hidden] { display: none; }

  .grid {
    display: grid;
    grid-template-columns: repeat(var(--columns, 3), 1fr);
    grid-auto-rows: 1fr;
    gap: 4px;
    padding: 8px;
    background: #fff;
  }

  .tile {
    all: unset;
    box-sizing: border-box;
    display: block;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    background: #f4f4f5;
    transition: transform 140ms cubic-bezier(0.23, 1, 0.32, 1),
      background-color 140ms ease, color 140ms ease;
  }

  .tile:active { transform: scale(0.98); }

  .tile.is-art { aspect-ratio: 1; }

  /* Phrases are the tile now, so they get the readable treatment: selection is
     a fill and a colour flip rather than a badge sitting on top of artwork. */
  .tile.is-phrase {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 62px;
    padding: 10px 12px;
    border-radius: 4px;
    color: #18181b;
    font-size: 13px;
    line-height: 1.35;
    text-align: center;
    text-wrap: balance;
  }

  .tile.is-phrase[aria-pressed="true"] {
    background: #1a73e8;
    color: #fff;
  }

  .tile.is-phrase:active { transform: scale(0.98); }

  .tile:focus-visible {
    outline: 3px solid #1a73e8;
    outline-offset: 2px;
  }

  .tile.is-art[aria-pressed="true"] {
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

  .tile.is-art[aria-pressed="true"] .check {
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
    border-top: 1px solid #e4e4e7;
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

  .icon:hover { background: #f4f4f5; color: #52525b; }
  .icon:focus-visible { outline: 2px solid #1a73e8; outline-offset: 1px; }
  .icon svg { width: 20px; height: 20px; fill: currentColor; }

  .escape {
    padding: 0 8px 10px;
  }

  .link {
    all: unset;
    box-sizing: border-box;
    display: inline-block;
    padding: 4px 2px;
    color: #1a73e8;
    font-size: 12px;
    text-decoration: underline;
    cursor: pointer;
  }

  .link:focus-visible { outline: 2px solid #1a73e8; outline-offset: 2px; }

  .text-answer {
    padding: 26px 16px 30px;
  }

  /* 16px keeps iOS from zooming the page when the field takes focus. */
  .answer {
    all: unset;
    box-sizing: border-box;
    display: block;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e4e4e7;
    border-radius: 3px;
    font-family: inherit;
    font-size: 16px;
    color: #000;
  }

  .answer:focus-visible {
    border-color: #1a73e8;
    outline: 2px solid #1a73e8;
    outline-offset: -1px;
  }

  .panel {
    padding: 22px 18px 26px;
    color: #3f3f46;
    font-size: 13px;
    line-height: 1.55;
    white-space: pre-line;
  }

  .penance {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 34px 16px;
    color: #18181b;
    font-size: 56px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.03em;
  }

  .verify:disabled {
    background: #e4e4e7;
    color: #a1a1aa;
    cursor: not-allowed;
  }

  .tier-card {
    display: block;
    width: 100%;
    height: auto;
  }

  .ghost {
    all: unset;
    box-sizing: border-box;
    display: inline-block;
    color: #5f6368;
    font-size: 14px;
    padding: 9px 12px;
    border-radius: 2px;
    cursor: pointer;
  }

  .ghost:hover { background: #f4f4f5; }
  .ghost:focus-visible { outline: 2px solid #1a73e8; outline-offset: 2px; }

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
    letter-spacing: -0.005em;
    padding: 9px 18px;
    border-radius: 2px;
    cursor: pointer;
  }

  .verify:hover { background: #1765cc; }
  .verify:focus-visible { outline: 2px solid #1a73e8; outline-offset: 2px; }
`
