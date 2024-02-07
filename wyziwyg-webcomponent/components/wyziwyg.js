function getCaretPosition(component, editableDiv) {
    const selection = component.shadowRoot.getSelection();
    let offset;

    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        offset = range.startOffset;
        
        // const tempRange = document.createRange();
        // tempRange.selectNodeContents(editableDiv);
        // tempRange.setEnd(range.startContainer, range.startOffset);

        // const caretLineNumber = tempRange.toString().split('\n').length;

        // X
        console.log("Caret Position:", offset);
        // Y
        // console.log("Caret Line Number:", caretLineNumber);
    }

    return offset;
}

export class Wyziwyg extends HTMLElement {
    static tag = 'wyzi-wyg';

    /**
     * @param {KeyboardEvent} e 
     * @returns {void}
     */
    #onKeyDown_wysiwyg(e) {
        var target = e.target;
        var keyCode = e.keyCode;
        var key = e.key;
        var shift = e.shiftKey;
        var ctrl = e.ctrlKey;
        var alt = e.altKey;

        const wysiwygSelection = (() => {
                return {
                    focus: function() {
                        context.element.wysiwygWindow.document.body.focus();
                    },
                    isEdgePoint: function(container, offset) {
                        return (offset === 0) || (offset === container.nodeValue.length);
                    },
                    createRange: function() {
                        return context.element.wysiwygWindow.document.createRange();
                    },
                    getSelection: function() {
                        return context.element.wysiwygWindow.getSelection();
                    },
                    getPElementInFocusNode: function() {
                        var parentElement = context.argument._selectionNode;
                        while (!/^P$/i.test(parentElement.tagName) && !/^BODY$/i.test(parentElement.tagName)) {
                            parentElement = parentElement.parentNode;
                        }
                        return parentElement;
                    }
                }
            }
        )();

        console.log(keyCode, e.key);
        
        switch (key) {
            case 'Backspace':
                if (target.childElementCount === 1 && target.children[0].innerHTML === '<br>') {
                    e.preventDefault();
                    e.stopPropagation();

                    return false;
                }
                break;
            case 'Tab':
                e.preventDefault();
                e.stopPropagation();

                if (ctrl || alt)
                    break;

                const currentNode = wysiwygSelection.getPElementInFocusNode().parentNode;

                if (currentNode && /^TD$/i.test(currentNode.tagName)) {
                    const table = dom.getParentNode(currentNode, "table");
                    const cells = dom.getListChildren(table, dom.isCell);
                    const idx = shift ? dom.prevIdx(cells, currentNode) : dom.nextIdx(cells, currentNode);
                    if (idx === cells.length && !shift)
                        idx = 0;
                    if (idx === -1 && shift)
                        idx = cells.length - 1;
                    const moveCell = cells[idx];
                    if (!moveCell)
                        return false;
                    const range = wysiwygSelection.createRange();
                    range.setStart(moveCell, 0);
                    range.setEnd(moveCell, 0);
                    const selection = wysiwygSelection.getSelection();
                    if (selection.rangeCount > 0) {
                        selection.removeAllRanges();
                    }
                    selection.addRange(range);
                    break;
                }
                if (shift)
                    break;
                const tabText = context.element.wysiwygWindow.document.createTextNode(new Array(editor.tabSize + 1).join("\u00A0"));
                editor.insertNode(tabText);
                const selection = wysiwygSelection.getSelection();
                const rng = wysiwygSelection.createRange();
                rng.setStart(tabText, editor.tabSize);
                rng.setEnd(tabText, editor.tabSize);
                if (selection.rangeCount > 0) {
                    selection.removeAllRanges();
                }
                selection.addRange(rng);
                break;
        }
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        const defaultValue = this.getAttribute('value');

        this.shadowRoot.innerHTML = `
            <style>
                * {
                    text-align: left;
                }

                div {
                    min-width: 200px;
                    min-height: 400px;
                    resize: both;
                    border: 1px solid white;
                    padding: 5px;
                }
            </style>

            <h1>Hello Wyziwyg</h1>
            <div contenteditable="true" style="line-height: 1">
                <pre>${defaultValue}<p> tralala </p></pre>
            </div>
        `;
    }

    connectedCallback() {
        // const handler = (e) => {
        //     console.log(getCaretPosition(this, editable));

        //     console.log(isCaretOnFirstLine(editable))
        // }
        const editable = this.shadowRoot.querySelector('[contenteditable]');

        // editable.addEventListener('mouseup', handler);
        // editable.addEventListener('click', handler);
        editable.addEventListener('keydown', this.#onKeyDown_wysiwyg.bind(this));
    }

    disconnectedCallback() {
        const editable = this.shadowRoot.querySelector('[contenteditable]');

        editable.removeEventListener('keydown', this.#onKeyDown_wysiwyg.bind(this));
    }
}