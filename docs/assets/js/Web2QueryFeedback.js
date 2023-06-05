window.addEventListener("load", function () {
    const form = document.getElementById('select2queryfeedback-form');
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const data = new FormData(form);
        const action = e.target.action;
        fetch(action, {
            method: 'POST',
            body: data,
        })
            .then(() => {
                alert("Success!");
            })
            .catch(() => {
                alert("Failed to save feedback.");
            })
    });
});

document.addEventListener("DOMContentLoaded", (event) => {
    fetchComments();
});

/**
 * Get comments for 'Select2Query' project and insert into HTML.
 */
function fetchComments() {
    const appsScriptGetFeedbackUrl = "https://script.google.com/macros/s/AKfycbzZEp0KvfORnqTFGSaj76KTlLf1NNMWfZF7eGDNV2b8lxbTtRtzGyDRjsP_zG-oeYjH/exec";
    const projectFilter = "?project=Select2Query";
    const fetchUrl = appsScriptGetFeedbackUrl + projectFilter;
    fetch(fetchUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (commentData) {
            const userComments = commentData.GoogleSheetData;

            const commentsHeaderPlaceHolder = document.querySelector("#data-header");
            let commentHeaderOut = "";
            let headerRow = userComments[0];
            for (let colName of headerRow) {
                commentHeaderOut += `<th>${colName}</th>`
            }
            commentsHeaderPlaceHolder.innerHTML = commentHeaderOut;

            const commentsPlaceHolder = document.querySelector("#data-output");
            let out = "";
            for (let i = 1; i < userComments.length; i++) {
                const singleComment = userComments[i];

                out += '<tr style="background-color:#fafbfc">';
                for (let colData of singleComment) {
                    out += `<td>${colData}</td>`;
                }
                out += "</tr>";
            }

            commentsPlaceHolder.innerHTML = out;
        });
}