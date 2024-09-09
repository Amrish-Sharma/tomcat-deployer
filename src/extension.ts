import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

let statusBarItem: vscode.StatusBarItem;
let javaHomeInput: vscode.InputBox;
let tomcatPathInput: vscode.InputBox;

export function activate(context: vscode.ExtensionContext) {
    console.log('Tomcat Deployer is now active!');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(rocket) Tomcat Deployer";
    statusBarItem.command = 'tomcat-deployer.showMenu';
    statusBarItem.show();

    // Create input boxes
    javaHomeInput = vscode.window.createInputBox();
    javaHomeInput.placeholder = 'Enter Java Home Path';
    javaHomeInput.prompt = 'Java Home Path';

    tomcatPathInput = vscode.window.createInputBox();
    tomcatPathInput.placeholder = 'Enter Tomcat Installation Path';
    tomcatPathInput.prompt = 'Tomcat Path';

    // Register commands
    let showMenuDisposable = vscode.commands.registerCommand('tomcat-deployer.showMenu', showMenu);
    let verifyJavaDisposable = vscode.commands.registerCommand('tomcat-deployer.verifyJava', verifyJava);
    let verifyTomcatDisposable = vscode.commands.registerCommand('tomcat-deployer.verifyTomcat', verifyTomcat);
    let deployDisposable = vscode.commands.registerCommand('tomcat-deployer.deploy', deploy);

    context.subscriptions.push(statusBarItem, showMenuDisposable, verifyJavaDisposable, verifyTomcatDisposable, deployDisposable);
}

async function showMenu() {
    const choice = await vscode.window.showQuickPick([
        'Set Java Home',
        'Set Tomcat Path',
        'Verify Java Installation',
        'Verify Tomcat Installation',
        'Deploy WAR'
    ], { placeHolder: 'Select an action' });

    switch (choice) {
        case 'Set Java Home':
            javaHomeInput.show();
            break;
        case 'Set Tomcat Path':
            tomcatPathInput.show();
            break;
        case 'Verify Java Installation':
            vscode.commands.executeCommand('tomcat-deployer.verifyJava');
            break;
        case 'Verify Tomcat Installation':
            vscode.commands.executeCommand('tomcat-deployer.verifyTomcat');
            break;
        case 'Deploy WAR':
            vscode.commands.executeCommand('tomcat-deployer.deploy');
            break;
    }
}

async function verifyJava() {
    const javaHome = javaHomeInput.value;
    if (!javaHome) {
        vscode.window.showErrorMessage('Java Home path is not set. Please set it first.');
        return;
    }

    const javaPath = path.join(javaHome, 'bin', 'java');
    try {
        const output = child_process.execSync(`"${javaPath}" -version 2>&1`).toString();
        vscode.window.showInformationMessage(`Java verified: ${output.split('\n')[0]}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to verify Java: ${error}`);
    }
}

async function verifyTomcat() {
    const tomcatPath = tomcatPathInput.value;
    if (!tomcatPath) {
        vscode.window.showErrorMessage('Tomcat path is not set. Please set it first.');
        return;
    }

    const versionFile = path.join(tomcatPath, 'RELEASE-NOTES');
    if (fs.existsSync(versionFile)) {
        const content = fs.readFileSync(versionFile, 'utf8');
        const versionMatch = content.match(/Apache Tomcat Version ([.\d]+)/);
        if (versionMatch) {
            vscode.window.showInformationMessage(`Tomcat verified: Version ${versionMatch[1]}`);
        } else {
            vscode.window.showWarningMessage('Tomcat installation found, but version could not be determined.');
        }
    } else {
        vscode.window.showErrorMessage('Tomcat installation not found or invalid.');
    }
}

async function deploy() {
    const javaHome = javaHomeInput.value;
    const tomcatPath = tomcatPathInput.value;

    if (!javaHome || !tomcatPath) {
        vscode.window.showErrorMessage('Please provide both Java Home and Tomcat paths.');
        return;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return;
    }

    const targetDir = path.join(workspaceFolders[0].uri.fsPath, 'target');
    if (!fs.existsSync(targetDir)) {
        vscode.window.showErrorMessage('No target directory found in the current project.');
        return;
    }

    const warFiles = fs.readdirSync(targetDir).filter(file => file.endsWith('.war'));
    if (warFiles.length === 0) {
        vscode.window.showErrorMessage('No WAR file found in the target directory.');
        return;
    }

    const warFile = warFiles[0]; // Assuming there's only one WAR file
    const sourcePath = path.join(targetDir, warFile);
    const destinationPath = path.join(tomcatPath, 'webapps', warFile);

    try {
        fs.copyFileSync(sourcePath, destinationPath);
        vscode.window.showInformationMessage(`WAR file deployed to ${destinationPath}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to deploy WAR file: ${error}`);
    }
}

export function deactivate() {}
