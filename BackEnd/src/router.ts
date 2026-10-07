import { Router } from "express";
import { estaAutenticado } from "./middleware/Autenticado";
import multer from 'multer'
import uploadConfig from './config/multer'
//import multer from 'multer'


const router = Router()
const uploead = multer(uploadConfig.uploead('./tmp'))


//Importação dos controllers
import usuariosControllers from "./Controllers/usuariosControllers";
import ongsControllers from "./Controllers/ongsControllers";
import publicacoesControllers from "./Controllers/publicacoesControllers"
import favoritosControllers from "./Controllers/favoritosControllers";
import loginUsuariosControllers from "./Controllers/loginUsuariosControllers/loginUsuariosControllers";
import loginONGsControllers from "./Controllers/loginONGsControllers/loginONGsControllers";
import adminControllers from "./Controllers/adminControllers/adminCotrollers";
import loginAdminControllers from "./Controllers/loginAdminControllers/loginAdminControllers";

//endpoints POST
router.post('/CadastrarUsuarios', uploead.single('file'), new usuariosControllers().criarUsuarios)
router.post('/CadastrarONG', uploead.single('file'), new ongsControllers().criarOng)
router.post ('/CriarPublicacao', uploead.single('file'), estaAutenticado, new publicacoesControllers().publicarPost)
router.post ('/CriarFavorito', estaAutenticado, new favoritosControllers().criarFavorito)
router.post('/logarUsuario', new loginUsuariosControllers().logarUsuario)
router.post ('/logarONGs', new loginONGsControllers().logarONG)
router.post('/criarAdmin', new adminControllers().criarAdmin )
router.post('/loginAdmin', new adminControllers().criarAdmin)

//endpoints GET
router.get('/visualizarDadosUnico', estaAutenticado, new usuariosControllers().visualizarDadosUnico)
router.get('/visualizarDadosGeral', estaAutenticado, new usuariosControllers().visualizarDadosGeral)
router.get('/visualizarONG', estaAutenticado, new ongsControllers().visualizarONG)
router.get('/visualizarFavorito', estaAutenticado, new favoritosControllers().visualizarFavorito)
router.get('/visualizarPublicacao', estaAutenticado, new publicacoesControllers().visualizarPublicacoes)


//endpoints PUT
router.put('/atualizarDadosUsuario', uploead.single('file'), estaAutenticado, new usuariosControllers().atualizarDadosUsuario)
router.put('/atualizarDadosONG', uploead.single('file'), estaAutenticado, new ongsControllers().atualizarONG)
router.put('/atualizarDadosPublicacao', uploead.single('file'), estaAutenticado, new publicacoesControllers().atualizarPublicacao)

//endpoints DELETE
router.delete('/deletarUsuarios', estaAutenticado, new usuariosControllers().deletarUsuario)
router.delete('/deletarONG', estaAutenticado, new ongsControllers().deletarOng)
router.delete('/deletarPublicacao', estaAutenticado, new publicacoesControllers().deletarPublicacao)
router.delete('/deletarFavorito', estaAutenticado, new favoritosControllers().deletarFavorito)




export default router;