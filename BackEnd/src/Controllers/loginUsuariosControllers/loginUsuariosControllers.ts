import { Request, Response } from "express";
import LoginUsuariosServices from "../../Services/loginUsuariosServices/loginUsuariosServices";

class loginUsuariosControllers{
    async logarUsuario(req: Request, res: Response){
        const {email, senha} = req.body
        const enviarDados = new LoginUsuariosServices()
        const resposta = await enviarDados.logarUsuario({
            email,
            senha
        })
        return res.json(resposta)
    }
}

export default loginUsuariosControllers