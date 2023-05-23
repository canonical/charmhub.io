import mermaid from "mermaid";

const START_SYNTAX = [
  "flowchart",
  "sequenceDiagram",
  "gantt",
  "classDiagram",
  "stateDiagram",
  "stateDiagram-v2",
  "erDiagram",
  "journey",
  "pie",
  "requirementDiagram",
  "gitGraph",
  "C4Context",
  "mindmap",
  "timeline",
  "pie",
  "graph",
];

async function renderSVG(block) {
  const codeSnippet = document.createElement("div");
  codeSnippet.className = "p-code-snippet";

  const content = block.innerText;
  const svg = await mermaid.render("diagram", content);

  codeSnippet.innerHTML = `<div class="p-code-snippet__header">
  <h5 class="p-code-snippet__title">Mermaid Diagram</h5>

  <div class="p-code-snippet__dropdowns">
    <select class="p-code-snippet__dropdown">
      <option value="rendered">Rendered</option>
      <option value="markup">Markup</option>
    </select>
  </div>
</div>

<div class="rendered" style="margin-top: 1rem">${svg}</div>
<div class="markup">${block.parentNode.outerHTML}</div>`;

  block.parentNode.parentNode.replaceChild(codeSnippet, block.parentNode);

  const rendered = codeSnippet.querySelector(".rendered");
  const markup = codeSnippet.querySelector(".markup");

  markup.style.display = "none";

  codeSnippet
    .querySelector(".p-code-snippet__dropdown")
    .addEventListener("change", (e) => {
      if (e.target.value === "rendered") {
        markup.style.display = "none";
        rendered.style.display = "block";
      } else {
        markup.style.display = "block";
        rendered.style.display = "none";
      }
    });
}

async function initMermaid() {
  const codeBlocks = document.querySelectorAll("#main-content pre code");
  const mermaidBlocks = Array.from(codeBlocks).filter((block) => {
    const firstLine = block.innerText.split("\n")[0];
    if (START_SYNTAX.includes(firstLine.split(" ")[0])) {
      return true;
    }
    return false;
  });
  if (mermaidBlocks) {
    mermaid.initialize({ startOnLoad: false });
    Promise.all(mermaidBlocks.map(renderSVG));
  }
}

export { initMermaid };
