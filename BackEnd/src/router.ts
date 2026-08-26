import { Router } from "express";
//import multer from 'multer'


const router = Router()


//Importação dos controllers
import usuariosControllers from "./Controllers/usuariosControllers";
import ongsControllers from "./Controllers/ongsControllers";

//endpoints POST
router.post('/CriarUsuarios', new usuariosControllers().criarUsuarios)

//endpoints GET
router.post('/visualizarDadosUnico', new usuariosControllers().visualizarDadosUnico)
router.get('/visualizarDadosGeral', new usuariosControllers().visualizarDadosGeral)

//endpoints PUT
router.put('/atualizarDadosUsuario', new usuariosControllers().atualizarDadosUsuario)

//endpoints DELETE
router.delete('/deletarUsuarios', new usuariosControllers().deletarUsuario)

//ONGS
router.post('/CriarOng', new ongsControllers().criarOng)

router.delete('/DeletarONG', new ongsControllers().deletarOng)
router.put('/atualizarONG', new ongsControllers().atualizarONG)
router.get('/visualizarONG', new ongsControllers().visualizarONG)

export default router;