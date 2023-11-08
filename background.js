let savedItemsID = " clicked-html-WuPtWCqvGTRZltvdSIN70"
let dataTable, savedUrls = {}, options = {}
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
            chrome.storage.sync.remove(key, () => {
                // Delete saved items
                chrome.storage.sync.remove(key + savedItemsID, resolve);
            });
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

function getUrls(url) {
    try {
        let allUrl = new URL(url)
        return {
            "Origin": allUrl?.origin || undefined,
            "Full URL": url || undefined,
            "Origin & Pathname": ((allUrl?.origin || "") + (allUrl?.pathname || "")) || undefined,
        }
    } catch (ex) {
        return {}
    }
}

function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for (i = L; i >= 0; i--) {
        selectElement.remove(i);
    }
}

chrome.storage.sync.get(null, function (items) {
    chrome.tabs.query({ active: true }, function (tabs) {
        if (tabs.length > 0) {
            let currentTabURL = tabs[0].url;
            options = getUrls(currentTabURL)
            let urlTypeSelection = document.getElementById('urlType');
            let urlInputEl = document.getElementById("urlInput")
            let urlInputVal = urlInputEl?.value
            let addedUrl = {}
            for (let key in options) {
                if (!options[key] || addedUrl[options[key]]) continue
                if (!urlInputVal) {
                    urlInputVal = options[key]
                    urlInputEl.value = options[key]
                }
                urlTypeSelection.options[urlTypeSelection.options.length] = new Option(options[key], key)
                addedUrl[options[key]] = true
            }
            urlTypeSelection.options[urlTypeSelection.options.length] = new Option("Starts With", "Starts With")
        }
    });
    for (let key in items) {
        if (!key.endsWith(savedItemsID)) {
            savedUrls[key] = items[key]
        }
    }
    dataTable = document.getElementById('data-table');
    if (!jsonIsEmpty(savedUrls) && dataTable instanceof HTMLElement) {
        dataTable.classList.add("show")
    }
    let tBodyRef = dataTable.querySelector("tbody")
    for (let key in savedUrls) {
        if (savedUrls.hasOwnProperty(key)) {
            let row = tBodyRef.insertRow(-1);
            let urlCell = row.insertCell(0);
            let typeCell = row.insertCell(1);
            let modeCell = row.insertCell(2);
            let deleteCell = row.insertCell(3);

            urlCell.innerHTML = key;
            typeCell.innerHTML = savedUrls?.[key]?.type;

            let modeHtml;
            if (savedUrls?.[key]?.disabled) {
                modeHtml = `
                <div class="mode-container disabled">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                </div>`
            } else {
                modeHtml = `
                <div class="mode-container">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                </div>`
            }

            modeCell.innerHTML = modeHtml

            let htmlString = `
                <div class="delete-container">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" /></svg>
                </div>
            `
            deleteCell.insertAdjacentHTML('beforeend', htmlString);
        }
    }
});

document.getElementById('urlInput')?.addEventListener("keyup", (e) => {
    let inputVal = e?.target?.value
    let isIncluded = false;
    for (let key in options) {
        if (options[key] === inputVal) {
            isIncluded = true
        }
    }
    let urlTypeEl = document.getElementById("urlType")
    if (!isIncluded) {
        urlTypeEl.value = "Starts With"
    }
})

document.getElementById('urlType')?.addEventListener("change", (e) => {
    let urlInputEl = document.getElementById("urlInput")
    let urlInputText = e?.target?.selectedOptions?.[0]?.innerText
    if (urlInputText
        && urlInputText !== "Starts With"
        && urlInputEl instanceof Element && urlInputEl?.tagName === "INPUT"
    ) {
        urlInputEl.value = urlInputText
    }
})

document.getElementById("addUrl")?.addEventListener("click", async () => {
    let urlInputVal = document.getElementById("urlInput")?.value
    let urlTypeVal = document.getElementById("urlType")?.value
    if (urlInputVal && urlTypeVal) {
        dataTable.classList.remove("show")
        savedUrls[urlInputVal] = {
            type: urlTypeVal,
            disabled: false
        }
        await saveData(urlInputVal, savedUrls[urlInputVal])
        chrome.storage.sync.get(null, function (items) {
            savedUrls = {}
            for (let key in items) {
                if (!key.endsWith(savedItemsID)) {
                    savedUrls[key] = items[key]
                }
            }
            dataTable = dataTable || document.getElementById('data-table');
            if (!jsonIsEmpty(savedUrls) && dataTable instanceof HTMLElement) {
                let tBodyRef = dataTable.querySelector("tbody")
                tBodyRef.innerHTML = ''
                for (let key in savedUrls) {
                    if (savedUrls.hasOwnProperty(key)) {
                        let row = tBodyRef.insertRow(-1);
                        let urlCell = row.insertCell(0);
                        let typeCell = row.insertCell(1);
                        let modeCell = row.insertCell(2);
                        let deleteCell = row.insertCell(3);

                        urlCell.innerHTML = key;
                        typeCell.innerHTML = savedUrls?.[key]?.type;

                        let modeHtml;
                        if (savedUrls?.[key]?.disabled) {
                            modeHtml = `
                            <div class="mode-container disabled">
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                            </div>`
                        } else {
                            modeHtml = `
                            <div class="mode-container">
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                            </div>`
                        }

                        modeCell.innerHTML = modeHtml

                        let htmlString = `
                            <div class="delete-container">
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" /></svg>
                            </div>
                        `
                        deleteCell.insertAdjacentHTML('beforeend', htmlString);
                    }
                }
                dataTable.classList.add("show")
            }
        })
    }
})

document.addEventListener("click", async (e) => {
    let target = e?.target;
    let classList = target?.classList;
    let deleteContainer = target.closest(".delete-container") || classList.contains("delete-container")
    let modeContainer = target.closest(".mode-container") || classList.contains("mode-container")
    if (
        !(modeContainer || deleteContainer)
    )
        return;
    let closestUrl = target?.closest?.("tr")?.children?.[0]?.innerText
    if (savedUrls[closestUrl]) {
        dataTable.classList.remove("show")
        if (deleteContainer) {
            await deleteData(closestUrl)
        } else if (modeContainer) {
            savedUrls[closestUrl].disabled = !modeContainer?.classList?.contains?.("disabled")
            await saveData(closestUrl, savedUrls[closestUrl])
        }
        chrome.storage.sync.get(null, function (items) {
            savedUrls = {}
            for (let key in items) {
                if (!key.endsWith(savedItemsID)) {
                    savedUrls[key] = items[key]
                }
            }
            dataTable = dataTable || document.getElementById('data-table');
            if (!jsonIsEmpty(savedUrls) && dataTable instanceof HTMLElement) {
                let tBodyRef = dataTable.querySelector("tbody")
                tBodyRef.innerHTML = ''
                for (let key in savedUrls) {
                    if (savedUrls.hasOwnProperty(key)) {
                        let row = tBodyRef.insertRow(-1);
                        let urlCell = row.insertCell(0);
                        let typeCell = row.insertCell(1);
                        let modeCell = row.insertCell(2);
                        let deleteCell = row.insertCell(3);

                        urlCell.innerHTML = key;
                        typeCell.innerHTML = savedUrls?.[key]?.type;

                        let modeHtml;
                        if (savedUrls?.[key]?.disabled) {
                            modeHtml = `
                            <div class="mode-container disabled">
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
                            </div>`
                        } else {
                            modeHtml = `
                            <div class="mode-container">
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                            </div>`
                        }

                        modeCell.innerHTML = modeHtml

                        let htmlString = `
                            <div class="delete-container">
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" /></svg>
                            </div>
                        `
                        deleteCell.insertAdjacentHTML('beforeend', htmlString);
                    }
                }
                dataTable.classList.add("show")
            }
        })
    }
})