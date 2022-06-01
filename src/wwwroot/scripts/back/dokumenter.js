import {$, pageInit, toaster} from "../base";
import Quill from "../vendor/quill";
import {uploadDocumentImages, getDocument, setDocument} from "../api/documents-api";
import {configuration} from "../configuration";
import {utilites} from "../utilities";
import {strings} from "../i10n";

if (location.pathname.startsWith("/kontoret/dokumenter")) {
    const documentSelect = $("#document-selector");
    const publishButton = $("#publish-button");
    const toolbarOptions = [["link", "image"],
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{"header": 1}, {"header": 2}],
        [{"list": "ordered"}, {"list": "bullet"}],
        [{"script": "sub"}, {"script": "super"}],
        [{"indent": "-1"}, {"indent": "+1"}],
        [{"direction": "rtl"}],
        [{"size": ["small", false, "large", "huge"]}],
        [{"header": [1, 2, 3, 4, 5, 6, false]}],
        [{"color": []}, {"background": []}],
        [{"font": []}],
        [{"align": []}],
        ["clean"]];


    pageInit(() => {
        documentSelect.onchange = () => setDocumentContent();
        publishButton.onclick = () => publishDocument();
        const editor = new Quill("#editor", {
            theme: "snow",
            modules: {
                toolbar: toolbarOptions,
                blotFormatter: true,
                imageDrop: true,
                imageUploader: {
                    upload: (file) => new Promise(((resolve, reject) => {
                        uploadDocumentImages([file]).then(res => {
                            if (res.ok) {
                                res.json().then(fileNames => {
                                    fileNames = utilites.resolveReferences(fileNames);
                                    resolve(configuration.paths.documents + fileNames[0]);
                                });
                            } else {
                                reject(res);
                            }
                        }).catch(error => {
                            reject(error);
                        });
                    })),
                },
            },
        });

        function publishDocument() {
            const html = editor.container.querySelector(".ql-editor").innerHTML;
            if (!html || html === "<p><br></p>") return;
            setDocument(documentSelect.value, html).then(res => {
                if (res.ok) {
                    toaster.success("Dokumentet er publisert");
                } else {
                    utilites.handleError(res, {
                        title: "Kunne ikke publisere dokumentet",
                        message: "Prøv igjen senere",
                    });
                }
            }).catch(error => {
                console.error(error);
                toaster.errorObj({
                    title: strings.languageSpesific.could_not_reach_server,
                    message: strings.languageSpesific.try_again_soon,
                });
            });
        }

        function setDocumentContent() {
            getDocument(documentSelect.value).then(res => {
                if (res.ok) {
                    res.text().then(content => {
                        editor.setText("");
                        if (content) {
                            editor.clipboard.dangerouslyPasteHTML(0, content);
                        }
                    });
                } else {
                    utilites.handleError(res, {
                        title: strings.languageSpesific.an_error_occured,
                        message: strings.languageSpesific.try_again_soon,
                    });
                }
            }).catch(error => {
                console.error(error);
                toaster.errorObj({
                    title: strings.languageSpesific.could_not_reach_server,
                    message: strings.languageSpesific.try_again_soon,
                });
            });
        }

        setDocumentContent();
    });
}