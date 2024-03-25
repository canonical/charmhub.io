import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  code: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code }) => {
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      const cleanedCode = code.replace(/^```mermaid\n?|```$/g, "").trim();
      if (diagramRef.current) {
        try {
          const { svg } = await mermaid.render("mermaidId", cleanedCode);
          diagramRef.current.innerHTML = svg;
        } catch (error) {
          console.error("Mermaid diagram rendering error:", error);
        }
      }
    };

    renderDiagram();
  }, [code]);

  return <div ref={diagramRef} className="mermaid-diagram-container" />;
};

export default MermaidDiagram;
