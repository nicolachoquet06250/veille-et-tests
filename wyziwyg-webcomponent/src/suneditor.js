if (typeof window.SUNEDITOR == 'undefined') window.SUNEDITOR = {};

SUNEDITOR.defaultLang = {
    toolbar: {
        fontFamily: 'Font',
        fontFamilyDelete: 'Remove Font Family',
        formats: 'Formats',
        bold: 'Bold',
        underline: 'Underline',
        italic: 'Italic',
        strike: 'Strike',
        fontColor: 'Font Color',
        hiliteColor: 'Background Color',
        indent: 'Indent',
        outdent: 'Outdent',
        align: 'Align',
        alignLeft: 'Align left',
        alignRight: 'Align right',
        alignCenter: 'Align center',
        justifyFull: 'Justify full',
        left: 'Left',
        right: 'Right',
        center: 'Center',
        bothSide: 'Justify full',
        list: 'list',
        orderList: 'Ordered list',
        unorderList: 'Unordered list',
        line: 'Line',
        table: 'Table',
        link: 'Link',
        image: 'Picture',
        video: 'Video',
        fullScreen: 'Full Screen',
        htmlEditor: 'Code View'
    },
    dialogBox: {
        linkBox: {
            title: 'Insert Link',
            url: 'URL to link',
            text: 'Text to display'
        },
        imageBox: {
            title: 'Insert Image',
            file: 'Select from files',
            url: 'Image URL',
            resize100: 'resize 100%',
            resize75: 'resize 75%',
            resize50: 'resize 50%',
            resize25: 'resize 25%',
            remove: 'remove image'
        },
        videoBox: {
            title: 'Insert Video',
            url: 'Media embed URL, YouTube',
            width: 'Width',
            height: 'Height'
        },
        submitButton: 'Submit'
    }
};

(() => {
        const func = {
            returnTrue: () => true
        };
        const dom = (() => ({
            getArrayIndex(array, element) {
                let idx = -1;
                for (let i = 0; i < array.length; i++) {
                    if (array[i] === element) {
                        idx = i;
                        break;
                    }
                }
                return idx;
            },
            nextIdx(array, item) {
                const idx = this.getArrayIndex(array, item);
                if (idx === -1)
                    return -1;
                return idx + 1;
            },
            prevIdx(array, item) {
                const idx = this.getArrayIndex(array, item);
                if (idx === -1)
                    return -1;
                return idx - 1;
            },
            isCell: (node) => node && /^TD$|^TH$/i.test(node.nodeName),
            getListChildren(element, validation = (...args) => {}) {
                const children = [];
                validation = validation || func.returnTrue;
                (function recursionFunc(current) {
                        if (element !== current && validation(current)) {
                            children.push(current);
                        }
                        for (let i = 0, len = current.children.length; i < len; i++) {
                            recursionFunc(current.children[i]);
                        }
                    }
                )(element);
                return children;
            },
            getParentNode(element, tagName) {
                const check = new RegExp("^" + tagName + "$","i");
                while (!check.test(element.tagName)) {
                    element = element.parentNode;
                }
                return element;
            },
            changeTxt(element, txt) {
                element.textContent = txt;
            },
            changeClass(element, className) {
                element.className = className;
            },
            addClass(element, className) {
                if (!element) return;
                const check = new RegExp("(\\s|^)" + className + "(\\s|$)");
                if (check.test(element.className)) return;
                element.className += ` ${className}`;
            },
            removeClass(element, className) {
                if (!element) return;
                const check = new RegExp("(\\s|^)" + className + "(\\s|$)");
                element.className = element.className.replace(check, " ").trim();
            },
            toggleClass(element, className) {
                const check = new RegExp("(\\s|^)" + className + "(\\s|$)");
                element.className = check.test(element.className)
                    ? element.className.replace(check, " ").trim()
                    : element.className + ` ${className}`;
            }
        }))();
        const core = (context) => {
            const list = (() => {
                    const commandMap = {
                        'FONT': context.tool.fontFamily,
                        'B': context.tool.bold,
                        'U': context.tool.underline,
                        'I': context.tool.italic,
                        'STRIKE': context.tool.strike
                    };
                    const fontFamilyMap = {};

                    let list_fontFamily = context.tool.list_fontFamily.children;
                    list_fontFamily[0].firstChild.dataset.value;

                    for (let i = 0; i < list_fontFamily.length; i++) {
                        fontFamilyMap[
                            list_fontFamily[i].firstChild.dataset.value
                                .replace(/\s*/g, "")
                        ] = list_fontFamily[i].firstChild.dataset.txt;
                    }

                    if (context.tool.list_fontFamily_add) {
                        list_fontFamily = context.tool.list_fontFamily_add.children;
                        for (let i = 0; i < list_fontFamily.length; i++) {
                            fontFamilyMap[
                                list_fontFamily[i].firstChild.dataset.value
                                    .replace(/\s*/g, "")
                            ] = list_fontFamily[i].firstChild.dataset.txt;
                        }
                    }
                    list_fontFamily = null;

                    return {commandMap, fontFamilyMap}
                }
            )();
            const wysiwygSelection = (() => ({
                focus: () => context.element.wysiwygWindow.document.body.focus(),
                isEdgePoint: (container, offset) =>  (offset === 0) || (offset === container.nodeValue.length),
                createRange: () => context.element.wysiwygWindow.document.createRange(),
                getSelection: () => context.element.wysiwygWindow.getSelection(),
                getPElementInFocusNode() {
                    let parentElement = context.argument._selectionNode;
                    while (!/^P$/i.test(parentElement.tagName) && !/^BODY$/i.test(parentElement.tagName)) {
                        parentElement = parentElement.parentNode;
                    }
                    return parentElement;
                }
            }))();
            const editor = (function() {
                return {
                    subMenu: null,
                    originSub: null,
                    modalForm: null,
                    tabSize: 4,
                    pure_execCommand(command, showDefaultUI, value) {
                        context.element.wysiwygWindow.document.execCommand(command, showDefaultUI, value);
                    },
                    cancel_table_picker() {
                        context.tool.tableHighlight.style.width = "1em";
                        context.tool.tableHighlight.style.height = "1em";
                        context.tool.tableUnHighlight.style.width = "5em";
                        context.tool.tableUnHighlight.style.height = "5em";
                        dom.changeTxt(context.tool.tableDisplay, "1 x 1");
                    },
                    subOff() {
                        if (this.subMenu) {
                            this.subMenu.style.display = "none";
                            this.subMenu = null;
                            this.cancel_table_picker();
                        }
                        if (this.modalForm) {
                            this.modalForm.style.display = "none";
                            context.dialog.back.style.display = "none";
                            context.dialog.modalArea.style.display = "none";
                        }
                        if (context.argument._imageElement) {
                            event.cancel_resize_image();
                        }
                    },
                    toggleFrame() {
                        if (!context.argument._wysiwygActive) {
                            const ec = {
                                "&amp;": "&",
                                "&nbsp;": "\u00A0",
                                "&quot;": "\"",
                                "&lt;": "<",
                                "&gt;": ">"
                            };
                            const source_html = context.element.source.value.replace(/&[a-z]+;/g, (m) => (typeof ec[m] === "string") ? ec[m] : m);
                            context.element.wysiwygWindow.document.body.innerHTML = source_html.trim().length > 0 ? source_html : "<p>&#65279</p>";
                            context.element.wysiwygWindow.document.body.scrollTop = 0;
                            context.element.source.style.display = "none";
                            context.element.wysiwygElement.style.display = "block";
                            context.argument._wysiwygActive = true;
                        } else {
                            context.element.source.value = context.element.wysiwygWindow.document.body.innerHTML.trim();
                            context.element.wysiwygElement.style.display = "none";
                            context.element.source.style.display = "block";
                            context.argument._wysiwygActive = false;
                        }
                    },
                    toggleFullScreen(element) {
                        if (!context.argument._isFullScreen) {
                            context.element.topArea.style.position = "fixed";
                            context.element.topArea.style.top = "0";
                            context.element.topArea.style.left = "0";
                            context.element.topArea.style.width = "100%";
                            context.element.topArea.style.height = "100%";
                            context.argument._innerHeight_fullScreen = (window.innerHeight - context.tool.bar.offsetHeight);
                            context.element.editorArea.style.height = context.argument._innerHeight_fullScreen + "px";
                            dom.removeClass(element.firstElementChild, 'ico_full_screen_e');
                            dom.addClass(element.firstElementChild, 'ico_full_screen_i');
                        } else {
                            context.element.topArea.style.cssText = context.argument._originCssText;
                            context.element.editorArea.style.height = context.argument._innerHeight + "px";
                            dom.removeClass(element.firstElementChild, 'ico_full_screen_i');
                            dom.addClass(element.firstElementChild, 'ico_full_screen_e');
                        }
                        context.argument._isFullScreen = !context.argument._isFullScreen;
                    },
                    appendHr(value) {
                        const borderStyle = (() => {
                            switch (value) {
                                case 'hr1':return 'black 1px solid';
                                case 'hr2':return 'black 1px dotted';
                                case 'hr3':return 'black 1px dashed';
                                default:return '';
                            }
                        })();

                        const oHr = document.createElement("HR");
                        oHr.style.border = "black 0px none";
                        oHr.style.borderTop = borderStyle;
                        oHr.style.height = "1px";

                        context.argument._selectionNode.parentNode.appendChild(oHr);

                        editor.appendP(oHr);
                    },
                    appendTable(x, y) {
                        const oTable = document.createElement('table');
                        let tableHTML = '<tbody>';
                        while (y > 0) {
                            tableHTML += '<tr>';

                            let tdCnt = x;
                            while (tdCnt > 0) {
                                tableHTML += '<td><p>&#65279</p></td>';
                                --tdCnt;
                            }

                            tableHTML += '</tr>';
                            --y;
                        }
                        tableHTML += '</tbody>';
                        oTable.innerHTML = tableHTML;
                        editor.insertNode(oTable);
                        editor.appendP(oTable);
                    },
                    appendP(element) {
                        const oP = document.createElement("p");
                        oP.innerHTML = '&#65279';

                        element.parentNode.insertBefore(oP, element.nextElementSibling);
                    },
                    openDialog(kind) {
                        const focusText = (() => {
                            switch (kind) {
                                case 'link':
                                    this.modalForm = context.dialog.link;
                                    return context.dialog.linkText;
                                case 'image':
                                    this.modalForm = context.dialog.image;
                                    return context.dialog.imgInputUrl;
                                case 'video':
                                    this.modalForm = context.dialog.video;
                                    return context.dialog.videoInputUrl;
                                default:
                                    return null;
                            }
                        })();

                        context.dialog.modalArea.style.display = "block";
                        context.dialog.back.style.display = "block";
                        context.dialog.modal.style.display = "block";

                        this.modalForm.style.display = "block";
                        this.subMenu = context.dialog.modal;

                        focusText === null && console.warn(`focusText is null (at core.editor.openDialog())`)
                        focusText?.focus();
                    },
                    showLoading() {
                        context.element.loading.style.display = "block";
                    },
                    closeLoading() {
                        context.element.loading.style.display = "none";
                    },
                    insertNode(oNode) {
                        let selection = wysiwygSelection.getSelection();
                        let nativeRng = null;

                        if (selection.rangeCount > 0) {
                            nativeRng = selection.getRangeAt(0);
                        } else {
                            selection = context.argument._copySelection;
                            nativeRng = wysiwygSelection.createRange();
                            nativeRng.setStart(selection.focusNode, selection.anchorOffset);
                            nativeRng.setEnd(selection.focusNode, selection.focusOffset);
                        }

                        const startCon = nativeRng.startContainer;
                        const startOff = nativeRng.startOffset;
                        const endCon = nativeRng.endContainer;
                        const endOff = nativeRng.endOffset;
                        const pNode = /^#text$/i.test(startCon.nodeName) ? startCon.parentNode : startCon;

                        if (startCon === endCon && startOff === endOff) {
                            if (/^#text$/i.test(selection.focusNode.nodeName)) {
                                pNode.insertBefore(oNode, selection.focusNode.splitText(endOff));
                            } else {
                                if (/^BR$/i.test(pNode.lastChild.nodeName)) {
                                    pNode.removeChild(pNode.lastChild);
                                }
                                pNode.appendChild(oNode);
                            }
                        } else {
                            let removeNode = startCon;
                            let rightNode = null;

                            const isSameContainer = startCon === endCon;
                            if (isSameContainer) {
                                if (!wysiwygSelection.isEdgePoint(endCon, endOff)) {
                                    rightNode = endCon.splitText(endOff);
                                }
                                if (!wysiwygSelection.isEdgePoint(startCon, startOff)) {
                                    removeNode = startCon.splitText(startOff);
                                }
                                pNode.removeChild(removeNode);
                            } else {
                                const nodes = [];
                                let container = startCon;
                                while (container.nodeType === 3 && !(endCon === container)) {
                                    nodes.push(container);
                                    container = container.nextSibling;
                                }
                                nodes.push(container);

                                for (const node of nodes) {
                                    pNode.removeChild(node);
                                }
                            }
                            pNode.insertBefore(oNode, rightNode);
                        }
                    }
                };
            })();
            const event = (() => {
                    const resize_window = () => {
                        if (context.argument._isFullScreen) {
                            context.argument._innerHeight_fullScreen += ((context.tool.barHeight - context.tool.bar.offsetHeight) + (this.innerHeight - context.argument._windowHeight));
                            context.element.editorArea.style.height = context.argument._innerHeight_fullScreen + "px";
                        }
                        context.tool.barHeight = context.tool.bar.offsetHeight;
                        context.argument._windowHeight = this.innerHeight;
                    };
                    const onClick_toolbar = (e) => {
                        let targetElement = e.target;
                        let display = targetElement.getAttribute("data-display");
                        let command = targetElement.getAttribute("data-command");
                        let className = targetElement.className;
                        e.preventDefault();
                        e.stopPropagation();
                        wysiwygSelection.focus();
                        while (!command && !display && !/layer_color|layer_url|editor_tool/.test(className) && !/^BODY$/i.test(targetElement.tagName)) {
                            targetElement = targetElement.parentNode;
                            command = targetElement.getAttribute("data-command");
                            display = targetElement.getAttribute("data-display");
                            className = targetElement.className;
                        }
                        let value = targetElement.getAttribute("data-value");
                        const txt = targetElement.getAttribute("data-txt");
                        if (display || /^BODY$/i.test(targetElement.tagName)) {
                            let nextSibling = editor.subMenu;
                            editor.subOff();
                            if (targetElement.nextElementSibling != null && targetElement.nextElementSibling !== nextSibling) {
                                editor.subMenu = targetElement.nextElementSibling;
                                editor.subMenu.style.display = "block";
                                editor.originSub = editor.subMenu.previousElementSibling;
                            } else if (/modal/.test(display)) {
                                editor.openDialog(command);
                            }
                            nextSibling = null;
                            return;
                        }
                        if (/layer_color/.test(className) && /^BUTTON$/i.test(e.target.tagName)) {
                            value = e.target.textContent;
                        }
                        if (command) {
                            if (/fontName/.test(command)) {
                                dom.changeTxt(editor.originSub.firstElementChild, txt);
                                editor.pure_execCommand(command, false, value);
                            } else if (/format/.test(command)) {
                                editor.pure_execCommand("formatBlock", false, value);
                            } else if (/justifyleft|justifyright|justifycenter|justifyfull/.test(command)) {
                                dom.changeTxt(editor.originSub.firstElementChild, targetElement.title.split(" ")[0]);
                                editor.pure_execCommand(command, false);
                            } else if (/foreColor|hiliteColor/.test(command)) {
                                editor.pure_execCommand(command, false, value);
                            } else if (/horizontalRules/.test(command)) {
                                editor.appendHr(value);
                            } else if (/sorceFrame/.test(command)) {
                                editor.toggleFrame();
                                dom.toggleClass(targetElement, 'on');
                            } else if (/fullScreen/.test(command)) {
                                editor.toggleFullScreen(targetElement);
                                dom.toggleClass(targetElement, "on");
                            } else if (/indent|outdent/.test(command)) {
                                editor.pure_execCommand(command, false);
                            } else if (/insertTable/.test(command)) {
                                editor.appendTable(context.argument._tableXY[0], context.argument._tableXY[1]);
                            } else {
                                editor.pure_execCommand(command, false, value);
                                dom.toggleClass(targetElement, "on");
                            }
                            editor.subOff();
                        }
                    };
                    const onMouseDown_wysiwyg = (e) => {
                        const targetElement = e.target;
                        editor.subOff();
                        if (/^IMG$/i.test(targetElement.nodeName)) {
                            targetElement.setAttribute('unselectable', 'on');
                            targetElement.contentEditable = false;
                            const resizeDiv = context.element.imageResizeDiv;
                            const w = targetElement.offsetWidth;
                            const h = targetElement.offsetHeight;
                            let parentElement = targetElement.offsetParent;
                            let parentT = 1;
                            let parentL = 1;
                            while (parentElement) {
                                parentT += (parentElement.offsetTop + parentElement.clientTop);
                                parentL += (parentElement.offsetLeft + +parentElement.clientLeft);
                                parentElement = parentElement.offsetParent;
                            }
                            context.argument._imageResize_parent_t = (context.tool.bar.offsetHeight + parentT);
                            context._imageResize_parent_l = parentL;
                            const t = (targetElement.offsetTop + context.argument._imageResize_parent_t - context.element.wysiwygWindow.document.body.scrollTop);
                            const l = (targetElement.offsetLeft + parentL);
                            resizeDiv.style.top = t + "px";
                            resizeDiv.style.left = l + "px";
                            resizeDiv.style.width = w + "px";
                            resizeDiv.style.height = h + "px";
                            context.element.imageResizeBtn.style.top = (h + t) + "px";
                            context.element.imageResizeBtn.style.left = l + "px";
                            dom.changeTxt(context.element.imageResizeDisplay, w + " x " + h);
                            context.argument._imageElement = targetElement;
                            context.argument._imageElement_w = w;
                            context.argument._imageElement_h = h;
                            context.argument._imageElement_t = t;
                            context.argument._imageElement_l = l;
                            context.element.imageResizeDiv.style.display = "block";
                            context.element.imageResizeBtn.style.display = "block";
                        } else if (/^HTML$/i.test(targetElement.nodeName)) {
                            wysiwygSelection.focus();
                        }
                    };
                    function copyObj(obj) {
                        const copy = {};
                        for (const attr in obj) {
                            copy[attr] = obj[attr];
                        }
                        return copy;
                    }
                    const onSelectionChange_wysiwyg = () => {
                        context.argument._copySelection = copyObj(wysiwygSelection.getSelection());
                        context.argument._selectionNode = wysiwygSelection.getSelection().anchorNode;
                        let selectionParent = context.argument._selectionNode;
                        let selectionNodeStr = "";
                        let fontFamily = context.tool.default_fontFamily;
                        while (!/^P$|^BODY$|^HTML$/i.test(selectionParent.nodeName)) {
                            selectionNodeStr += selectionParent.nodeName + "|";
                            if (/^FONT$/i.test(selectionParent.nodeName) && selectionParent.face.length > 0) {
                                const selectFont = list.fontFamilyMap[selectionParent.face.replace(/\s*/g, "")];
                                fontFamily = (selectFont ? selectFont : fontFamily);
                                break;
                            }
                            selectionParent = selectionParent.parentNode;
                        }
                        if (/^SPAN$/i.test(selectionParent.nodeName)) {
                            for (let i = 0; i < selectionParent.children.length; i++) {
                                selectionNodeStr += selectionParent.children[i].tagName;
                            }
                        }
                        const onNode = selectionNodeStr.split("|");
                        let map = "B|U|I|STRIKE|FONT|";
                        for (let i = 0; i < onNode.length - 1; i++) {
                            const nodeName = (/^STRONG$/.test(onNode[i]) ? 'B' : (/^EM/.test(onNode[i]) ? 'I' : onNode[i]));
                            if (/^FONT$/i.test(nodeName)) {
                                dom.changeTxt(list.commandMap[nodeName], fontFamily);
                            } else {
                                dom.addClass(list.commandMap[nodeName], "on");
                            }
                            map = map.replace(nodeName + "|", "");
                        }
                        map = map.split("|");
                        for (let i = 0; i < map.length - 1; i++) {
                            if (/^FONT$/i.test(map[i])) {
                                dom.changeTxt(list.commandMap[map[i]], fontFamily);
                            } else {
                                dom.removeClass(list.commandMap[map[i]], "on");
                            }
                        }
                    };
                    const onKeyDown_wysiwyg = (e) => {
                        const target = e.target;
                        const keyCode = e.keyCode;
                        const shift = e.shiftKey;
                        const ctrl = e.ctrlKey;
                        const alt = e.altKey;
                        switch (keyCode) {
                            case 8:
                                if (target.childElementCount === 1 && target.children[0].innerHTML === "<br>") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    return false;
                                }
                                break;
                            case 9:
                                e.preventDefault();
                                e.stopPropagation();
                                if (ctrl || alt)
                                    break;
                                const currentNode = wysiwygSelection.getPElementInFocusNode().parentNode;
                                if (currentNode && /^TD$/i.test(currentNode.tagName)) {
                                    const table = dom.getParentNode(currentNode, "table");
                                    const cells = dom.getListChildren(table, dom.isCell);
                                    let idx = shift ? dom.prevIdx(cells, currentNode) : dom.nextIdx(cells, currentNode);
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
                    };
                    const onScroll_wysiwyg = () => {
                        if (context.argument._imageElement) {
                            const t = (context.argument._imageElement.offsetTop + context.argument._imageResize_parent_t - context.element.wysiwygWindow.scrollY);
                            context.element.imageResizeDiv.style.top = t + "px"
                            context.element.imageResizeBtn.style.top = (t + context.argument._imageElement_h) + "px";
                        }
                    };
                    const onClick_dialog = (e) => {
                        if (/modal-dialog/.test(e.target.className) || /close/.test(e.target.getAttribute("data-command"))) {
                            editor.subOff();
                        }
                    };
                    const onChange_imgInput = () => {
                        try {
                            if (this.files && this.files[0]) {
                                editor.showLoading();
                                editor.subOff();
                                const reader = new FileReader();
                                reader.onload = function() {
                                    try {
                                        context.argument._imageFileSrc = reader.result;
                                        const oImg = document.createElement("IMG");
                                        oImg.src = context.dialog.imgInputUrl.value.trim().length > 0 ? context.dialog.imgInputUrl.value : context.argument._imageFileSrc;
                                        oImg.style.width = context.user.imageSize;
                                        editor.insertNode(oImg);
                                        context.argument._imageFileSrc = null;
                                        context.dialog.imgInputFile.value = "";
                                        context.dialog.imgInputUrl.value = "";
                                    } finally {
                                        editor.closeLoading();
                                    }
                                }
                                ;
                                reader.readAsDataURL(this.files[0]);
                            }
                        } catch (e) {
                            editor.closeLoading();
                        }
                    };
                    const onClick_imageResizeBtn = (e) => {
                        const command = e.target.getAttribute("data-command") || e.target.parentNode.getAttribute("data-command");
                        if (!command)
                            return;
                        if (/^\d+$/.test(command)) {
                            context.argument._imageElement.style.height = "";
                            context.argument._imageElement.style.width = command + "%";
                        } else if (/remove/.test(command)) {
                            context.argument._imageElement.remove();
                        }
                        editor.subOff();
                        wysiwygSelection.focus();
                        e.preventDefault();
                        e.stopPropagation();
                    };
                    const onMouseDown_image_ctrl = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        context.element.resizeBackground.style.display = "block";
                        context.element.imageResizeBtn.style = "none";
                        document.addEventListener('mousemove', resize_image);
                        document.addEventListener('mouseup', function() {
                            document.removeEventListener('mousemove', resize_image);
                            cancel_resize_image();
                        });
                    };
                    const resize_image = (e)=> {
                        const w = (e.clientX - context.argument._imageElement_l - context.element.topArea.offsetLeft);
                        const h = ((context.argument._imageElement_h / context.argument._imageElement_w) * w);
                        context.argument._imageElement.style.width = w + "px";
                        context.argument._imageElement.style.height = h + "px";
                        let parentElement = context.argument._imageElement.offsetParent;
                        let parentL = 1;
                        while (parentElement) {
                            parentL += (parentElement.offsetLeft + +parentElement.clientLeft);
                            parentElement = parentElement.offsetParent;
                        }
                        const l = (context.argument._imageElement.offsetLeft + parentL);
                        context.element.imageResizeDiv.style.left = l + "px";
                        context.element.imageResizeDiv.style.width = w + "px";
                        context.element.imageResizeDiv.style.height = h + "px";
                        dom.changeTxt(context.element.imageResizeDisplay, Math.round(w) + " x " + Math.round(h));
                    };
                    const cancel_resize_image = () => {
                        context.element.resizeBackground.style.display = "none";
                        context.element.imageResizeDiv.style.display = "none";
                        context.element.imageResizeBtn.style.display = "none";
                    };
                    const onMouseMove_tablePicker = (e) => {
                        let x = Math.ceil(e.offsetX / 18);
                        let y = Math.ceil(e.offsetY / 18);
                        x = x < 1 ? 1 : x;
                        y = y < 1 ? 1 : y;
                        context.tool.tableHighlight.style.width = x + "em";
                        context.tool.tableHighlight.style.height = y + "em";
                        const x_u = x < 5 ? 5 : (x > 9 ? 10 : x + 1);
                        const y_u = y < 5 ? 5 : (y > 9 ? 10 : y + 1);
                        context.tool.tableUnHighlight.style.width = x_u + "em";
                        context.tool.tableUnHighlight.style.height = y_u + "em";
                        dom.changeTxt(context.tool.tableDisplay, x + " x " + y);
                        context.argument._tableXY = [x, y];
                    };
                    const onMouseDown_resizeBar = (e) => {
                        context.argument._resizeClientY = e.clientY;
                        context.element.resizeBackground.style.display = "block";
                        document.addEventListener('mousemove', resize_editor);
                        document.addEventListener('mouseup', function() {
                            document.removeEventListener('mousemove', resize_editor);
                            context.element.resizeBackground.style.display = "none";
                        });
                    };
                    const resize_editor = (e) => {
                        const resizeInterval = (e.clientY - context.argument._resizeClientY);
                        context.element.editorArea.style.height = (context.element.editorArea.offsetHeight + resizeInterval) + "px";
                        context.argument._innerHeight = (context.element.editorArea.offsetHeight + resizeInterval);
                        context.argument._resizeClientY = e.clientY;
                    };
                    const dialog_submit = (e) => {
                        const className = this.classList[this.classList.length - 1];
                        editor.showLoading();
                        editor.subOff();
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                            let url;
                            switch (className) {
                                case 'sun-editor-id-submit-link':
                                    if (context.dialog.linkText.value.trim().length === 0)
                                        break;
                                    url = /^https?:\/\//.test(context.dialog.linkText.value) ? context.dialog.linkText.value : "http://" + context.dialog.linkText.value;
                                    const anchor = context.dialog.linkAnchorText || context.dialog.document.getElementById("linkAnchorText");
                                    const anchorText = anchor.value.length === 0 ? url : anchor.value;
                                    const oA = document.createElement("A");
                                    oA.href = url;
                                    oA.textContent = anchorText;
                                    editor.insertNode(oA);
                                    context.dialog.linkText.value = "";
                                    context.dialog.linkAnchorText.value = "";
                                    break;
                                case 'sun-editor-id-submit-image':
                                    if (!context.argument._imageFileSrc && context.dialog.imgInputUrl.value.trim().length === 0)
                                        break;
                                    const oImg = document.createElement("IMG");
                                    oImg.src = context.dialog.imgInputUrl.value.trim().length > 0 ? context.dialog.imgInputUrl.value : context.argument._imageFileSrc;
                                    oImg.style.width = "350px";
                                    editor.insertNode(oImg);
                                    context.argument._imageFileSrc = null;
                                    context.dialog.imgInputFile.value = "";
                                    context.dialog.imgInputUrl.value = "";
                                    break;
                                case 'sun-editor-id-submit-video':
                                    if (context.dialog.videoInputUrl.value.trim().length === 0)
                                        break;
                                    url = context.dialog.videoInputUrl.value.replace(/^https?:/, '');
                                    const oIframe = document.createElement("IFRAME");
                                    const x_v = context.dialog.video_x.value;
                                    const y_v = context.dialog.video_y.value;
                                    if (/youtu\.?be/.test(url)) {
                                        url = url.replace('watch?v=', '');
                                        if (!/^\/\/.+\/embed\//.test(url)) {
                                            const youtubeUrl = url.match(/^\/\/.+\//)[0]
                                            url = url.replace(youtubeUrl, '//www.youtube.com/embed/');
                                        }
                                    }
                                    oIframe.src = url;
                                    oIframe.width = (/^\d+$/.test(x_v) ? x_v : context.user.videoX);
                                    oIframe.height = (/^\d+$/.test(y_v) ? y_v : context.user.videoY);
                                    oIframe.frameBorder = "0";
                                    oIframe.allowFullscreen = true;
                                    editor.insertNode(oIframe);
                                    editor.appendP(oIframe);
                                    context.dialog.videoInputUrl.value = "";
                                    context.dialog.video_x.value = context.user.videoX;
                                    context.dialog.video_y.value = context.user.videoY;
                                    break;
                            }
                        } catch (e) {
                            editor.closeLoading();
                            return false;
                        }
                        editor.closeLoading();
                        return false;
                    };
                    window.addEventListener('resize', function() {
                        resize_window()
                    });
                    context.tool.bar.addEventListener("click", onClick_toolbar);
                    context.dialog.modal.addEventListener("click", onClick_dialog);
                    context.element.imageResizeBtn.addEventListener('click', onClick_imageResizeBtn);
                    context.element.wysiwygWindow.addEventListener("keydown", onKeyDown_wysiwyg);
                    context.dialog.imgInputFile.addEventListener("change", onChange_imgInput);
                    context.element.wysiwygWindow.addEventListener('scroll', onScroll_wysiwyg);
                    context.tool.tablePicker.addEventListener('mousemove', onMouseMove_tablePicker);
                    context.element.resizebar.addEventListener("mousedown", onMouseDown_resizeBar);
                    context.element.imageResizeController.addEventListener('mousedown', onMouseDown_image_ctrl);
                    context.element.wysiwygWindow.addEventListener("mousedown", onMouseDown_wysiwyg);
                    context.element.wysiwygWindow.document.addEventListener("selectionchange", onSelectionChange_wysiwyg);
                    for (let i = 0; i < context.dialog.forms.length; i++) {
                        context.dialog.forms[i].getElementsByClassName("btn-primary")[0].addEventListener("click", dialog_submit);
                    }
                    return {cancel_resize_image};
                }
            )();

            return (() => ({
                save() {
                    if (context.argument._wysiwygActive) {
                        context.element.textElement.innerHTML = context.element.wysiwygWindow.document.body.innerHTML;
                    } else {
                        context.element.textElement.innerHTML = context.element.source.value;
                    }
                },
                getContent() {
                    let content = "";
                    if (context.argument._wysiwygActive) {
                        content = context.element.wysiwygWindow.document.body.innerHTML;
                    } else {
                        content = context.element.source.value;
                    }
                    return content;
                },
                setContent(content) {
                    if (context.argument._wysiwygActive) {
                        context.element.wysiwygWindow.document.body.innerHTML = content;
                    } else {
                        context.element.source.value = content;
                    }
                },
                appendContent(content) {
                    if (context.argument._wysiwygActive) {
                        context.element.wysiwygWindow.document.body.innerHTML += content;
                    } else {
                        context.element.source.value += content;
                    }
                },
                disabled() {
                    context.tool.cover.style.display = "block";
                    context.element.wysiwygWindow.document.body.setAttribute("contenteditable", false);
                },
                enabled() {
                    context.tool.cover.style.display = "none";
                    context.element.wysiwygWindow.document.body.setAttribute("contenteditable", true);
                },
                show() {
                    context.element.topArea.style.cssText = context.argument._originCssText;
                },
                hide() {
                    context.element.topArea.style.display = "none";
                }
            }))();
        };
        const createEditor = options => {
            const lang = SUNEDITOR.lang ?? SUNEDITOR.defaultLang;
            const toolBar = () => {
                const templates = {
                    font: ({title, shortcut, icon, command, className}) => `
                        <li class="compact_editor">
                            <button type="button" class="btn_editor ${className}" title="${title} (${shortcut})" data-command="${command}">
                                <div class="${icon}"></div>
                            </button>
                        </li>
                    `,
                    fontColorBox: ({colorLabel}) => `
                        <div class="box_color" data-display="sub">
                            <strong class="screen_out">${colorLabel}</strong>
                            
                            <button type="button" class="btn_editor" title="${colorLabel}">
                                <div class="ico_fcolor">
                                    <em class="color_font" style="background-color:#1f92fe"></em>
                                </div>
                            </button>
                        </div>
                    `,
                    fbgColorBox: ({colorLabel}) => `
                        <strong class="screen_out">${colorLabel}</strong>
                        
                        <button type="button" class="btn_editor btn_fbgcolor" title="${colorLabel}" data-display="sub">
                            <div class="img_editor ico_fcolor_w">
                                <em class="color_font" style="background-color:#1f92fe"></em>
                            </div>
                        </button>
                    `,
                    styles: ({colorLabel, command, colors, headerTemplate, ulContainerAdditionalClass = ''}) => `
                        <li class="compact_editor">
                            ${headerTemplate in templates ? templates[headerTemplate]({colorLabel}) : ''}
                            
                            <div class="layer_editor layer_color" data-command="${command}">
                                <div class="inner_layer">
                                    <div class="pallet_bgcolor${ulContainerAdditionalClass}">
                                        <ul class="list_color list_bgcolor">
                                            ${colors.map((color, i) => `
                                                <li ${
                                                    i === colors.length - 1 ? 'class="compact_color"' : ''
                                                }>
                                                    <button 
                                                        type="button" 
                                                        class="btn_color${
                                                            i === colors.length - 1 || typeof color === 'object' ? '' : ` color_${color.replace('#', '')}`
                                                        }${
                                                            color === '#ffffff' ? ' color_white' : ''
                                                        }" style="${
                                                            typeof color === 'object' ? `color: ${color.font};` : ''
                                                        } background-color: ${
                                                            typeof color === 'object' ? color.bg : color
                                                        };"
                                                    >
                                                        ${color}
                                                        
                                                        <span class="bg_check"></span>
                                                        
                                                        <span class="bg_btnframe"></span>
                                                    </button>
                                                </li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </li>
                    `,
                    alineAndList: ({title, label = '', className, list}) => `
                        ${label ? `<strong class="screen_out">${title}</strong>` : ''}

                        <button type="button" class="btn_editor btn_align" title="${title}" data-display="sub">
                            ${label 
                                ? `<span class="img_editor ${className}">${label}</span>` 
                                : `<div class="img_editor ico_list ico_list_num"></div>`}
                        </button>

                        <div class="layer_editor layer_align">
                            <div class="inner_layer inner_layer_type2">
                                <ul class="list_editor">
                                    ${list.map(({command, title, className, label = '', value = false}) => `
                                        <li>
                                            <button type="button" class="btn_edit ${value ? '' : 'btn_align'}" data-command="${command}" ${value ? `data-value="${value}"` : ''} title="${title}">
                                                <span class="img_editor ${className}"></span>
                                                ${label}
                                            </button>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    `,
                    showLine: ({title, label, nbElements}) => `
                        <strong class="screen_out">${label}</strong>

                        <button type="button" class="btn_editor btn_line" title="${title}" data-display="sub">
                            <hr style="border-width: 1px 0 0; border-style: solid none none; border-color: black; border-image: initial; height: 1px;">
                            <hr style="border-width: 1px 0 0; border-style: dotted none none; border-color: black; border-image: initial; height: 1px;">
                            <hr style="border-width: 1px 0 0; border-style: dashed none none; border-color: black; border-image: initial; height: 1px;">
                        </button>

                        <div class="layer_editor layer_line">
                            <div class="inner_layer inner_layer_type2">
                                <ul class="list_editor">
                                    ${Array.from(new Array(nbElements).keys()).map(nb => `
                                        <li>
                                            <button type="button" class="btn_edit btn_line" data-command="horizontalRules" data-value="hr${nb + 1}">
                                                <hr style="border-width: 1px 0 0; border-style: solid none none; border-color: black; border-image: initial; height: 1px;">
                                            </button>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    `,
                    showTable: ({}) => `
                        <li>
                            <button class="btn_editor" title="' + lang.toolbar.table + '" data-display="sub" data-command="table">
                                <div class="img_editor ico_table"></div>
                            </button>

                            <div class="table-content" style="display: none;">
                                <div class="table-data-form">
                                    <div class="table-picker sun-editor-id-table-picker" data-command="insertTable" data-value="1x1"></div>

                                    <div class="table-highlighted sun-editor-id-table-highlighted"></div>

                                    <div class="table-unhighlighted sun-editor-id-table-unhighlighted"></div>
                                </div>

                                <div class="table-display sun-editor-table-display">1 x 1</div>
                            </div>
                        </li>'
                    `,
                    buttons: ({title, command, className}) => `
                        <button class="btn_editor" title="${title}" data-display="modal" data-command="${command}">
                            <div class="img_editor ${className}"></div>
                        </button>
                    `,
                    compactEditorSizeButton: ({label, className = ''}) => `
                        <span class="txt ${className}">${label}</span>
                        
                        <span class="img_editor ico_more"></span>
                    `,
                    compactEditorFontButton: ({label}) => templates.compactEditorSizeButton({label, className: 'sun-editor-font-family'}),
                    layoutEditor: ({slot = false, hidden = false, list, listClassName, listContainerClassName = '', layerClassName = ''}) => `
                        <div class="layer_editor ${layerClassName}" ${hidden ? 'style="display: none;"' : ''}>
                            <div class="inner_layer ${listContainerClassName}">
                                <ul class="list_editor ${listClassName}">
                                    ${list.map(({command, value, txt, label, isDefault = false}) => `
                                        <li>
                                            <button 
                                                type="button"
                                                class="btn_edit ${isDefault ? 'default' : ''}"
                                                data-command="${command}"
                                                data-value="${value}"
                                                data-txt="${txt}"
                                                style="font-family: ${value};"
                                            >
                                                ${label}
                                            </button>
                                        </li>
                                    `).join('')}
                                </ul>
                                
                                ${(() => options.addFont ? `
                                    <ul class="list_editor list_family_add sun-editor-list-font-family-add">
                                        ${Array.from(new Array(options.addFont.length).keys())
                                            .map(i => `
                                                <li>
                                                    <button 
                                                        type="button" 
                                                        class="btn_edit" 
                                                        data-command="fontName" 
                                                        data-value="${options.addFont[i].value}" 
                                                        data-txt="${options.addFont[i].text}" 
                                                        style="font-family: ${options.addFont[i].value};"
                                                    >
                                                        ${options.addFont[i].text}
                                                    </button>
                                                </li>
                                            `).join('')}
                                    </ul>
                                ` : '')()}
                            </div>
                            
                            ${slot}
                        </div>
                    `,
                    layoutEditorSize: ({list, listClassName, listContainerClassName = '', layerClassName}) => templates.layoutEditor({
                        slot: (() => options.addFont ? `
                            <ul class="list_editor list_family_add sun-editor-list-font-family-add">
                                ${Array.from(new Array(options.addFont.length).keys())
                                    .map(i => `
                                        <li>
                                            <button 
                                                type="button" 
                                                class="btn_edit" 
                                                data-command="fontName" 
                                                data-value="${options.addFont[i].value}" 
                                                data-txt="${options.addFont[i].text}" 
                                                style="font-family: ${options.addFont[i].value};"
                                            >
                                                ${options.addFont[i].text}
                                            </button>
                                        </li>
                                    `).join('')}
                            </ul>
                        ` : '')(),
                        className: 'layer_size',
                        hidden: true,
                        list, listClassName,
                        listContainerClassName, layerClassName
                    }),
                };

                const compactEditions = [
                    {
                        show: options.showFont,

                        className: 'sun-editor-font-family',
                        buttonClassName: 'btn_font',
                        listClassName: 'sun-editor-list-font-family',
                        listContainerClassName: 'list_family',

                        customTemplate: 'compactEditorFontButton',
                        layerTemplate: 'layoutEditor',

                        label: lang.toolbar.fontFamily,
                        title: lang.toolbar.fontFamily,
                        list: [
                            {
                                command: 'fontName',
                                value: 'inherit',
                                txt: lang.toolbar.fontFamily,
                                label: lang.toolbar.fontFamilyDelete,
                                isDefault: true,
                            },
                            {
                                command: 'fontName',
                                value: 'Arial',
                                txt: 'Arial',
                                label: 'Arial',
                            },
                            {
                                command: 'fontName',
                                value: 'Comic Sans MS',
                                txt: 'Comic Sans MS',
                                label: 'Comic Sans MS',
                            },
                            {
                                command: 'fontName',
                                value: 'Courier New,Courier',
                                txt: 'Courier New,Courier',
                                label: 'Courier New,Courier',
                            },
                            {
                                command: 'fontName',
                                value: 'Georgia',
                                txt: 'Georgia',
                                label: 'Georgia',
                            },
                            {
                                command: 'fontName',
                                value: 'tahoma',
                                txt: 'tahoma',
                                label: 'tahoma',
                            },
                            {
                                command: 'fontName',
                                value: 'Trebuchet MS,Helvetica',
                                txt: 'Trebuchet MS,Helvetica',
                                label: 'Trebuchet MS,Helvetica',
                            },
                            {
                                command: 'fontName',
                                value: 'Verdana',
                                txt: 'Verdana',
                                label: 'Verdana',
                            },
                        ],
                    },
                    {
                        show: options.showFormats,

                        buttonClassName: 'btn_size',
                        listClassName: 'font_size_list',
                        layerClassName: 'layer_size',

                        customTemplate: 'compactEditorSizeButton',
                        layerTemplate: 'layoutEditorSize',

                        label: lang.toolbar.formats,
                        title: lang.toolbar.formats,
                        list: [
                            {
                                tag: 'p',
                                style: 'font-size:13pt;',
                                label: 'normal',
                                height: 30,
                                value: 'P'
                            },
                            {
                                tag: 'h1',
                                label: 'Header 1',
                                height: 45,
                                value: 'h1'
                            },
                            {
                                tag: 'h2',
                                label: 'Header 2',
                                height: 34,
                                value: 'h2'
                            },
                            {
                                tag: 'h3',
                                label: 'Header 3',
                                height: 26,
                                value: 'h3'
                            },
                            {
                                tag: 'h4',
                                label: 'Header 4',
                                height: 23,
                                value: 'h4'
                            },
                            {
                                tag: 'h5',
                                label: 'Header 5',
                                height: 19,
                                value: 'h5'
                            },
                            {
                                tag: 'h6',
                                label: 'Header 6',
                                height: 15,
                                value: 'h6'
                            },
                        ],
                    },
                ];

                const editorTools = [
                    [
                        {
                            show: options.showBold,
                            title: lang.toolbar.bold,
                            shortcut: 'Ctrl+B',
                            icon: 'bold',
                            command: 'bold',
                            className: 'sun-editor-id-bold',
                            type: 'font'
                        },
                        {
                            show: options.showUnderline,
                            title: lang.toolbar.underline,
                            shortcut: 'Ctrl+U',
                            icon: 'underline',
                            command: 'underline',
                            className: 'sun-editor-id-underline',
                            type: 'font'
                        },
                        {
                            show: options.showItalic,
                            title: lang.toolbar.italic,
                            shortcut: 'Ctrl+I',
                            icon: 'italic',
                            command: 'italic',
                            className: 'sun-editor-id-italic',
                            type: 'font'
                        },
                        {
                            show: options.showStrike,
                            title: lang.toolbar.strike,
                            shortcut: 'Ctrl+D',
                            icon: 'strike',
                            command: 'strikethrough',
                            className: 'sun-editor-id-strike',
                            type: 'font'
                        }
                    ],
                    [
                        {
                            show: options.showFontColor,
                            type: 'styles',
                            colorLabel: lang.toolbar.fontColor,
                            command: 'foreColor',
                            colors: [
                                '#ff0000', '#ff5e00', '#ffe400', '#abf200',
                                '#00d8ff', '#0055ff', '#6600ff', '#ff00dd',
                                '#000000', '#ffd8d8', '#fae0d4', '#faf4c0',
                                '#e4f7ba', '#d4f4fa', '#d9e5ff', '#e8d9ff',
                                '#ffd9fa', '#ffffff', '#ffa7a7', '#ffc19e',
                                '#faed7d', '#cef279', '#b2ebf4', '#b2ccff',
                                '#d1b2ff', '#ffb2f5', '#bdbdbd', '#f15f5f',
                                '#f29661', '#e5d85c', '#bce55c', '#5cd1e5',
                                '#6699ff', '#a366ff', '#f261df', '#8c8c8c',
                                '#980000', '#993800', '#998a00', '#6b9900',
                                '#008299', '#003399', '#3d0099', '#990085',
                                '#353535', '#670000', '#662500', '#665c00',
                                '#476600', '#005766', '#002266', '#290066',
                                '#660058', '#222222',
                            ],
                            headerTemplate: 'fontColorBox'
                        },
                        {
                            show: options.showHiliteColor,
                            type: 'styles',
                            colorLabel: lang.toolbar.hiliteColor,
                            command: 'hiliteColor',
                            colors: [
                                '#1e9af9', '#00b8c6', '#6cce02', '#ff9702',
                                '#ff0000', '#ff00dd', '#6600ff', '#cce9ff',
                                '#fcfd4c', '#ffffff', '#dfdede', '#8c8c8c',
                                '#000000', '#222222'
                            ],
                            headerTemplate: 'fbgColorBox',
                            ulContainerAdditionalClass: 'pallet_text'
                        },
                    ]
                ];

                const toolModules = [
                    {
                        show: options.showInOutDent,
                        tools: [
                            {
                                show: true,
                                title: lang.toolbar.indent,
                                command: 'indent',
                                className: 'ico_indent'
                            },
                            {
                                show: true,
                                title: lang.toolbar.outdent,
                                command: 'outdent',
                                className: 'ico_outdent'
                            },
                        ]
                    },
                    {
                        show: true,
                        tools: [
                            {
                                show: options.showAlign,
                                title: lang.toolbar.align,
                                label: lang.toolbar.alignLeft,
                                className: 'ico_align_l',
                                list: [
                                    {
                                        title: lang.toolbar.alignLeft,
                                        command: 'justifyleft',
                                        className: 'ico_align_l',
                                        label: lang.toolbar.left
                                    },
                                    {
                                        title: lang.toolbar.alignCenter,
                                        command: 'justifycenter',
                                        className: 'ico_align_c',
                                        label: lang.toolbar.center
                                    },
                                    {
                                        title: lang.toolbar.alignRight,
                                        command: 'justifyright',
                                        className: 'ico_align_r',
                                        label: lang.toolbar.right
                                    },
                                    {
                                        title: lang.toolbar.justifyFull,
                                        command: 'justifyfull',
                                        className: 'ico_align_f',
                                        label: lang.toolbar.bothSide
                                    },
                                ],
                                customTemplate: 'alineAndList'
                            },
                            {
                                show: options.showList,
                                title: lang.toolbar.list,
                                list: [
                                    {
                                        title: lang.toolbar.orderList,
                                        command: 'insertOrderedList',
                                        value: 'DECIMAL',
                                        className: 'ico_list ico_list_num'
                                    },
                                    {
                                        title: lang.toolbar.unorderList,
                                        command: 'insertUnorderedList',
                                        value: 'DISC',
                                        className: 'ico_list ico_list_square'
                                    },
                                ],
                                customTemplate: 'alineAndList'
                            },
                            {
                                show: options.showLine,
                                label: lang.toolbar.line,
                                title: lang.toolbar.line,
                                nbElements: 3
                            }
                        ]
                    },
                    {
                        show: true,
                        tools: [
                            {
                                show: options.showTable,
                                customTemplate: 'showTable'
                            },
                            {
                                show: options.showLink,
                                customTemplate: 'buttons',
                                command: 'link',
                                title: lang.toolbar.link,
                                className: 'ico_url'
                            },
                            {
                                show: options.showImage,
                                customTemplate: 'buttons',
                                command: 'image',
                                title: lang.toolbar.image,
                                className: 'ico_picture'
                            },
                        ]
                    },
                    {
                        show: true,
                        tools: [
                            {
                                show: options.showVideo,
                                title: lang.toolbar.video,
                                command: 'video',
                                className: 'ico_video',
                                customTemplate: 'buttons'
                            },
                            {
                                show: options.showFullScreen,
                                title: lang.toolbar.fullScreen,
                                command: 'fullScreen',
                                className: 'ico_full_screen_e',
                                customTemplate: 'buttons'
                            },
                            {
                                show: options.showCodeView,
                                title: lang.toolbar.htmlEditor,
                                command: 'sorceFrame',
                                className: 'ico_html',
                                customTemplate: 'buttons'
                            },
                        ]
                    }
                ];

                return `
                    <div class="sun-editor-id-toolbar-cover"></div>
                    
                    <div class="tool_module">
                        <ul class="editor_tool">
                            ${compactEditions.map(({show, customTemplate, layerTemplate, buttonClassName, title, ...params}) => show ? `
                                <li class="compact_editor">
                                    <button type="button" class="btn_editor ${buttonClassName}" title="${title}" data-display="sub">
                                        ${customTemplate in templates ? templates[customTemplate](params) : ''}
                                    </button>
                                    
                                    ${layerTemplate in templates ? templates[layerTemplate](params) : ''}
                                </li>
                            ` : '')}
                        </ul>
                    </div>
                    
                    ${editorTools.map(ets => ets.length > 0 ? `
                        <div class="tool_module">
                            <ul class="editor_tool">
                                ${ets.map(({show, type, ...et}) => show && type in templates ? templates[type](et) : '').join('')}
                            </ul>
                        </div>
                    ` : '').join('')}
                    
                    ${toolModules.map(({show, tools}) => show ? `
                        <div class="tool_module">
                            <ul class="editor_tool">
                                ${tools.map(({show, customTemplate = null, ...tool}) => show ? `
                                    <li>
                                        ${customTemplate && customTemplate in templates 
                                            ? templates[customTemplate](tool) : `
                                                <button type="button" class="btn_editor" title="${tool.title}" data-command="${tool.command}">
                                                    <div class="img_editor ${tool.className}"></div>
                                                </button>
                                            `}
                                    </li>
                                ` : '').join('')}
                            </ul>
                        </div>
                    ` : '').join('')}
                `;
            };
            const dialogBox = () => `
                <div class="modal-dialog-background sun-editor-id-dialog-back" style="display: none;"></div>
                
                <div class="modal-dialog sun-editor-id-dialog-modal" style="display: none;">
                    <div class="modal-content sun-editor-id-dialog-link" style="display: none;">
                        <form class="editor_link">
                            <div class="modal-header">
                                <button type="button" data-command="close" class="close" aria-label="Close">
                                    <span aria-hidden="true" data-command="close">×</span>
                                </button>
                                
                                <h5 class="modal-title">${lang.dialogBox.linkBox.title}</h5>
                            </div>
                            <div class="modal-body">
                                <div class="form-group">
                                    <label>${lang.dialogBox.linkBox.url}</label>
                                    
                                    <input class="form-control sun-editor-id-linkurl" type="text">
                                </div>
                                
                                <div class="form-group">
                                    <label>${lang.dialogBox.linkBox.text}</label>
                                    
                                   <input class="form-control sun-editor-id-linktext" type="text">
                                </div>
                            </div>
                            
                            <div class="modal-footer">
                                <button type="submit" class="btn btn-primary sun-editor-id-submit-link">
                                   <span>${lang.dialogBox.submitButton}</span>
                               </button>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-content sun-editor-id-dialog-image" style="display: none;">
                        <form class="editor_image" method="post" enctype="multipart/form-data">
                            <div class="modal-header">
                                <button type="button" data-command="close" class="close" aria-label="Close">
                                    <span aria-hidden="true" data-command="close">×</span>
                                </button>
                                
                                <h5 class="modal-title">${lang.dialogBox.imageBox.title}</h5>
                            </div>
                            
                            <div class="modal-body">
                                <div class="form-group">
                                    <label>${lang.dialogBox.imageBox.file}</label>
                                    
                                    <input class="form-control sun-editor-id-image-file" type="file" accept="image/*" multiple="multiple">
                                </div>
                                
                                <div class="form-group">
                                    <label>${lang.dialogBox.imageBox.url}</label>
                                    
                                    <input class="form-control sun-editor-id-image-url" type="text">
                                </div>
                            </div>
                            
                            <div class="modal-footer">
                                <button type="submit" class="btn btn-primary sun-editor-id-submit-image">
                                   <span>${lang.dialogBox.submitButton}</span>
                               </button>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-content sun-editor-id-dialog-video" style="display: none;">
                        <form class="editor_video">
                            <div class="modal-header">
                                <button type="button" data-command="close" class="close" aria-label="Close">
                                    <span aria-hidden="true" data-command="close">×</span>
                                </button>
                                
                                <h5 class="modal-title">${lang.dialogBox.videoBox.title}</h5>
                            </div>
                            
                            <div class="modal-body">
                                <div class="form-group">
                                    <label>${lang.dialogBox.videoBox.url}</label>
                                    
                                    <input class="form-control sun-editor-id-video-url" type="text">
                                </div>
                                
                                <div class="form-group form-size">
                                    <div class="size-text">
                                        <label class="size-w">${lang.dialogBox.videoBox.width}</label>
                                        <label class="size-x"> </label>
                                        <label class="size-h">${lang.dialogBox.videoBox.height}</label>
                                    </div>
                                    
                                    <input type="text" class="form-size-control sun-editor-id-video-x">
                                    
                                    <label class="size-x">x</label>
                                    
                                    <input type="text" class="form-size-control sun-editor-id-video-y">
                                </div>
                            </div>
                            
                            <div class="modal-footer">
                                <button type="submit" class="btn btn-primary sun-editor-id-submit-video">
                                   <span>${lang.dialogBox.submitButton}</span>
                               </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            const imgDiv = () => `
                <div class="image-resize-dot tl"></div>
                <div class="image-resize-dot tr"></div>
                <div class="image-resize-dot bl"></div>
                <div class="image-resize-dot br-controller sun-editor-img-controller"></div>
                <div class="image-size-display sun-editor-id-img-display"></div>
            `;
            const imgBtn = () => `
                <div class="btn-group">
                    <button type="button" data-command="100" title="${lang.dialogBox.imageBox.resize100}">
                        <span class="note-fontsize-10">100%</span>
                    </button>
                   
                    <button type="button" data-command="75" title="${lang.dialogBox.imageBox.resize75}">
                        <span class="note-fontsize-10">75%</span>
                    </button>
                   
                    <button type="button" data-command="50" title="${lang.dialogBox.imageBox.resize50}">
                        <span class="note-fontsize-10">50%</span>
                    </button>
                   
                    <button type="button" data-command="25" title="${lang.dialogBox.imageBox.resize25}">
                        <span class="note-fontsize-10">25%</span>
                    </button>
                </div>
                
                <div class="btn-group remove">
                    <button type="button" data-command="remove" title="${lang.dialogBox.imageBox.remove}">
                        <span class="image_remove">X</span>
                    </button>
                </div>
            `;

            return {toolBar, dialogBox, imgDiv, imgBtn};
        };
        const Constructor = (element, options) => {
            if (!(typeof options === "object")) options = {};

            options = {
                ...options,
                addFont: options.addFont || null,
                videoX: options.videoX || 560,
                videoY: options.videoY || 315,
                imageSize: options || '350px',
                height: /^\d+/.test(options.height)
                    ? (/^\d+$/.test(options.height)
                        ? `${options.height}px`
                        : options.height)
                    : `${element.clientHeight}px`,
                width: /^\d+/.test(options.width)
                    ? (/^\d+$/.test(options.width)
                        ? `${options.width}px`
                        : options.width)
                    : `${element.clientWidth}px`,
                ...[
                    'showFont', 'showFormats',
                    'showBold', 'showUnderline',
                    'showItalic', 'showStrike',
                    'showFontColor', 'showHiliteColor',
                    'showInOutDent', 'showAlign',
                    'showList', 'showLine',
                    'showTable', 'showLink',
                    'showImage', 'showVideo',
                    'showFullScreen', 'showCodeView'
                ].reduce((r, c) => ({
                    ...r,
                    [c]: options[c] ?? true
                }), {})
            }

            const top_div = document.createElement("DIV");
            top_div.className = "sun-editor";
            top_div.style.width = options.width;

            const relative = document.createElement("DIV");
            relative.className = "sun-editor-container";

            const tool_bar = document.createElement("DIV");
            tool_bar.className = "sun-editor-id-toolbar";
            tool_bar.innerHTML = createEditor(options).toolBar();

            const editor_div = document.createElement("DIV");
            editor_div.className = "sun-editor-id-editorArea";
            editor_div.style.height = options.height;

            const iframe = document.createElement("IFRAME");
            iframe.allowFullscreen = true;
            iframe.frameBorder = 0;
            iframe.className = "input_editor sun-editor-id-wysiwyg";
            iframe.style.display = "block";

            const textarea = document.createElement("TEXTAREA");
            textarea.className = "input_editor html sun-editor-id-source";
            textarea.style.display = "none";

            const resize_bar = document.createElement("DIV");
            resize_bar.className = "sun-editor-id-resizeBar";

            const dialog_div = document.createElement("DIV");
            dialog_div.className = "sun-editor-id-dialogBox";
            dialog_div.innerHTML = createEditor(options).dialogBox();

            const resize_img = document.createElement("DIV");
            resize_img.className = "modal-image-resize";
            resize_img.innerHTML = createEditor(options).imgDiv();

            const resize_img_button = document.createElement("DIV");
            resize_img_button.className = "image-resize-btn";
            resize_img_button.innerHTML = createEditor(options).imgBtn();

            const loading_box = document.createElement("DIV");
            loading_box.className = "sun-editor-id-loading";
            loading_box.innerHTML = `"<div class="ico-loading"></div>"`;

            const resize_back = document.createElement("DIV");
            resize_back.className = "sun-editor-id-resize-background";
            dialog_div.getElementsByClassName('sun-editor-id-video-x')[0].value = options.videoX;
            dialog_div.getElementsByClassName('sun-editor-id-video-y')[0].value = options.videoY;
            editor_div.appendChild(iframe);
            editor_div.appendChild(textarea);

            relative.appendChild(tool_bar);
            relative.appendChild(editor_div);
            relative.appendChild(resize_bar);
            relative.appendChild(dialog_div);
            relative.appendChild(resize_back);
            relative.appendChild(resize_img);
            relative.appendChild(resize_img_button);
            relative.appendChild(loading_box);
            top_div.appendChild(relative);

            return {
                constructed: {
                    _top: top_div,
                    _toolBar: tool_bar,
                    _editorArea: editor_div,
                    _resizeBar: resize_bar,
                    _dialog: dialog_div,
                    _loading: loading_box,
                    _resizeImg: resize_img,
                    _resizeImgBtn: resize_img_button,
                    _resizeBack: resize_back
                },
                options: options
            };
        };
        const Context = (element, cons, options) => {
            options._originCssText = cons._top.style.cssText;
            options._innerHeight = cons._editorArea.clientHeight;

            setTimeout(() => {
                cons._editorArea.querySelector('.sun-editor-id-wysiwyg').contentWindow.document.head.innerHTML = `
                    <meta charset="utf-8">
                    <style type="text/css">
                       body {margin:15px; word-break:break-all; overflow:auto; font-family:sans-serif;} p {margin:0; padding:0;} blockquote {margin-top:0; margin-bottom:0; margin-right:0;}
                       table {table-layout:fixed; border:1px solid rgb(204, 204, 204); width:100%; max-width:100%; margin-bottom:20px; background-color:transparent; border-spacing:0px; border-collapse:collapse;}
                       table tr {border:1px solid #ccc;}
                       table tr td {border:1px solid #ccc; padding:8px;}
                    </style>
                `;
                cons._editorArea.querySelector('.sun-editor-id-wysiwyg').contentWindow.document.body.setAttribute("contenteditable", true);
                cons._editorArea.querySelector('.sun-editor-id-wysiwyg').contentWindow.document.body.innerHTML = element.value.length > 0 ? `<p>${element.value}</p>` : '<p>&#65279</p>';
            }, 0);

            return {
                argument: {
                    _copySelection: null,
                    _selectionNode: null,
                    _imageFileSrc: null,
                    _imageElement: null,
                    _imageElement_w: 0,
                    _imageElement_h: 0,
                    _imageElement_l: 0,
                    _imageElement_t: 0,
                    _imageResize_parent_t: 0,
                    _imageResize_parent_l: 0,
                    _wysiwygActive: true,
                    _isFullScreen: false,
                    _innerHeight_fullScreen: 0,
                    _tableXY: [],
                    _resizeClientY: 0,
                    _originCssText: options._originCssText,
                    _innerHeight: options._innerHeight,
                    _windowHeight: window.innerHeight
                },
                element: {
                    textElement: element,
                    topArea: cons._top,
                    resizebar: cons._resizeBar,
                    editorArea: cons._editorArea,
                    wysiwygWindow: cons._editorArea.querySelector('.sun-editor-id-wysiwyg').contentWindow,
                    wysiwygElement: cons._editorArea.querySelector('.sun-editor-id-wysiwyg'),
                    source: cons._editorArea.querySelector('.sun-editor-id-source'),
                    loading: cons._loading,
                    imageResizeDiv: cons._resizeImg,
                    imageResizeController: cons._resizeImg.querySelector('.sun-editor-img-controller'),
                    imageResizeDisplay: cons._resizeImg.querySelector('.sun-editor-id-img-display'),
                    imageResizeBtn: cons._resizeImgBtn,
                    resizeBackground: cons._resizeBack
                },
                tool: {
                    bar: cons._toolBar,
                    barHeight: cons._toolBar.offsetHeight,
                    cover: cons._toolBar.querySelector('.sun-editor-id-toolbar-cover'),
                    bold: cons._toolBar.querySelector('.sun-editor-id-bold'),
                    underline: cons._toolBar.querySelector('.sun-editor-id-underline'),
                    italic: cons._toolBar.querySelector('.sun-editor-id-italic'),
                    strike: cons._toolBar.querySelector('.sun-editor-id-strike'),
                    tablePicker: cons._toolBar.querySelector('.sun-editor-id-table-picker'),
                    tableHighlight: cons._toolBar.querySelector('.sun-editor-id-table-highlighted'),
                    tableUnHighlight: cons._toolBar.querySelector('.sun-editor-id-table-unhighlighted'),
                    tableDisplay: cons._toolBar.querySelector('.sun-editor-table-display'),
                    fontFamily: cons._toolBar.querySelector('.sun-editor-font-family'),
                    default_fontFamily: cons._toolBar.querySelector('.sun-editor-font-family').textContent,
                    list_fontFamily: cons._toolBar.querySelector('.sun-editor-list-font-family'),
                    list_fontFamily_add: cons._toolBar.querySelector('.sun-editor-list-font-family-add')
                },
                dialog: {
                    modalArea: cons._dialog,
                    back: cons._dialog.querySelector('.sun-editor-id-dialog-back'),
                    modal: cons._dialog.querySelector('.sun-editor-id-dialog-modal'),
                    forms: [...cons._dialog.querySelectorAll('form')],
                    link: cons._dialog.querySelector('.sun-editor-id-dialog-link'),
                    linkText: cons._dialog.querySelector('.sun-editor-id-linkurl'),
                    linkAnchorText: cons._dialog.querySelector('.sun-editor-id-linktext'),
                    image: cons._dialog.querySelector('.sun-editor-id-dialog-image'),
                    imgInputFile: cons._dialog.querySelector('.sun-editor-id-image-file'),
                    imgInputUrl: cons._dialog.querySelector('.sun-editor-id-image-url'),
                    video: cons._dialog.querySelector('.sun-editor-id-dialog-video'),
                    videoInputUrl: cons._dialog.querySelector('.sun-editor-id-video-url'),
                    video_x: cons._dialog.querySelector('.sun-editor-id-video-x'),
                    video_y: cons._dialog.querySelector('.sun-editor-id-video-y')
                },
                user: {
                    videoX: options.videoX,
                    videoY: options.videoY,
                    imageSize: options.imageSize
                }
            }
        };

        SUNEDITOR.create = (elementId, options) => {
            const element = document.querySelector(`#${elementId}`);
            if (!element) {
                alert('Suneditor creation failed :\n\rThe element for that id was not found');
                return null;
            }

            const cons = Constructor(element, options);
            element.parentNode[typeof element.nextElementSibling === 'object' ? 'insertBefore' : 'appendChild'](
                ...[
                    cons.constructed._top,
                    ...(() =>
                        typeof element.nextElementSibling === 'object' ? [element.nextElementSibling] : [])
                ]
            )
            element.style.display = "none";

            return new core(Context(element, cons.constructed, cons.options));
        };
    }
)();

SUNEDITOR.create('editor')
