import { Router } from "express";
//import multer from 'multer'


const router = Router()
//const multer = multer(uploadConfig.uploead('./tmp'))

//Importação dos controllers
import usuariosControllers from "./Controllers/usuariosControllers";

//endpoints POST
router.post('/CriarUsuarios', new usuariosControllers().criarUsuarios)

//endpoints GET

//endpoints PUT

//endpoints DELETE
export default router