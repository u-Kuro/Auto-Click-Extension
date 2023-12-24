let savedItemsID = " clicked-html-WuPtWCqvGTRZltvdSIN70"

function saveData(key, value) {
    return new Promise((resolve) => {
        if (typeof key === "string" && value) {
            chrome.storage.sync.set({ [key]: value }, resolve);
        } else {
            resolve()
        }
    })
}

function deleteData(key) {
    return new Promise((resolve) => {
        if (typeof key === "string") {
            chrome.storage.sync.remove(key, resolve);
        } else {
            resolve()
        }
    })
}

function jsonIsEmpty(obj) {
    for (const key in obj) {
        return false;
    }
    return true;
}

chrome.storage.sync.get(null, function (items) {
    let savedUrls = {}
    let savedItems = {}
    for (let key in items) {
        if (key.endsWith(savedItemsID)) {
            savedItems[key] = items[key]
        } else {
            savedUrls[key] = items[key]
        }
    }

    let usedUrl = false;
    for (let key in savedUrls) {
        if (usedUrl) break
        if (savedUrls[key]?.disabled) continue
        switch (savedUrls[key]?.type) {
            case "Origin": {
                if (key === document.location.origin) {
                    usedUrl = key
                }
                break;
            }
            case "Origin & Pathname": {
                if (key === (document.location.origin + document.location.pathname)) {
                    usedUrl = key
                }
                break;
            }
            case "Full URL": {
                if (key === document.location.href) {
                    usedUrl = key
                }
                break;
            }
            case "Starts With": {
                if (document.location.href.startsWith(key || "")) {
                    usedUrl = key
                }
                break;
            }
        }
    }

    if (!usedUrl) return
    usedUrl = usedUrl + savedItemsID
    for (let key in savedItems[usedUrl]) {
        let elementKey = savedItems?.[usedUrl]?.[key]?.elementKey
        if (elementKey) {
            setTimeout(() => {
                let innerText = savedItems?.[usedUrl]?.[key]?.innerText
                if (typeof innerText === "string") {
                    let elements = Array.from(window?.parent?.document?.querySelectorAll?.(elementKey) || [])
                    let element = elements?.find?.((el) => el?.innerText === innerText)
                    element?.click?.()
                } else {
                    window?.parent?.document?.querySelector?.(elementKey)?.click?.()
                }
            }, Math.min(2147483647, savedItems?.[usedUrl]?.[key]?.delay || 0))
        }
    }

    let elementUniqueId, chosenElementId, chosenElementInnerText = "", openTimeout;
    document.addEventListener("pointerdown", (e) => {
        if (openTimeout) clearTimeout(openTimeout);
        openTimeout = setTimeout(() => {
            let element = e?.target
            if (element?.tagName === "A" || element?.tagName === "BUTTON") {
                elementUniqueId = undefined
                chosenElementId = undefined
                chosenElementInnerText = element?.innerText || ""
                let recursedElement = element
                while (recursedElement instanceof Element) {
                    let classList = Array.from(recursedElement?.classList || [])
                    let classId = classList?.join?.(".")
                    if (classId) {
                        classId = "." + classId
                    }
                    let recursedElementNth = 0;
                    let siblingEl = recursedElement?.previousElementSibling || recursedElement?.nextElementSibling
                    if (siblingEl) {
                        let parentChildren = Array.from(recursedElement?.parentElement || [])
                        if (parentChildren.some((reSiblingEl) => {
                            if (reSiblingEl === recursedElement) return false
                            let sClassList = Array.from(reSiblingEl?.classList || [])
                            let sClassId = sClassList?.join?.(".")
                            if (sClassId) {
                                sClassId = "." + sClassId
                            }
                            return sClassId === classId
                        })) {
                            recursedElementNth = 1;
                            let child;
                            while ((child = child.previousSibling) != null) recursedElementNth++;
                        }
                    }
                    recurserElId = classId || recursedElement.tagName
                    if (recursedElementNth) {
                        recurserElId + ":nth-child(" + recursedElementNth + ")"
                    }
                    if (chosenElementId) {
                        chosenElementId = recurserElId + ">" + chosenElementId
                    } else {
                        chosenElementId = recurserElId
                    }
                    // Next El
                    recursedElement = recursedElement.parentElement
                }
                if (chosenElementId) {
                    chosenElementId = chosenElementId
                    elementUniqueId = chosenElementId + chosenElementInnerText
                }
                init()
            }
        }, 500);
    })
    document.addEventListener("pointerup", (e) => {
        if (openTimeout) clearTimeout(openTimeout);
    })
    document.addEventListener("pointercancel", (e) => {
        if (openTimeout) clearTimeout(openTimeout);
    })

    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                for (let addedNode of mutation.addedNodes) {
                    if (addedNode.id === "auto-click-WuPtWCqvGTRZltvdSIN70") {
                        let inputDelayEl = addedNode.querySelector("#delayInput")
                        let includeTextEl = addedNode.querySelector("#includeText")
                        if (savedItems?.[usedUrl]?.hasOwnProperty?.(elementUniqueId)) {
                            if (inputDelayEl instanceof Element && inputDelayEl?.tagName === "INPUT") {
                                inputDelayEl.value = parseFloat(savedItems[usedUrl][elementUniqueId]?.delay) || 0
                            }
                            if (includeTextEl instanceof Element && includeTextEl?.tagName === "INPUT") {
                                includeTextEl.checked = typeof (savedItems[usedUrl][elementUniqueId]?.innerText) === "string"
                            }
                        }
                        addedNode.querySelector(".confirm")?.addEventListener?.("click", (e) => {
                            let target = e.target;
                            let classList = target.classList;
                            if (
                                target.closest(".confirm-container") ||
                                classList.contains("confirm-container")
                            )
                                return;
                            handleCancel();
                        })
                        addedNode.querySelector(".confirm-button-container > .cancel-btn")?.addEventListener?.("click", handleCancel)
                        addedNode.querySelector(".confirm-button-container > .delete-btn")?.addEventListener?.("click", handleDelete)
                        addedNode.querySelector(".confirm-button-container > .confirm-btn")?.addEventListener?.("click", handleConfirm)
                        async function handleConfirm() {
                            let delay = inputDelayEl?.value ? parseFloat(inputDelayEl?.value) : 0
                            let includeText = includeTextEl?.checked
                            if (usedUrl && elementUniqueId && chosenElementId && typeof delay === "number" && delay >= 0 && !isNaN(delay)) {
                                if (!savedItems[usedUrl]) {
                                    savedItems[usedUrl] = {}
                                }
                                savedItems[usedUrl][elementUniqueId] = {
                                    elementKey: chosenElementId,
                                    delay: Math.min(2147483647, delay),
                                    innerText: includeText ? chosenElementInnerText : false
                                }
                                await saveData(usedUrl, savedItems[usedUrl])
                            }
                            handleCancel()
                        }
                        async function handleDelete() {
                            if (savedItems[usedUrl].hasOwnProperty(elementUniqueId)) {
                                delete savedItems[usedUrl][elementUniqueId]
                                if (!jsonIsEmpty(savedItems[usedUrl])) {
                                    await saveData(usedUrl, savedItems[usedUrl])
                                }
                            }
                            if (jsonIsEmpty(savedItems[usedUrl])) {
                                await deleteData(usedUrl)
                            }
                            handleCancel()
                        }
                        function handleCancel() {
                            let element = addedNode || document?.getElementById("auto-click-WuPtWCqvGTRZltvdSIN70")
                            element?.remove?.();
                        }
                    }
                }
            }
        });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    function init() {
        if (!chosenElementId) return
        if (!document?.getElementById?.('auto-click-WuPtWCqvGTRZltvdSIN70')) {
            let styleElement = document.createElement('style');
            styleElement.textContent = `
                #auto-click-WuPtWCqvGTRZltvdSIN70::-webkit-scrollbar {
                    display: none;
                }
                #auto-click-WuPtWCqvGTRZltvdSIN70 {
                    z-index: 2147483647;
                    font-family: system-ui,Roboto,-apple-system,BlinkMacSystemFont,Segoe UI,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
                    line-height: 1.15;
                    background-color: #0b1622;
                    color: white;
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 *, 
                #auto-click-WuPtWCqvGTRZltvdSIN70 ::after, 
                #auto-click-WuPtWCqvGTRZltvdSIN70 ::before {
                    margin: 0;
                    padding: 0;
                    text-indent: 0;
                    box-sizing: border-box;
                    -webkit-tap-highlight-color: transparent;
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 .textLogo, 
                #auto-click-WuPtWCqvGTRZltvdSIN70 h1,
                #auto-click-WuPtWCqvGTRZltvdSIN70 h2,
                #auto-click-WuPtWCqvGTRZltvdSIN70 h3,
                #auto-click-WuPtWCqvGTRZltvdSIN70 h4,
                #auto-click-WuPtWCqvGTRZltvdSIN70 h5,
                #auto-click-WuPtWCqvGTRZltvdSIN70 h6,
                #auto-click-WuPtWCqvGTRZltvdSIN70 p {
                    max-width: -moz-fit-content;
                    min-width: -moz-fit-content;
                    min-width: -webkit-fill-available;
                    max-width: fit-content;
                    min-width: fit-content;
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 .textLogo, 
                #auto-click-WuPtWCqvGTRZltvdSIN70 h1,
                #auto-click-WuPtWCqvGTRZltvdSIN70 h2, 
                #auto-click-WuPtWCqvGTRZltvdSIN70 h3, 
                #auto-click-WuPtWCqvGTRZltvdSIN70 h4, 
                #auto-click-WuPtWCqvGTRZltvdSIN70 h5, 
                #auto-click-WuPtWCqvGTRZltvdSIN70 h6, 
                #auto-click-WuPtWCqvGTRZltvdSIN70 input, 
                #auto-click-WuPtWCqvGTRZltvdSIN70 p, 
                #auto-click-WuPtWCqvGTRZltvdSIN70 textarea {
                    cursor: default;
                    -webkit-hyphens: manual;
                    -moz-hyphens: manual;
                    -ms-hyphens: manual;
                    hyphens: manual;
                    white-space: pre-wrap;
                    -ms-word-break: break-word;
                    word-break: break-word;
                    overflow-wrap: break-word;
                    transform-origin: left;
                    font-weight: 400;
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 input[type=text], 
                #auto-click-WuPtWCqvGTRZltvdSIN70 label, 
                #auto-click-WuPtWCqvGTRZltvdSIN70 p {
                    font-size: clamp(12px, 13px, 14px);
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 h2 {
                    font-size: clamp(13.757px,14.8785px,16px);
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 .confirm {
                    position: fixed;
                    z-index: 2147483647;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    overflow-y: auto;
                    overflow-x: hidden;
                    overscroll-behavior: contain;
                    user-select: none;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                    transform: translateZ(0);
                    -webkit-transform: translateZ(0);
                    -ms-transform: translateZ(0);
                    -moz-transform: translateZ(0);
                    -o-transform: translateZ(0);
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 .confirm::-webkit-scrollbar {
                    display: none;
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 .confirm-wrapper {
                    width: 100%;
                    height: 100%;
                    justify-content: center;
                    align-items: center;
                    display: flex;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 .confirm-wrapper::-webkit-scrollbar {
                    display: none;
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 .confirm-container {
                    animation: fadeIn 0.2s ease;
                    display: grid;
                    grid-template-rows: auto 20px;
                    background-color: #0b1622;
                    width: 350px;
                    min-height: 155px;
                    max-width: 95%;
                    max-height: 95%;
                    border-radius: 0px;
                    gap: 15px;
                    padding: 20px 10px 20px 25px;
                    cursor: default;
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 .confirm-info-container {
                    display: grid;
                    grid-template-rows: auto auto;
                    align-content: flex-start;
                    padding-right: 15px;
                    gap: 12px;
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 .confirm-title {
                    align-self: center;
                    font-size: 18px;
                    font-weight: 500;
                    color: white;
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 .confirm-input::placeholder {
                    color: aliceblue;
                }
                
                #auto-click-WuPtWCqvGTRZltvdSIN70 .confirm-input {
                    background: transparent;
                    border: transparent;
                    outline: none;
                    font-size: 16px;
                    height: 30px;
                    overflow-y: auto;
                    overflow-x: hidden;
                    color: aliceblue;
                    font-weight: 500;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 .confirm-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 1ch;
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 .confirm-input::-webkit-scrollbar {
                    display: none;
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 .confirm-button-container {
                    justify-self: end;
                    column-gap: 2px;
                    align-items: center;
                    display: flex;
                    justify-content: center;
                }

                #auto-click-WuPtWCqvGTRZltvdSIN70 .button {
                    color: white !important;
                    background-color: transparent;
                    outline: none;
                    border: none;
                    font-size: 14.1px;
                    font-weight: 425;
                    letter-spacing: 1px;
                    padding: 7.5px 5px;
                    min-width: 65px;
                    cursor: pointer;
                }

                @media (pointer: fine) {
                    #auto-click-WuPtWCqvGTRZltvdSIN70 .button:hover,
                    #auto-click-WuPtWCqvGTRZltvdSIN70 .button:focus {
                        background-color: rgba(0, 0, 0, 0.4);
                        border-radius: 6px;
                    }
                }
        
                @media screen and (min-width: 768px) {
                    #auto-click-WuPtWCqvGTRZltvdSIN70 .confirm-container {
                        width: 400px;
                        min-height: 164px;
                        border-radius: 6px !important;
                    }

                    #auto-click-WuPtWCqvGTRZltvdSIN70 .confirm-title {
                        font-size: 20px;
                    }

                    #auto-click-WuPtWCqvGTRZltvdSIN70 .button {
                        font-size: 12px;
                    }
                }

                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styleElement);
        }
        let htmlString = `
            <div id="auto-click-WuPtWCqvGTRZltvdSIN70">
                <div class="confirm">
                    <div class="confirm-wrapper">
                        <div class="confirm-container">
                            <div class="confirm-info-container">
                                <h2 class="confirm-title">Auto Click?</h2>
                                <input id="delayInput" type="text" placeholder="add some delay (ms)" class="confirm-input">
                                <label class="confirm-checkbox"><input id="includeText" type="checkbox" checked>Include Text</label>
                            </div> 
                            <div class="confirm-button-container">
                                <button class="cancel-btn button">CANCEL</button>
                                <button class="delete-btn button">DELETE</button>
                                <button class="confirm-btn button">OK</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', htmlString);
    }
});