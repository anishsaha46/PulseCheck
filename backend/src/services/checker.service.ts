import axios from "axios";
export const checkerService = {
    async checkEndpoint(url:string,method="GET"){
        const startTime = Date.now()
        try{
            const response = await axios({
                url,
                method,
                timeout:10000,
                validateStatus:()=>true,
            })

            const responseTime=Date.now()-startTime
            return{
                status:response.status<400 ? "up" : "down",
                statusCode:response.status,
                responseTime,
                timestamp:new Date(),
            }
        }catch(error:any){
            const responseTime = Date.now()-startTime
            return{
                status:"down",
                statusCode:0,
                responseTime,
                error:error.message,
                timestamp:Date.now(),
            }
        }
    }
}