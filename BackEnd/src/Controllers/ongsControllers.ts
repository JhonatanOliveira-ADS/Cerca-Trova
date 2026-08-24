import ongsServices from "../Services/ongsServices";
import { Request, Response } from "express";

class ongsControllers {
    async criarOng(req: Request, res: Response) {
        const { id_usuario, nome, descricao, foto, cidade, estado, telefone, instagram, site } = req.body
        const enviarDadosServices = new ongsServices()
        const resposta = await enviarDadosServices.criarOng({
            id_usuario,
            nome,
            descricao,
            foto,
            cidade,
            estado,
            telefone,
            instagram,
            site
        })
        return res.json(resposta)

    }

}
export default ongsControllers