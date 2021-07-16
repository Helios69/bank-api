import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'path';

export const storage = {
  storage: diskStorage({
    destination: './files/uploads/images/user_avatars',
    filename: (req, file, cb) => {
      const filename = `useravatar_${uuidv4()}`;
      const extension: string = parse(file.originalname).ext;

      cb(null, `${filename}${extension}`);
    },
  }),
};
