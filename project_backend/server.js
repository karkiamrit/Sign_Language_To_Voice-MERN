const app=require('./app');
const connectDatabase=require('./config/database');

process.on('uncaughtException',(err)=>{
    console.error(`Error: ${err.message}`);
    console.log(`Shutting down the server due to uncaught exception`);
    process.exit(1);
});


connectDatabase();

const server=app.listen(process.env.PORT,()=>{
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
})

process.on('unhandledRejection',(err)=>{
    console.error(`Error: ${err.message}`);
    console.log(`Shutting down the server due to unhandled promise rejection`);
    server.close(()=>{
        process.exit(1);
    });
   
});
