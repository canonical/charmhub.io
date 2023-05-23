import mermaid from "mermaid";

// We don't get the "mermaid" code block id through
// so be really hacky about it
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

// Render each SVG and add events for the dropdown
async function renderSVG(block, index) {
  const codeSnippet = document.createElement("div");
  codeSnippet.className = "p-code-snippet";

  const content = block.innerText;
  const { svg } = await mermaid.render(`diagram-${index}`, content);

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

  console.log(codeSnippet);

  const rendered = codeSnippet.querySelector(".rendered");
  const markup = codeSnippet.querySelector(".markup");

  // immediately hide the original markup block
  markup.style.display = "none";

  codeSnippet
    .querySelector(".p-code-snippet__dropdown")
    .addEventListener("change", (e) => {
      // Simple switch
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
  // Get all code blocks that are in the main content of the site
  const codeBlocks = document.querySelectorAll("#main-content pre code");
  const mermaidBlocks = Array.from(codeBlocks).filter((block) => {
    // Get the first line of the inner code
    const firstLine = block.innerText.split("\n")[0];
    // Get the first word and match it against the predefined list
    if (START_SYNTAX.includes(firstLine.split(" ")[0].trim())) {
      return true;
    }
    return false;
  });

  // Only if we have some blocks should we do anything
  if (mermaidBlocks) {
    mermaid.initialize({ startOnLoad: false, securityLevel: "antiscript" });
    Promise.all(mermaidBlocks.map((block, index) => renderSVG(block, index)));
  }
}

export { initMermaid };
