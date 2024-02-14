const fs = require('fs');
const axios = require('axios');
const express = require("express");
const { google } = require('googleapis');
const router = express.Router();
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');


const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const TOKEN_PATH = path.join(process.cwd(), "../..",'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), "../..",'credentials.json');

async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

const downloadFile = async (req, res) => {
    try{
        const service = google.drive({ version: 'v3', auth: authClient });

        let {fileId,destinationFolderId} = req.body;
        authorize().then(async ()=>{

            const fileMetaData = await service.files.get({
                fileId: fileId, fields: 'name'
            },
            );

            // create stream writer with the file name from drive
            const fileStream = fs.createWriteStream(fileMetaData.data.name)
            console.log('downloading: ' + fileMetaData.data.name);
            
            const file = await service.files.get({
                fileId: fileId,
                alt: 'media',
            }, {
                responseType: "stream"
            }
            );
            uploadFileChunked(file, destinationFolderId);
            file.data.on('end', () => console.log('onCompleted'))
            file.data.pipe(fileStream);
        }).catch((e)=>{
            console.log("error while authenticating",e);
            throw e;
        })
           
            
    }catch(e){
        console.log("Error in downloading file",e);
        res.error(e);
    }
}
async function uploadFileChunked(filePath, destinationFolderId) {
    try {
        const fileSize = fs.statSync(filePath).size;
        const fileMetadata = {
            name: path.basename(filePath),
            parents: [destinationFolderId], // Specify the destination folder ID here
        };
        const media = {
            mimeType: 'application/octet-stream', // Change this according to your file's MIME type
            body: fs.createReadStream(filePath),
        };

        // Create a new file and upload it in chunks
        const res = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
            uploadType: 'resumable',
            // Recommended chunk size is 256 KB (256 * 1024 bytes). Adjust according to your needs.
            chunkSize: 256 * 1024,
        });

        console.log('File ID:', res.data.id);
    } catch (error) {
        console.error('Error uploading file:', error.message);
    }
}

const progess = async (req, res) => {
    try {
        let progress = {
            download: { total: 0, completed: 0, percentage: 0 },
            upload: { total: 0, completed: 0, percentage: 0 },
        };

        // Function to update progress (simplified)
        function updateProgress(type, completed, total) {
            progress[type] = { completed, total, percentage: (completed / total) * 100 };
        }

        setInterval(() => {
            if (progress.download.completed < progress.download.total) {
                updateProgress('download', progress.download.completed + 10, 100);
            }

            if (progress.upload.completed < progress.upload.total) {
                updateProgress('upload', progress.upload.completed + 5, 100);
            }
        }, 1000);

        res.send(progress);
    } catch (e) {
        console.error("error in progress", e);
        res.error(e);
    }
}

module.exports = { downloadFile, transfer, progess }

