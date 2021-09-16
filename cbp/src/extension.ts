import * as vscode from 'vscode';
import { FileHandler } from './FileHandler';

export function activate(context: vscode.ExtensionContext) {
	
	console.log('Creating Projekt.cbp file...');

	let disposable = vscode.commands.registerCommand('cbp.create', () => {
		// vscode.window.showInformationMessage('Hello World from .cbp generator!');

		try {
			let fileHandler = new FileHandler("Projekt"); // Name
		} catch(e) {
			return;
		}

		console.log('Project file created!');

	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
