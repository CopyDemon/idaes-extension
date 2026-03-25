import { useContext, useEffect, useRef } from "react";
import { AppContext } from "../context";
import mermaid from "mermaid";
import { postReloadMermaidDone } from '../util/post_message';
import css from '../css/mermaid.module.css';

export default function Mermaid() {
    const { flowsheetRunnerResult, activateFileName } = useContext(AppContext);
    const mermaidRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // initial mermaid
        mermaid.initialize({ startOnLoad: false, theme: 'dark' });

    }, []);

    useEffect(() => {
        // no mermaid ref found
        if (!mermaidRef.current) return;

        // no diagram found
        if (
            !flowsheetRunnerResult ||
            !flowsheetRunnerResult.actions.mermaid_diagram ||
            !flowsheetRunnerResult.actions.mermaid_diagram.diagram
        ) {
            mermaidRef.current.innerHTML = `
            <p style="color: #888;">
                Please check the idaes runner result, look like it doesn't contain mermaid diagram.
            </p>`;
            postReloadMermaidDone({ reload_mermaid: 'done' });
            return;
        }

        // get diagram from flowsheet runner result
        const mermaidDiagram = flowsheetRunnerResult.actions.mermaid_diagram.diagram;

        // Normalize: handle both array and comma-separated string
        const lines = mermaidDiagram;

        // Filter out empty strings
        const filteredDiagram = lines.filter((line: string) => line.trim() !== '');

        // Check if there's actual content beyond just the direction declaration
        if (filteredDiagram.length <= 1) {
            console.log('mermaid diagram has no actual content (no nodes/edges)');
            mermaidRef.current.innerHTML = `
            <p style="color: #888;">
                No diagram data available for this flowsheet.<br/>
                Extension returned Mermaid content is: ${filteredDiagram.join(', ')}
            </p>`;
            postReloadMermaidDone({ reload_mermaid: 'done' });
            return;
        }

        const diagramText = filteredDiagram.join('\n');
        console.log(`mermaid diagram text:\n${diagramText}`);

        // Use mermaid.render() for more reliable SVG generation
        const renderDiagram = async () => {
            try {
                const { svg } = await mermaid.render('mermaid-diagram', diagramText);
                if (mermaidRef.current) {
                    mermaidRef.current.innerHTML = svg;
                }
            } catch (error) {
                console.error('mermaid render error:', error);
                if (mermaidRef.current) {
                    mermaidRef.current.innerHTML = `
                    <p style="color: #f88;">Mermaid render error: ${error}</p>
                    <pre style="color: #888; font-size: 12px;">${diagramText}</pre>`;
                }
            }
        };
        renderDiagram();
        postReloadMermaidDone({ reload_mermaid: 'done' });

    }, [flowsheetRunnerResult]);

    return (
        <div className={`${css.mermaid_container}`}>
            <p className={`${css.mermaid_title}`}>Diagram for: {activateFileName}</p>
            {/* Leave this div empty — mermaid.run() will inject the SVG via innerHTML */}
            <div className={`${css.diagram_container}`}>
                <div ref={mermaidRef} className={`${css.diagram}`}></div>
            </div>
        </div>
    );
}

