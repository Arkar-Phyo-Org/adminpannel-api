import multer, { FileFilterCallback } from "multer";
import cors from "cors";
import express from "express";
import { SERVER_DOMAIN, SERVER_PORT } from "./config";
import { join } from "path";
import { v4 } from "uuid";
import { AuthRouter } from "./routers/AuthRouter";
import { UserRouter } from "./routers/UserRouter";
// import MailService from "./config/nodemailerConfig";
// import Logging from "./lib/Logging";

// ==========================================================================================
const app = express();
// const mailService = MailService.getInstance();
// mailService.createConnection();
// Logging.info("SMTP Server Connected");
// Logging.info("SMTP Connection verified");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: true,
  // origin: "http://localhost:3000",
  // credentials: true, //access-control-allow-credentials:true
  // optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

/**
 * FILE UPLOAD PROCESS
 * 1. create public/images/upload path on root directory.
 * 2. The name object in fielss function must be the formInput name. Register here for more inputName.
 * The default upload directory is public.
 *
 * USE BELLOW STYLE TO MANIPULATE FILE UPLOAD
 * const fileNm = req && req.files && req.files.logo && req.files.logo[0].filename;
 * const filePath = `http://127.0.0.1:${SERVER_PORT}/images/upload/${fileNm}`;
 *
 * The final filePath will be on localhost ip address.
 */

app.use(express.static(join(__dirname, "..", "public")));
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, `${join(__dirname, "..", "public", "images", "upload")}`);
  },
  filename: (_req, file, cb) => {
    cb(null, `${v4()}_${file.originalname}`);
  },
});
const filter: any = (_req: Request, file: any, cb: FileFilterCallback) => {
  if (file.mimetype === "image/jpg" || "image/png" || "image/jpeg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
app.use(multer({ storage: storage, fileFilter: filter }).fields([])); // 2

app.listen(SERVER_PORT, () => {
  console.log(`Server is running at http://${SERVER_DOMAIN}:${SERVER_PORT}`);

  // API ROUTES
  app.use("/api/auth", AuthRouter);
  app.use("/api/user", UserRouter);
});
