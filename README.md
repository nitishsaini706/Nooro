## Features
- Authenticate with Google OAuth2
- Download files from Google Drive
- Upload files to Google Drive in chunks
- Track progress of downloads and uploads

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites
What things you need to install the software and how to install them:

Node.js and npm
Google Cloud Platform project with the Drive API enabled and OAuth 2.0 credentials obtained
Installing
A step-by-step series of examples that tell you how to get a development environment running:

### Clone the repository
bash
Copy code
git clone https://[Noro](https://github.com/nitishsaini706/Nooro)
cd Nooro
Install dependencies
npm install


Configure OAuth 2.0 credentials
Place your credentials.json file in the root of the project directory and not src.
Update CREDENTIALS_PATH and TOKEN_PATH in your application to match your credentials file and desired token storage path.
Consider setting environment variables for sensitive information such as client IDs, client secrets, and refresh tokens.

Running the Application
npm start
