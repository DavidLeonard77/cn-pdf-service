"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs/add/operator/map");
require("rxjs/add/operator/toPromise");
var http_1 = require("@angular/http");
var core_1 = require("@angular/core");
;
;
;
var PDFService = (function () {
    function PDFService(http, compiler) {
        this.http = http;
        this.compiler = compiler;
    }
    // Callsback with template string
    PDFService.prototype.fetchTemplate = function (params, success, fail) {
        if (params.template)
            success(params.template);
        else if (params.templatePath) {
            this.http
                .get(params.templatePath)
                .map(function (res) { return success(res.text()); })
                .toPromise();
        }
        else
            fail(null);
    };
    // Creates the template component
    PDFService.prototype.createTemplateComponent = function (params, callback) {
        // Cleanup
        if (this.templateComponent)
            this.templateComponent.destroy();
        var TemplateComponent = (function () {
            function TemplateComponent() {
                this.inputs = params.inputs;
            }
            return TemplateComponent;
        }());
        TemplateComponent = __decorate([
            core_1.Component({ template: params.template })
        ], TemplateComponent);
        var TemplateModule = (function () {
            function TemplateModule() {
            }
            return TemplateModule;
        }());
        TemplateModule = __decorate([
            core_1.NgModule({ declarations: [TemplateComponent] })
        ], TemplateModule);
        var mod = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
        var factory = mod.componentFactories.find(function (comp) { return comp.componentType === TemplateComponent; });
        this.templateComponent = params.comp.createComponent(factory);
        callback(null);
    };
    // Applies the template to the component and compiles
    PDFService.prototype.compileTemplate = function (params, success, fail) {
        var _this = this;
        var noTemplate = 'No template provided';
        this.fetchTemplate(params, function (template) {
            if (template) {
                params.template = template;
                _this.createTemplateComponent(params, function () {
                    // Destroy <ng-component> after we resolve the text;
                    setTimeout(function () { return _this.templateComponent.destroy(); }, 1000);
                    setTimeout(function () { return success(_this.templateComponent._viewRef.rootNodes[0].innerHTML); });
                });
            }
            else
                fail(noTemplate);
        }, function () { return fail(noTemplate); });
    };
    // Wrapes the compiled template
    PDFService.prototype.wrapHTML = function (html, css) {
        var wrap = '<html>';
        if (css) {
            wrap += '<style>' + css + '</style>';
        }
        wrap += '<body>' + html + '</body></html>';
        return wrap;
    };
    // Put it all together 
    PDFService.prototype.createPDF = function (params, success, fail) {
        var _this = this;
        var finish = function (css) {
            _this.compileTemplate(params, function (compHTML) { return success(_this.wrapHTML(compHTML, css)); }, function (error) { return fail(error); });
        };
        // css
        var css = params.css;
        if (params.cssPath) {
            this.http
                .get(params.cssPath)
                .map(function (res) {
                css += ';' + res.text();
                finish(css);
            })
                .toPromise();
        }
        else
            finish(css);
    };
    PDFService.prototype.previewMacsPDF = function (html, title, success, fail) {
        console.log(html);
        macs.getPathForConvertedPDFFileFromHTML({ pageContent: encodeURIComponent(html), generatedPDFName: title }, function (result) {
            macs.viewAsset(result.filePath, function () { return success(null); }, function (error) { return fail(error); });
        }, function (error) { return fail(error); });
    };
    // Public methods ====================================================
    // Compile a PDF and preview with macs.js
    PDFService.prototype.previewPDF = function (params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.createPDF(params, function (html) {
                _this.previewMacsPDF(html, params.title || 'document', function () { return resolve(); }, function (error) { return reject(error); });
            }, function (error) { return reject(error); });
        });
    };
    ;
    PDFService.prototype.savePDF = function (params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.createPDF(params, function (html) {
                // Save to file
                // macs.convertHTMLToPDF(
                //   { pageContent: encodeURIComponent(html) },
                //   response => {
                //     this.previewMacsPDF(
                //       html,
                //       response.itemName || params.title || 'document',
                //       () => resolve(), error => reject(error));
                //   },
                //   error => reject(error)
                // );
            }, function (error) { return reject(error); });
        });
    };
    ;
    PDFService.prototype.emailPDF = function (pdfParams, emailParams) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // Compile HTML
            _this.createPDF(pdfParams, function (html) {
                console.log(html);
                // macs.getPathForConvertedPDFFileFromHTML(
                //   { pageContent: encodeURIComponent(html), generatedPDFName: pdfParams.title || 'document' },
                //   result => {
                //     // Email PDF
                //     macs.emailWithMultipleAssets(
                //       { email: emailParams, assets: result.filePath },
                //       () => resolve(), error => reject(error)
                //     )
                //   },
                //   error => reject(error)
                // )
            }, function (error) { return reject(error); });
        });
    };
    ;
    return PDFService;
}());
PDFService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http,
        core_1.Compiler])
], PDFService);
exports.PDFService = PDFService;
//# sourceMappingURL=pdf.service.js.map