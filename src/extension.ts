// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as child_process from 'child_process';

const javaVersions = new Map<string, string>();

let tomcatPath: string | undefined;
let statusBarItem: vscode.StatusBarItem;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Tomcat Deployer is now active!');

	detectJavaVersions();

	let deployDisposable = vscode.commands.registerCommand('tomcat-deployer.deploy', deploy);
	let selectJavaDisposable = vscode.commands.registerCommand('tomcat-deployer.selectJava', selectJavaVersion);

	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.text = "$(rocket) Deploy WAR";
	statusBarItem.command = 'tomcat-deployer.deploy';
	statusBarItem.show();

	context.subscriptions.push(deployDisposable, selectJavaDisposable, statusBarItem);
}

async function deploy() {
	if (!tomcatPath) {
		tomcatPath = await detectTomcat();
	}

	if (!tomcatPath) {
		vscode.window.showErrorMessage('Tomcat installation not found.');
		return;
	}

	const warFile = await vscode.window.showOpenDialog({
		canSelectFiles: true,
		canSelectFolders: false,
		filters: { 'WAR files': ['war'] }
	});

	if (warFile && warFile[0]) {
		deployWar(warFile[0].fsPath);
	}
}

async function detectTomcat(): Promise<string | undefined> {
	const isWindows = os.platform() === 'win32';
	const possiblePaths = isWindows
		? ['C:\\Program Files\\Apache Software Foundation\\Tomcat 9.0', 'C:\\Tomcat']
		: ['/opt/tomcat', '/usr/local/tomcat'];

	for (const path of possiblePaths) {
		if (fs.existsSync(path)) {
			return path;
		}
	}

	return undefined;
}

async function deployWar(warPath: string) {
	if (!tomcatPath) return;

	const webappsDir = path.join(tomcatPath, 'webapps');
	const destinationPath = path.join(webappsDir, path.basename(warPath));

	try {
		fs.copyFileSync(warPath, destinationPath);
		vscode.window.showInformationMessage(`WAR file deployed to ${destinationPath}`);
	} catch (error) {
		vscode.window.showErrorMessage(`Failed to deploy WAR file: ${error}`);
	}
}

function detectJavaVersions() {
	const isWindows = os.platform() === 'win32';
	const javaHome = process.env.JAVA_HOME;
	
	if (javaHome) {
		try {
			const version = child_process.execSync(`"${path.join(javaHome, 'bin', 'java')}" -version 2>&1`).toString();
			const match = version.match(/"(\d+\.\d+\.\d+)"/);
			if (match) {
				javaVersions.set(match[1], javaHome);
			}
		} catch (error) {
			console.error('Error detecting Java version from JAVA_HOME:', error);
		}
	}

	const commonPaths = isWindows
		? ['C:\\Program Files\\Java', 'C:\\Program Files (x86)\\Java']
		: ['/usr/lib/jvm', '/Library/Java/JavaVirtualMachines'];

	for (const basePath of commonPaths) {
		if (fs.existsSync(basePath)) {
			const dirs = fs.readdirSync(basePath);
			for (const dir of dirs) {
				const javaPath = path.join(basePath, dir);
				try {
					const version = child_process.execSync(`"${path.join(javaPath, 'bin', 'java')}" -version 2>&1`).toString();
					const match = version.match(/"(\d+\.\d+\.\d+)"/);
					if (match)
						javaVersions.set(match[1], javaPath);
				} catch (error) {
					console.error(`Error detecting Java version from ${javaPath}:`, error);
				}
			}
		}
	}
}

async function selectJavaVersion() {
	const versions = Array.from(javaVersions.keys());
	const selected = await vscode.window.showQuickPick(versions, { placeHolder: 'Select Java version' });
	if (selected) {
		// Use the selected Java version (e.g., set it as default)
		vscode.window.showInformationMessage(`Selected Java version: ${selected}`);
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
