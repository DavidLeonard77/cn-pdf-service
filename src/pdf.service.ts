import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Http } from '@angular/http';
import { Injectable, Compiler, Component, NgModule } from '@angular/core';

declare let macs: any;

export interface PDFParams {
  comp:any,
  title:string|null|undefined,
  template:string|null|undefined,
  templatePath:string|null|undefined,
  css:string|null|undefined,
  cssPath:string|null|undefined,
  inputs:any|null|undefined
};

export interface EmailParams {
  subject:string|null|undefined,
  message:string|null|undefined,
  to:string|null|undefined,
  cc:string|null|undefined,
  bcc:string|null|undefined
};

interface Callback { (myArgument:string|null):void };

@Injectable()
export class PDFService {

  constructor(
    private http: Http,
    private compiler: Compiler,
  ) { }

  private templateComponent:any;

  private success:Callback;
  private fail:Callback;

  // Callsback with template string
  private fetchTemplate(params:PDFParams, success:Callback, fail:Callback):void {

    if (params.template) success( params.template );

    else if (params.templatePath) {
      this.http
        .get( params.templatePath )
        .map( res => success( res.text() ) )
        .toPromise();
    }
    
    else fail(null);

  }

  // Creates the template component
  private createTemplateComponent(params:PDFParams, callback:Callback):void {

      // Cleanup
      if (this.templateComponent) this.templateComponent.destroy();

      @Component({ template: params.template })
      class TemplateComponent {
        public inputs:any = params.inputs;
      }

      @NgModule({declarations: [TemplateComponent]})
      class TemplateModule {}

      const mod:any = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
      const factory:any = mod.componentFactories.find(comp => comp.componentType === TemplateComponent);
      this.templateComponent = params.comp.createComponent(factory);

      callback(null);
  }

  // Applies the template to the component and compiles
  private compileTemplate(params:PDFParams, success:Callback, fail:Callback):void {

    const noTemplate = 'No template provided';

    this.fetchTemplate(
      
      params,
      
      template => {

        if (template) {

          params.template = template;
          this.createTemplateComponent(params, () => {
            
            // Destroy <ng-component> after we resolve the text;
            setTimeout(() =>  this.templateComponent.destroy(), 1000);
            setTimeout(() => success(this.templateComponent._viewRef.rootNodes[0].innerHTML));
        
          })
        }

        else fail(noTemplate);

      },
      
      () => fail(noTemplate)
      
    );
  
  }

  // Wrapes the compiled template
  private wrapHTML(html:string, css:string|null):string {
    let wrap = '<html>';
    if (css) {
      wrap += '<style>' + css + '</style>';
    }
    wrap += '<body>' + html + '</body></html>';
    return wrap;
  }

  // Put it all together 
  private createPDF(params:PDFParams, success:Callback, fail:Callback):void {
      
    let finish = (css:string|undefined|null):void => {
      this.compileTemplate(
        params,
        compHTML => success( this.wrapHTML(compHTML, css) ),
        error => fail(error)
      );
    }

    // css
    let css:string = params.css;
    if (params.cssPath) {
      this.http
        .get(params.cssPath)
        .map(res => {
          css += ';' + res.text();
          finish(css);
        })
        .toPromise();
    }

    else finish(css);

  }

  private previewMacsPDF(html:string, title:string, success:Callback, fail:Callback):void {
  
    console.log(html);

    macs.getPathForConvertedPDFFileFromHTML(

      { pageContent: encodeURIComponent(html), generatedPDFName: title },
      
      result => {

        macs.viewAsset(
          result.filePath,
          () => success(null), error => fail(error)
        );

      },
      
      error => fail(error)
    
    );

  }

  // Public methods ====================================================
  
  // Compile a PDF and preview with macs.js
  public previewPDF(params:PDFParams):Promise<string|null|undefined> {
    return new Promise<string|null|undefined>((resolve, reject) => {

      this.createPDF(
        params,
        html => {

          this.previewMacsPDF(
            html,
            params.title || 'document',
            () => resolve(), error => reject(error)
          );

        },
        error => reject(error)
      );

    });

  };

  public savePDF(params:PDFParams):Promise<string|null|undefined> {
    return new Promise<string|null|undefined>((resolve, reject) => {

      this.createPDF(
        params,
        html => {

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

        },
        
        error => reject(error)
      
      );

    });

  };

  public emailPDF (pdfParams:PDFParams,emailParams:EmailParams):Promise<string|null|undefined> {
    return new Promise<string|null|undefined>((resolve, reject) => {

      // Compile HTML
      this.createPDF(
        pdfParams,
        html => {
          
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

        },
        
        error => reject(error)

      );

    });
  };

}