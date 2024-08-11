export interface refrenceTypes {
    refrenceType: 'profile_pic' | 'chat_doc'
  }
  
  
  export interface mimeTypes {
    mimetype: 'image/jpeg' | 'image/png' | 'image/webp'
  }

  export interface fileType {
    buffer: Buffer;
    mimetype: string;
    filename: string;
  }
  