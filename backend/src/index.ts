import app from "./app"
import { startScheduler } from "./workers/schedular"
import { config } from "./config/env"

const PORT = config.PORT || 5000

async function startServer(){
    try{
        console.log("[API MONITOR] Starting Server")

        startScheduler()
        app.listen(PORT,()=>{
            console.log(`[API MONITOR] Server running on port ${PORT}`)
        })
    }catch(error){
        console.error("[API MONITOR] Error:", error)
        process.exit(1)
    }
}

startServer()
