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
import PetsTinderControllers from "./Controllers/petsTinderControllers";
import AdminControllers from "./Controllers/adminControllers/adminCotrollers";


//endpoints POST
router.post('/CadastrarUsuarios', uploead.single('file'), new usuariosControllers().criarUsuarios)
router.post('/CadastrarONG', uploead.single('file'), new ongsControllers().criarOng)
router.post ('/CriarPublicacao', uploead.single('file'), estaAutenticado, new publicacoesControllers().publicarPost)
router.post ('/CriarFavorito', estaAutenticado, new favoritosControllers().criarFavorito)
router.post('/logarUsuario', new loginUsuariosControllers().logarUsuario)
router.post('/logarONGs', new loginONGsControllers().logarONG)
router.post('/CriarPetTinder', uploead.single('file'), estaAutenticado, new PetsTinderControllers().criarPet)
// Rota usada pelo Insomnia para criar a primeira conta administrativa.
router.post('/CadastrarAdmin', new AdminControllers().criarAdministrador)


//endpoints GET
router.get('/visualizarDadosUnico', estaAutenticado, new usuariosControllers().visualizarDadosUnico)
router.get('/visualizarDadosGeral', estaAutenticado, new usuariosControllers().visualizarDadosGeral)
router.get('/visualizarONG', estaAutenticado, new ongsControllers().visualizarONG)
router.get('/visualizarFavorito', estaAutenticado, new favoritosControllers().visualizarFavorito)
// O feed é público; autenticação continua obrigatória para criar, editar e excluir.
router.get('/visualizarPublicacao', new publicacoesControllers().visualizarPublicacoes)
router.get('/visualizarPetsTinder', new PetsTinderControllers().listarPets)


//endpoints PUT
router.put('/atualizarDadosUsuario', estaAutenticado, new usuariosControllers().atualizarDadosUsuario)
router.put('/atualizarFotoPerfil', uploead.single('file'), estaAutenticado, new usuariosControllers().atualizarFotoPerfil)
router.put('/atualizarFotoCapa', uploead.single('file'), estaAutenticado, new usuariosControllers().atualizarFotoCapa)
router.put('/atualizarDadosONG', uploead.single('file'), estaAutenticado, new ongsControllers().atualizarONG)
router.put('/atualizarDadosPublicacao', uploead.single('file'), estaAutenticado, new publicacoesControllers().atualizarPublicacao)

//endpoints DELETE
router.delete('/deletarUsuarios', estaAutenticado, new usuariosControllers().deletarUsuario)
router.delete('/deletarONG', estaAutenticado, new ongsControllers().deletarOng)
router.delete('/deletarPublicacao', estaAutenticado, new publicacoesControllers().deletarPublicacao)
router.delete('/deletarFavorito', estaAutenticado, new favoritosControllers().deletarFavorito)




export default router;
