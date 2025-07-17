import { Decoration, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { EditorView } from "@codemirror/view";

// URL regex that captures full URLs, excluding only quotes and angle brackets
const urlRegex = /\bhttps?:\/\/[^\s"'<>]+/g;

export function linkifyPlugin() {
  return ViewPlugin.fromClass(
    class {
      decorations;

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }

      buildDecorations(view: EditorView) {
        const decorations = [];

        for (let { from, to } of view.visibleRanges) {
          const text = view.state.doc.sliceString(from, to);
          let match;
          while ((match = urlRegex.exec(text))) {
            const start = from + match.index;
            const end = start + match[0].length;

            const deco = Decoration.mark({
              attributes: {
                style: "color: #9ece6a; text-decoration: underline; cursor: pointer;",
                onclick: `window.open('${match[0]}', '_blank')`,
              },
            });
            decorations.push(deco.range(start, end));
          }
        }

        return Decoration.set(decorations);
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}
