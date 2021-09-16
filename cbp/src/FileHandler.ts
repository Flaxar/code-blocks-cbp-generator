import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as xmlBuilder from 'xmlbuilder2';
import { defaultXML } from './defaultXML';
import { format } from 'path';

export class FileHandler {

    readonly workFolder: string; // Path to the project folder
    readonly openedFileName: string;
    readonly projectType: string; // C or C++

    constructor(projectTitle: string) {
        if(vscode.workspace.workspaceFolders === undefined) {
            vscode.window.showErrorMessage("Couldn't find current working directory.");
            throw new Error("NO DIRECTORY");    
        } 
        this.workFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
        

        if(vscode.window.activeTextEditor?.document.uri.fsPath === undefined) {
            vscode.window.showErrorMessage("No file is opened.");
            throw new Error("NO FILE OPENED");
        }
        this.openedFileName = path.basename(vscode.window.activeTextEditor?.document.uri.fsPath);


        const regex: RegExp = /(?:\.([^.]+))?$/;
        const tmpResults = regex.exec(this.openedFileName);
        if(tmpResults === null) {
            vscode.window.showErrorMessage("The file has no extension.");
            throw new Error("NO EXTENSION");
        }
        this.projectType = tmpResults[1];
        if(this.projectType !== 'c' && this.projectType !== 'cpp') {
            vscode.window.showErrorMessage("The file is not a C or C++ file.");
            throw new Error("NOT C OR C++");
        }

        // console.log("Folder: " + this.workFolder);
        // console.log("File: " + this.openedFileName);

        this.generateProjectFile(projectTitle);
    }
    
    generateProjectFile(projectTitle: string) {
        let xml = xmlBuilder.convert(defaultXML, { format: "object" }) as any;

        // console.log(defaultXML);
        // console.log(xmlBuilder.convert(xml, { format: "json", prettyPrint: true }));


        xml.CodeBlocks_project_file.Project.Option[0]['@title'] = projectTitle;

        xml.CodeBlocks_project_file.Project.Unit = [];
        // console.log("1");

        //let i = 0;
        for(const file of this.findSourceFiles()) {
            // console.log("found source: %s", file);
            xml.CodeBlocks_project_file.Project.Unit.push({
                '@filename': file,
                Option: {
                    '@compilerVar': 'CC'
                }
            });
            //i++;
        }

        

        for(const file of this.findHeaders()) {
            // console.log("found header: %s", file);
            xml.CodeBlocks_project_file.Project.Unit.push({
                '@filename': file
            });
            //i++;
        }
        try{
            // console.log("converting %o to string", xml);
            // console.log(new XMLSerializer().serializeToString(xml));
            // console.log(xmlBuilder.convert(xml, { format: "json", prettyPrint: true }));
            const finalXMLString = xmlBuilder.convert(xml, { format: 'xml', prettyPrint: true });
            fs.writeFileSync(this.workFolder + "/Projekt.cbp", finalXMLString);
        } catch(e) {
            console.error(e);
        }

    }

    findSourceFiles(): string[] {
        const files = fs.readdirSync(this.workFolder)
        let sourceFiles: string[] = [];

        for (const file of files) {
            const regex: RegExp = /(?:\.([^.]+))?$/;
            const tmpResults = regex.exec(file);
            if(tmpResults !== null && tmpResults[1] === this.projectType) {
                sourceFiles.push(file);
            }
        }

        return sourceFiles;
    }

    findHeaders(): string[] {
        const files = fs.readdirSync(this.workFolder)
        let sourceFiles: string[] = [];

        for (const file of files) {
            const regex: RegExp = /(?:\.([^.]+))?$/;
            const tmpResults = regex.exec(file);
            if(tmpResults !== null && tmpResults[1] === 'h') {
                sourceFiles.push(file);
            }
        }

        return sourceFiles;
    }
}