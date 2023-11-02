var Presenter = {
    showLoading(title, modal) {
        this._loadingTemplate = this.getLoadingDoc(title);
        if (modal) {
            this._loadingTemplate.loadedAsModal = true;
            console.log("show modalLoading");
            navigationDocument.presentModal(this._loadingTemplate);
        } else {
            navigationDocument.pushDocument(this._loadingTemplate);
        }
    },

    removeLoadingTemplate() {
        if (this._loadingTemplate) {
            if (this._loadingTemplate.loadedAsModal) {
                // do nothing, 
                navigationDocument.dismissModal();
            } else {
                navigationDocument.removeDocument(this._loadingTemplate);
            }
            this._loadingTemplate = undefined;
        }
    },

    getLoadingDoc(title) {
        return Presenter.makeDocument(Templates.loading(title));
    },

    makeDocument(resource, replace = false) {
        if (replace) { resource = resource.replace(/&/g,"&amp;").replace(/'/g,"&apos;"); }
        if (!Presenter.parser) {
            Presenter.parser = new DOMParser();
        }
        var doc = Presenter.parser.parseFromString(resource, "application/xml");
        return doc;
    },

    modalDocument(doc) {
        navigationDocument.presentModal(doc);
    },

    dismissModal() {
        Presenter.removeLoadingTemplate();
        navigationDocument.dismissModal();
    },

    pushDocument(xml) {
        if (this._loadingTemplate) {
            try {
                navigationDocument.replaceDocument(xml, this._loadingTemplate);
            } catch (e) {
                navigationDocument.pushDocument(xml);
                console.log("Can't replace loading template");
            }
            this._loadingTemplate = undefined;
        } else {
            console.log("Document pushed without loading screen");
            navigationDocument.pushDocument(xml);
        }
    },
    
    replaceDocument(xml, old) {
        old = old || getActiveDocument()
        navigationDocument.replaceDocument(xml, old);
    },

    activeParser(doc) {
        doc = doc || getActiveDocument();
        var domImplementation = doc.implementation;
        var lsParser = domImplementation.createLSParser(1, null);
        var lsInput = domImplementation.createLSInput();
        return {'doc' : doc, 'lsParser': lsParser, 'lsInput' : lsInput}
    }
};