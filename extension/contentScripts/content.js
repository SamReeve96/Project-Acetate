// Manage the page

// Initialize active state variable
let containerStateActive = false;

// Check if the comments panel should be in dark mode by default
let darkModeByDefault;

chrome.storage.sync.get('darkModeByDefault', data => {
    darkModeByDefault = data.darkModeByDefault;
});

// Add listener for messages from backend
chrome.extension.onMessage.addListener(handleMessage);
function handleMessage(request) {
    switch (request.type) {
    case 'changeContainerState':
        changeContainerState();
        break;
    case 'createAnnotation':
        createDraftAnnotation(request.content);
        break;
    case 'changeTheme':
        changeTheme();
        break;
    }
}

// Open the comment window and contain content on page load
chrome.storage.sync.get('activeOnPageLoad', data => {
    const savedStateActive = data.activeOnPageLoad;

    if (savedStateActive) {
        loadExtension();
    }
    // If the container isn't active in settings don't wrap content

    // Update the current state to the saved state
    containerStateActive = savedStateActive;
});

function changeContainerState() {
    if (!containerStateActive) {
        loadExtension();
    }

    containerStateActive = !containerStateActive;
}

function loadExtension() {
    addScriptsToPage();
    auditElements();
    createCommentContainer();
    loadAnnotationsFromCache();
}

// Label all elements on the page we can authenticate an element is the same as it was when created by comparing auditID and element type
function auditElements() {
    elementCounter = 1;
    elementsToAudit = document.querySelector('body');
    elementsToAudit.querySelectorAll('*').forEach(element => {
        element.setAttribute('element_audit_id', elementCounter);
        elementCounter++;
    });
}

// Manage the content container
function addScriptsToPage() {
    // Add google font for now
    document.head.innerHTML = document.head.innerHTML +
    "<link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet'>";
}

// By default a comment box is in edit mode
function createCommentContainer() {
    document.body.innerHTML = document.body.innerHTML +
    '<commentsContainer>' +

    // Hidden controls for now, will in the future move to popup js
    // '<div id="containerOptions">' +
    //     '<button id="share">Share</button>' +
    //     '<select id="annotationSort">' +
    //         '<option value="Element">Sort by Element</option>' +
    //         '<option value="Created">Sort by Created</option>' +
    //     '</select>' +
    // '</div>' +

    '</commentsContainer>' +

    '<template>' +
        '<div class="commentBox">' +
            '<textarea class="commentTextArea"> ' +
            'If you\'re reading this, then the template was used incorrectly' +
            '</textarea> ' +
            '<div class="controls">' +
                '<button id="annotate">Annotate</button>' +
                '<button id="update" class="hidden">Update Annotation</button>' +
                '<button id="edit"   class="hidden">Edit Annotation</button>' +
                '<button id="delete" class="hidden">Delete Annotation</button>' +
                '<button id="thread" class="hidden">Toggle Thread</button>' +
                '<button id="cancel">Cancel</button>' +
            '</div>' +
        '</div>' +
    '</template>';

    // If the user has set the theme to be dark mode by default, change to dark mode
    if (darkModeByDefault) {
        changeTheme();
    }

    // let sortDropdown = document.querySelector('select#annotationSort');
    // sortDropdown.addEventListener('change', function () {
    //     changeSort();
    // });
}

// Work out what element was right clicked
document.addEventListener('mousedown', event => {
    // Right click
    if (event.button === 2) {
        contextElement = event.target;

        const message = {
            type: 'setNewContextElement',
            // contextElement: contextElement, look into this...
            elementType: contextElement.nodeName,
            elementAuditID: contextElement.getAttribute('element_audit_id')
        };

        chrome.runtime.sendMessage(message);
    }
}, true);

console.log('ready for lift off');
