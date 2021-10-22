import axios from 'axios';
import prismaClient from '../prisma';
import { sign } from "jsonwebtoken";

// 1 - receber o code(string)
// 2 - recuperar o acess_token no github
// 2 - recuperar info do user no github
// 3 - Verificar se o usuario existe no DB
        //SIM - GERA UM TOKEN
        //NÃO -  CRIA NO BD E GERA UM TOKEN
//4 - RETORNA UM TOKEN COM AS INFO DO USER

interface IAccessTokenResponse{
    access_token: string;
}

interface IUserResponse {
    avatar_url: string;
    login: string;
    id: number;
    name: string;

}

class AuthenticatedUserService {

    async execute(code: String){
        const url = "https://github.com/login/oauth/access_token";

        const { data: accessTokenResponse } = await axios.post<IAccessTokenResponse>(url,null, {
            params:{
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
                headers: {
                    "Accept": "application/json",
                },
        });

        const response = await axios.get<IUserResponse>("https://api.github.com/user", {
            headers: {
                authorization: `Bearer ${accessTokenResponse.access_token}`,
            },
        });

        const { login, id, avatar_url, name} = response.data;

        let user =  await prismaClient.user.findFirst({
            where: {
                github_id: id
            },
        });

        if(!user){
            user = await prismaClient.user.create({
                data:{
                   github_id: id,
                   login,
                   avatar_url,
                   name,
                },
            });
        }
        
        const token = sign(
            {
            user:{
               name: user.name,
               avatar_ur: user.avatar_url,
               id: user.id
            }},
        process.env.JWT_SECRET,
        {
           subject: user.id,
           expiresIn: "1d"
        }
        )
        
        return {token, user };
    }
}

export { AuthenticatedUserService}


//toda resposta do axios através de uma requisição, fica dentro do "data"