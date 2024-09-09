# Tomcat Manager for VS Code

The Tomcat Manager for VS Code extension streamlines the process of managing Apache Tomcat servers directly within your development environment. This extension automatically detects Tomcat installations on Windows or Linux systems, providing an intuitive interface to configure, start, stop, and monitor the server.

## Features

Key features include:

- **Automatic Tomcat Detection**: Searches for existing Tomcat installations on both Windows and Linux platforms.
- **Java WAR Deployment**: Easily deploy Java WAR files to your Tomcat server with a few clicks, simplifying the deployment process.
- **Server Control**: Manage Tomcat services (start, stop, restart) directly from the VS Code interface.
- **Custom Path Configuration**: Configure Tomcat installation paths manually, or let the extension detect it automatically.

Perfect for Java developers, this tool helps manage Tomcat deployments without leaving the VS Code editor.

## Requirements

- Visual Studio Code 1.60.0 or higher
- Apache Tomcat 7.x, 8.x, or 9.x installed on your system

## Extension Settings

This extension contributes the following settings:

* `tomcatManager.tomcatPath`: Set the path to your Tomcat installation directory.
* `tomcatManager.autoDetect`: Enable/disable automatic Tomcat detection (default: true).

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

### 1.0.0

Initial release of Tomcat Manager for VS Code

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
