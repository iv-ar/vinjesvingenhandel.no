export function uploadDocumentImages(files: Array<File>): Promise<Response> {
    if (files.length <= 0) throw new Error("files.length was " + files.length);
    const data = new FormData();
    for (const file of files)
        data.append("files", file);

    return fetch("/api/documents/upload-images", {
        method: "post",
        body: data
    });
}

export function getDocument(documentType: string) {
    return fetch("/api/documents/" + documentType);
}

export function setDocument(documentType: string, content: string) {
    const fd = new FormData();
    fd.append("content", content);
    return fetch("/api/documents/" + documentType, {
        method: "post",
        body: fd,
    });
}