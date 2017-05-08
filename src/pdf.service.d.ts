import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Http } from '@angular/http';
import { Compiler } from '@angular/core';
export interface PDFParams {
    comp: any;
    title: string | null | undefined;
    template: string | null | undefined;
    templatePath: string | null | undefined;
    css: string | null | undefined;
    cssPath: string | null | undefined;
    inputs: any | null | undefined;
}
export interface EmailParams {
    subject: string | null | undefined;
    message: string | null | undefined;
    to: string | null | undefined;
    cc: string | null | undefined;
    bcc: string | null | undefined;
}
export declare class PDFService {
    private http;
    private compiler;
    constructor(http: Http, compiler: Compiler);
    private templateComponent;
    private success;
    private fail;
    private fetchTemplate(params, success, fail);
    private createTemplateComponent(params, callback);
    private compileTemplate(params, success, fail);
    private wrapHTML(html, css);
    private createPDF(params, success, fail);
    private previewMacsPDF(html, title, success, fail);
    previewPDF(params: PDFParams): Promise<string | null | undefined>;
    savePDF(params: PDFParams): Promise<string | null | undefined>;
    emailPDF(pdfParams: PDFParams, emailParams: EmailParams): Promise<string | null | undefined>;
}
