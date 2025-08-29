const axios = require('axios')
//const {v4: uuidv4} = require('uuid')
const fs = require('fs')

const API_KEY = 'API_KEY'

const SHOULD_REPLACE = true
/**
 * Replacement options for video uploads:
 *
 * regenerate_ai_keep_options   → Regenerate AI resources and keep additional resources.
 *
 * regenerate_ai_remove_options → Regenerate AI resources and discard additional resources.
 *
 * keep_options                 → Keep AI resources and keep additional resources.
 *
 * remove_config_options        → Keep AI resources but discard additional resources.
 *
 * remove_ai_options            → Discard AI resources but keep additional resources.
 *
 * remove_options               → Discard both AI resources and additional resources.
 */
const REPLACE_VIDEO_OPTIONS = 'VIDEO_OPTIONS'

/**
 * The External ID of the video to replace.
 */
const REPLACE_VIDEO_EXTERNAL_ID = 'EXTERNAL_ID'

/**
 * The ID of the video to replace.
 */
const REPLACE_VIDEO_ID = 'VIDEO_ID'


const parseToBase64 = string=>Buffer.from(string).toString('base64')

const uploadVideo = async (filename) => {
  
  const binaryFile = fs.readFileSync(filename)

  let metadata = `authorization ${parseToBase64(API_KEY)}`

  metadata += `, should_replace ${parseToBase64(SHOULD_REPLACE.toString())}`
  metadata += `, replace_video_options ${parseToBase64(REPLACE_VIDEO_OPTIONS)}`
  metadata += `, replace_video_external_id ${parseToBase64(REPLACE_VIDEO_EXTERNAL_ID)}`
  metadata += `, replace_video_id ${parseToBase64(REPLACE_VIDEO_ID)}`

  try {
    const {data: uploadServers} = await axios.get('https://api-v2.pandavideo.com.br/hosts/uploader',{
      headers:{
        'Authorization': API_KEY,
      }
    });
    const allHosts = Object.values(uploadServers.hosts).reduce((acc,curr)=>([...acc,...curr]),[]);
    const host = allHosts[Math.floor(Math.random() * allHosts.length)];
    console.log(`Starting upload to ${host}`);

    // The binary file must be in the body of the POST request
    await axios.post(`https://${host}.pandavideo.com.br/files`,Buffer.from(binaryFile, 'binary'),{
      headers:{
        'Tus-Resumable': '1.0.0', 
        'Upload-Length': binaryFile.byteLength, 
        'Content-Type': 'application/offset+octet-stream', 
        'Upload-Metadata': metadata
      }
    });
    console.log('Upload concluido com sucesso');
  } catch (error) {
    console.log('UPLOAD ERROR');
    console.log(error);
  }

}

uploadVideo('teste.mkv')
